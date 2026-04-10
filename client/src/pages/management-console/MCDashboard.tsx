import { trpc } from "@/lib/trpc";
import { AlertCircle, Mail, Package, ShoppingBag, Users } from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "Bekliyor",
  processing: "İşleniyor",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function MCDashboard() {
  const { data: stats, isLoading, error } = trpc.admin.stats.useQuery(undefined, { retry: false });

  const statCards = [
    {
      label: "Toplam Kullanıcı",
      value: stats?.userCount ?? 0,
      icon: Users,
      description: "Kayıtlı hesap",
    },
    {
      label: "Ürün",
      value: stats?.productCount ?? 0,
      icon: Package,
      description: "Katalogdaki ürün",
    },
    {
      label: "Sipariş",
      value: stats?.orderCount ?? 0,
      icon: ShoppingBag,
      description: "Toplam sipariş",
    },
    {
      label: "Bülten Abonesi",
      value: stats?.newsletterCount ?? 0,
      icon: Mail,
      description: "Aktif abone",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl">
      <div>
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">
          Genel Bakış
        </p>
        <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">
          Dashboard
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div
            key={card.label}
            className="bg-card border border-border/50 rounded p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs tracking-wider uppercase text-muted-foreground font-light">
                {card.label}
              </p>
              <card.icon className="h-4 w-4 text-muted-foreground/60" />
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <p className="font-['Cormorant_Garamond'] text-4xl font-light">{card.value}</p>
            )}
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border/50 rounded">
        <div className="px-6 py-4 border-b border-border/40">
          <h2 className="font-['Cormorant_Garamond'] text-xl font-light tracking-wide">
            Son Siparişler
          </h2>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !stats?.recentOrders?.length ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Henüz sipariş bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left px-6 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal">
                    Sipariş No
                  </th>
                  <th className="text-left px-6 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal">
                    Toplam
                  </th>
                  <th className="text-left px-6 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal">
                    Durum
                  </th>
                  <th className="text-left px-6 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal">
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr
                    key={order.id}
                    className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs">{order.orderNumber}</td>
                    <td className="px-6 py-4">₺{Number(order.totalPrice).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[order.status ?? "pending"]}`}
                      >
                        {statusLabels[order.status ?? "pending"]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
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
