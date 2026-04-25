import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Eye, FileCheck } from "lucide-react";
import { useState } from "react";
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

function OrderDetailDialog({ orderId, open, onClose }: { orderId: number | null; open: boolean; onClose: () => void }) {
  const { data: order, isLoading } = trpc.admin.orders.detail.useQuery(
    { id: orderId! },
    { enabled: !!orderId && open, retry: false },
  );

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">
            Sipariş Detayı
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !order ? (
          <p className="text-sm text-muted-foreground py-4">Sipariş bulunamadı.</p>
        ) : (
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-1">Sipariş No</p>
                <p className="font-mono text-xs">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-1">Toplam</p>
                <p className="font-medium">₺{Number(order.totalPrice).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-1">Durum</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[order.status as OrderStatus ?? "pending"]}`}>
                  {statusLabels[order.status as OrderStatus ?? "pending"]}
                </span>
              </div>
              <div>
                <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-1">Tarih</p>
                <p className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("tr-TR")}</p>
              </div>
              {order.shippingAddress && (
                <div className="col-span-2">
                  <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-1">Teslimat Adresi</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{order.shippingAddress}</p>
                </div>
              )}
              {order.trackingNumber && (
                <div className="col-span-2">
                  <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-1">Takip No</p>
                  <p className="font-mono text-xs">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Ödeme & Fatura */}
            <div className="pt-3 border-t border-border/40 space-y-2">
              <p className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                Ödeme & Fatura
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <span className="text-muted-foreground">Ödeme Yöntemi</span>
                <span>{order.paymentMethod ?? "—"}</span>
                <span className="text-muted-foreground">Ödeme Durumu</span>
                <span className={order.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"}>
                  {order.paymentStatus === "paid"
                    ? "Ödendi"
                    : order.paymentStatus === "failed"
                      ? "Başarısız"
                      : order.paymentStatus === "refunded"
                        ? "İade Edildi"
                        : "Bekliyor"}
                </span>
                <span className="text-muted-foreground">Fatura No</span>
                <span>{order.invoiceNumber ?? "—"}</span>
                <span className="text-muted-foreground">Fatura Durumu</span>
                <span>
                  {order.invoiceStatus === "issued"
                    ? "Kesildi"
                    : order.invoiceStatus === "cancelled"
                      ? "İptal"
                      : "Kesilmedi"}
                </span>
                {order.paidAt && (
                  <>
                    <span className="text-muted-foreground">Ödeme Tarihi</span>
                    <span>{new Date(order.paidAt).toLocaleDateString("tr-TR")}</span>
                  </>
                )}
              </div>
            </div>

            {/* Fatura bilgileri (varsa) */}
            {order.billingName && (
              <div className="pt-3 border-t border-border/40 space-y-2">
                <p className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                  Fatura Adresi
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <span className="text-muted-foreground">Ad / Ünvan</span>
                  <span>{order.billingName}</span>
                  {order.taxNumber && (
                    <>
                      <span className="text-muted-foreground">Vergi / TC No</span>
                      <span>{order.taxNumber}</span>
                    </>
                  )}
                  <span className="text-muted-foreground">Adres</span>
                  <span>{order.billingAddress ?? "—"}</span>
                </div>
              </div>
            )}

            {order.items?.length > 0 && (
              <div>
                <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-3">Ürünler</p>
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                      {item.productImageUrl ? (
                        <img
                          src={item.productImageUrl}
                          alt={item.productNameTR ?? ""}
                          className="h-12 w-10 object-cover rounded border border-border/30 shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-10 bg-muted rounded border border-border/30 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.productNameTR ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} adet × ₺{Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-medium shrink-0">
                        ₺{(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function MCOrders() {
  const utils = trpc.useUtils();
  const { data: orders, isLoading, error } = trpc.admin.orders.list.useQuery(undefined, { retry: false });
  const [detailId, setDetailId] = useState<number | null>(null);
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
      <OrderDetailDialog
        orderId={detailId}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
      />

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
                  {["Sipariş No", "Toplam", "Ülke", "Takip No", "Durum", "Ödeme", "Fatura", "Tarih", ""].map(h => (
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
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : order.paymentStatus === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {order.paymentStatus === "paid"
                          ? "Ödendi"
                          : order.paymentStatus === "failed"
                            ? "Başarısız"
                            : order.paymentStatus === "refunded"
                              ? "İade"
                              : "Bekliyor"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {order.invoiceStatus === "issued" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <FileCheck className="h-3 w-3" />
                          {order.invoiceNumber ?? "Kesildi"}
                        </span>
                      ) : order.invoiceStatus === "cancelled" ? (
                        <span className="text-xs text-red-500">İptal</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setDetailId(order.id)}
                        className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        title="Detayları görüntüle"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
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
