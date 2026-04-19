import { trpc } from "@/lib/trpc";
import { AlertCircle, TrendingUp } from "lucide-react";

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(value);
}

export default function MCRevenue() {
  const { data: stats, isLoading, error } = trpc.admin.revenue.stats.useQuery(undefined, { retry: false });

  const summaryCards = [
    {
      label: "Toplam Gelir",
      value: stats?.totalRevenue ?? 0,
      description: "İptal hariç tüm siparişler",
    },
    {
      label: "Bu Ay",
      value: stats?.monthRevenue ?? 0,
      description: "Mevcut ay geliri",
    },
    {
      label: "Son 7 Gün",
      value: stats?.weekRevenue ?? 0,
      description: "Son bir hafta",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">
            Finansal Özet
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">
            Gelir Analizi
          </h1>
        </div>
        <TrendingUp className="h-5 w-5 text-muted-foreground/40" />
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map(card => (
          <div
            key={card.label}
            className="bg-card border border-border/50 rounded p-5 space-y-3"
          >
            <p className="text-xs tracking-wider uppercase text-muted-foreground font-light">
              {card.label}
            </p>
            {isLoading ? (
              <div className="h-9 w-32 bg-muted animate-pulse rounded" />
            ) : (
              <p className="font-['Cormorant_Garamond'] text-3xl font-light">
                {formatCurrency(card.value)}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="bg-card border border-border/50 rounded">
        <div className="px-6 py-4 border-b border-border/40">
          <h2 className="font-['Cormorant_Garamond'] text-xl font-light tracking-wide">
            Durum Bazlı Dağılım
          </h2>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !stats?.statusBreakdown?.length ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Henüz sipariş verisi bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {["Durum", "Sipariş Sayısı", "Toplam Tutar"].map(h => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.statusBreakdown.map(row => (
                  <tr
                    key={row.status}
                    className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[row.status ?? "pending"]}`}
                      >
                        {statusLabels[row.status ?? "pending"]}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-['Cormorant_Garamond'] text-lg font-light">
                      {row.orderCount}
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Products */}
      <div className="bg-card border border-border/50 rounded">
        <div className="px-6 py-4 border-b border-border/40">
          <h2 className="font-['Cormorant_Garamond'] text-xl font-light tracking-wide">
            En Çok Satan Ürünler
          </h2>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !stats?.topProducts?.length ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Henüz sipariş kalemi bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {["#", "Ürün", "Satış Adedi", "Toplam Gelir"].map(h => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((product, idx) => (
                  <tr
                    key={product.productId}
                    className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-['Cormorant_Garamond'] text-lg font-light text-muted-foreground">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.nameTR}
                            className="h-10 w-8 object-cover rounded border border-border/30"
                          />
                        ) : (
                          <div className="h-10 w-8 bg-muted rounded border border-border/30" />
                        )}
                        <span className="font-medium">{product.nameTR}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-['Cormorant_Garamond'] text-lg font-light">
                        {product.totalQty}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">adet</span>
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(product.totalRevenue)}
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
