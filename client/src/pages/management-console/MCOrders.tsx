import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

const statuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusLabels: Record<OrderStatus, string> = {
  pending: "Bekliyor",
  processing: "İşleniyor",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal",
};

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function MCOrders() {
  const utils = trpc.useUtils();
  const { data: orders, isLoading, error } = trpc.admin.orders.list.useQuery(undefined, { retry: false });
  const updateStatus = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.admin.orders.list.invalidate();
      utils.admin.stats.invalidate();
      toast.success("Sipariş durumu güncellendi.");
    },
    onError: e => toast.error(e.message),
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      <div>
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">
          Sipariş Yönetimi
        </p>
        <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">
          Siparişler
        </h1>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Veri yüklenemedi</p>
            <p className="text-xs mt-0.5 text-amber-700">
              {error.message.includes("10002")
                ? "Bu verilere erişmek için admin yetkisi gereklidir."
                : error.message.includes("10001")
                ? "Verileri görüntülemek için giriş yapmanız gereklidir."
                : "Veritabanı bağlantısı kurulamadı. DATABASE_URL ortam değişkenini kontrol edin."}
            </p>
          </div>
        </div>
      )}

      <div className="bg-card border border-border/50 rounded overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !orders?.length ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Henüz sipariş bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {["Sipariş No", "Toplam", "Ülke", "Takip No", "Durum", "Tarih"].map(h => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr
                    key={order.id}
                    className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs">{order.orderNumber}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      ₺{Number(order.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {order.shippingCountry || "—"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {order.trackingNumber || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <Select
                        value={order.status ?? "pending"}
                        onValueChange={value =>
                          updateStatus.mutate({
                            id: order.id,
                            status: value as OrderStatus,
                          })
                        }
                      >
                        <SelectTrigger className="h-7 w-36 text-xs border-0 p-0 shadow-none focus:ring-0">
                          <SelectValue>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[order.status as OrderStatus ?? "pending"]}`}
                            >
                              {statusLabels[order.status as OrderStatus ?? "pending"]}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map(s => (
                            <SelectItem key={s} value={s} className="text-xs">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[s]}`}>
                                {statusLabels[s]}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
