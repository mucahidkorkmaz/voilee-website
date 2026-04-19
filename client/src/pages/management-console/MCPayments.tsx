import { trpc } from "@/lib/trpc";
import { AlertCircle, CreditCard } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};
const statusLabels: Record<string, string> = {
  pending: "Bekliyor", processing: "İşleniyor", shipped: "Kargoda",
  delivered: "Teslim Edildi", cancelled: "İptal",
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(v);
}

export default function MCPayments() {
  const { data: orders, isLoading, error } = trpc.admin.orders.list.useQuery(undefined, { retry: false });

  const totalRevenue = orders?.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + Number(o.totalPrice), 0) ?? 0;
  const paidOrders = orders?.filter(o => o.status === "delivered").length ?? 0;
  const pendingOrders = orders?.filter(o => o.status === "pending" || o.status === "processing").length ?? 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Finans</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">Ödemeler</h1>
        </div>
        <CreditCard className="h-5 w-5 text-muted-foreground/40" />
      </div>

      {error && <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><p>Veri yüklenemedi.</p></div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Toplam Ciro", value: formatCurrency(totalRevenue), sub: "İptal hariç" },
          { label: "Tamamlanan", value: paidOrders.toString(), sub: "Teslim edilmiş sipariş" },
          { label: "Bekleyen", value: pendingOrders.toString(), sub: "İşlem bekleyen" },
        ].map(card => (
          <div key={card.label} className="bg-card border border-border/50 rounded p-5 space-y-3">
            <p className="text-xs tracking-wider uppercase text-muted-foreground font-light">{card.label}</p>
            {isLoading ? <div className="h-9 w-32 bg-muted animate-pulse rounded" /> : (
              <p className="font-['Cormorant_Garamond'] text-3xl font-light">{card.value}</p>
            )}
            <p className="text-xs text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border/50 rounded">
        <div className="px-6 py-4 border-b border-border/40">
          <h2 className="font-['Cormorant_Garamond'] text-xl font-light tracking-wide">Ödeme İşlemleri</h2>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}</div>
        ) : !orders?.length ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Henüz sipariş yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {["Sipariş No", "Tutar", "Ülke", "Durum", "Tarih"].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{order.orderNumber}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(Number(order.totalPrice))}</td>
                    <td className="px-6 py-4 text-muted-foreground">{order.shippingCountry || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[order.status ?? "pending"]}`}>
                        {statusLabels[order.status ?? "pending"]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString("tr-TR")}</td>
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
