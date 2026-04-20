import { trpc } from "@/lib/trpc";
import { AlertCircle, RotateCcw, TrendingUp } from "lucide-react";
import { useState } from "react";

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
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

type ViewTab = "overview" | "monthly" | "daily";

function HorizontalBar({
  label,
  value,
  maxValue,
  color = "bg-primary/60",
}: {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0 text-right truncate">
        {label}
      </span>
      <div className="flex-1 bg-muted/40 rounded h-5 relative overflow-hidden">
        <div
          className={`h-full rounded ${color} transition-all`}
          style={{ width: `${Math.max(pct, 0.5)}%` }}
        />
        <span className="absolute inset-0 flex items-center pl-2 text-[10px] font-medium">
          {formatCurrency(value)}
        </span>
      </div>
    </div>
  );
}

export default function MCRevenue() {
  const {
    data: stats,
    isLoading,
    error,
  } = trpc.admin.revenue.stats.useQuery(undefined, { retry: false });
  const [viewTab, setViewTab] = useState<ViewTab>("overview");

  const revenueCards = [
    {
      label: "Brüt Gelir",
      value: stats?.totalRevenue ?? 0,
      description: `${stats?.totalOrderCount ?? 0} sipariş (iptal hariç)`,
    },
    {
      label: "İade Toplamı",
      value: stats?.totalRefunds ?? 0,
      description: `${stats?.processedReturnCount ?? 0} tamamlanan iade`,
      negative: true,
    },
    {
      label: "Net Gelir",
      value: stats?.netRevenue ?? 0,
      description: "Brüt gelir − iadeler",
      highlight: true,
    },
  ];

  const periodCards = [
    {
      label: "Bu Ay Brüt",
      value: stats?.monthRevenue ?? 0,
      description: `${stats?.monthOrderCount ?? 0} sipariş`,
    },
    {
      label: "Bu Ay İade",
      value: stats?.monthRefunds ?? 0,
      description: "Mevcut ay iadeleri",
      negative: true,
    },
    {
      label: "Bu Ay Net",
      value: stats?.netMonthRevenue ?? 0,
      description: "Mevcut ay net geliri",
      highlight: true,
    },
    {
      label: "Son 7 Gün",
      value: stats?.weekRevenue ?? 0,
      description: "Haftalık brüt gelir",
    },
    {
      label: "Son 7 Gün İade",
      value: stats?.weekRefunds ?? 0,
      description: "Haftalık iadeler",
      negative: true,
    },
    {
      label: "Ort. Sepet",
      value: stats?.avgOrderValue ?? 0,
      description: "Sipariş başı ortalama",
    },
  ];

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">
            Finansal Raporlar
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

      {/* Revenue vs Refunds */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {revenueCards.map((card) => {
          const colorClass = card.negative
            ? "text-red-600"
            : card.highlight
              ? card.value >= 0
                ? "text-emerald-700"
                : "text-red-600"
              : "";
          return (
            <div
              key={card.label}
              className={`bg-card border rounded p-5 space-y-3 ${
                card.highlight
                  ? "border-primary/30 bg-primary/[0.02]"
                  : "border-border/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs tracking-wider uppercase text-muted-foreground font-light">
                  {card.label}
                </p>
                {card.negative && (
                  <RotateCcw className="h-3.5 w-3.5 text-red-400" />
                )}
              </div>
              {isLoading ? (
                <div className="h-9 w-32 bg-muted animate-pulse rounded" />
              ) : (
                <p className={`font-['Cormorant_Garamond'] text-3xl font-light ${colorClass}`}>
                  {card.negative ? "−" : ""}
                  {formatCurrency(card.negative ? Math.abs(card.value) : card.value)}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Period Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {periodCards.map((card) => {
          const colorClass = card.negative
            ? "text-red-600"
            : card.highlight
              ? card.value >= 0
                ? "text-emerald-700"
                : "text-red-600"
              : "";
          return (
            <div
              key={card.label}
              className={`bg-card border rounded p-4 space-y-2 ${
                card.highlight
                  ? "border-primary/30 bg-primary/[0.02]"
                  : "border-border/50"
              }`}
            >
              <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">
                {card.label}
              </p>
              {isLoading ? (
                <div className="h-7 w-24 bg-muted animate-pulse rounded" />
              ) : (
                <p className={`font-['Cormorant_Garamond'] text-2xl font-light ${colorClass}`}>
                  {card.negative ? "−" : ""}
                  {formatCurrency(card.negative ? Math.abs(card.value) : card.value)}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-border/40 pb-0">
        {(
          [
            { key: "overview", label: "Genel Bakış" },
            { key: "monthly", label: "Aylık Detay" },
            { key: "daily", label: "Günlük Detay" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setViewTab(tab.key)}
            className={`px-4 py-2.5 text-xs tracking-wider uppercase font-light border-b-2 transition-colors ${
              viewTab === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {viewTab === "overview" && (
        <>
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
                  <div
                    key={i}
                    className="h-10 bg-muted animate-pulse rounded"
                  />
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
                      {["Durum", "Sipariş Sayısı", "Toplam Tutar", "Oran"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left px-6 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.statusBreakdown.map((row) => {
                      const totalOrders = stats.statusBreakdown.reduce(
                        (sum, r) => sum + r.orderCount,
                        0,
                      );
                      const pct =
                        totalOrders > 0
                          ? ((row.orderCount / totalOrders) * 100).toFixed(1)
                          : "0";
                      return (
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
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-muted/40 rounded-full h-1.5">
                                <div
                                  className="bg-primary/60 h-1.5 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Returns Warning */}
          {!isLoading && (stats?.activeReturnCount ?? 0) > 0 && (
            <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm">
              <RotateCcw className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">
                  {stats!.activeReturnCount} Aktif İade Talebi
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Bu talepler henüz işlenmedi. İşlendiklerinde gelir rakamları
                  güncellenecektir.
                </p>
              </div>
            </div>
          )}

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
                  <div
                    key={i}
                    className="h-12 bg-muted animate-pulse rounded"
                  />
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
                      {["#", "Ürün", "Satış Adedi", "Toplam Gelir"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left px-6 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal"
                          >
                            {h}
                          </th>
                        ),
                      )}
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
                            <span className="font-medium">
                              {product.nameTR}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-['Cormorant_Garamond'] text-lg font-light">
                            {product.totalQty}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            adet
                          </span>
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
        </>
      )}

      {/* Monthly Tab */}
      {viewTab === "monthly" && (
        <div className="bg-card border border-border/50 rounded">
          <div className="px-6 py-4 border-b border-border/40">
            <h2 className="font-['Cormorant_Garamond'] text-xl font-light tracking-wide">
              Aylık Gelir / İade / Gider Detayı
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Son 12 aylık dönem
            </p>
          </div>
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-muted animate-pulse rounded"
                />
              ))}
            </div>
          ) : !stats?.monthlyRevenue?.length ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Henüz aylık veri bulunmuyor.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    {[
                      "Ay",
                      "Sipariş",
                      "Brüt Gelir",
                      "İadeler",
                      "Giderler",
                      "Net Kâr",
                    ].map((h) => (
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
                  {stats.monthlyRevenue
                    .slice()
                    .reverse()
                    .map((m) => {
                      const parts = m.month.split("-");
                      const monthLabel =
                        monthNames[parseInt(parts[1], 10) - 1] ?? parts[1];
                      const net = m.revenue - m.refunds - m.expenses;
                      return (
                        <tr
                          key={m.month}
                          className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium">
                            {monthLabel} {parts[0]}
                          </td>
                          <td className="px-6 py-4 font-['Cormorant_Garamond'] text-lg font-light">
                            {m.orders}
                          </td>
                          <td className="px-6 py-4 text-emerald-700">
                            {formatCurrency(m.revenue)}
                          </td>
                          <td className="px-6 py-4 text-red-600">
                            {m.refunds > 0
                              ? `−${formatCurrency(m.refunds)}`
                              : "—"}
                          </td>
                          <td className="px-6 py-4 text-red-600">
                            {m.expenses > 0
                              ? `−${formatCurrency(m.expenses)}`
                              : "—"}
                          </td>
                          <td
                            className={`px-6 py-4 font-medium ${net >= 0 ? "text-emerald-700" : "text-red-600"}`}
                          >
                            {net < 0 ? "−" : ""}
                            {formatCurrency(Math.abs(net))}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {/* Monthly Bar Comparison */}
          {!isLoading && (stats?.monthlyRevenue?.length ?? 0) > 0 && (
            <div className="px-6 py-5 border-t border-border/40 space-y-3">
              <p className="text-xs tracking-wider uppercase text-muted-foreground font-light">
                Aylık Gelir Karşılaştırması
              </p>
              {stats!.monthlyRevenue.map((m) => {
                const parts = m.month.split("-");
                const label = `${monthNames[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
                const maxVal = Math.max(
                  ...stats!.monthlyRevenue.map((r) => r.revenue),
                  1,
                );
                return (
                  <HorizontalBar
                    key={m.month}
                    label={label}
                    value={m.revenue}
                    maxValue={maxVal}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Daily Tab */}
      {viewTab === "daily" && (
        <div className="bg-card border border-border/50 rounded">
          <div className="px-6 py-4 border-b border-border/40">
            <h2 className="font-['Cormorant_Garamond'] text-xl font-light tracking-wide">
              Günlük Gelir Detayı
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Son 30 günlük dönem
            </p>
          </div>
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-muted animate-pulse rounded"
                />
              ))}
            </div>
          ) : !stats?.dailyRevenue?.length ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Henüz günlük veri bulunmuyor.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    {["Tarih", "Sipariş", "Gelir", "İade", "Net"].map((h) => (
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
                  {stats.dailyRevenue
                    .slice()
                    .reverse()
                    .map((d) => {
                      const net = d.revenue - d.refunds;
                      return (
                        <tr
                          key={d.date}
                          className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-3 font-medium text-xs">
                            {new Date(d.date).toLocaleDateString("tr-TR", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </td>
                          <td className="px-6 py-3 font-['Cormorant_Garamond'] text-lg font-light">
                            {d.orders}
                          </td>
                          <td className="px-6 py-3 text-emerald-700">
                            {formatCurrency(d.revenue)}
                          </td>
                          <td className="px-6 py-3 text-red-600">
                            {d.refunds > 0
                              ? `−${formatCurrency(d.refunds)}`
                              : "—"}
                          </td>
                          <td
                            className={`px-6 py-3 font-medium ${net >= 0 ? "text-emerald-700" : "text-red-600"}`}
                          >
                            {formatCurrency(net)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {/* Daily Bar Chart */}
          {!isLoading && (stats?.dailyRevenue?.length ?? 0) > 0 && (
            <div className="px-6 py-5 border-t border-border/40 space-y-2">
              <p className="text-xs tracking-wider uppercase text-muted-foreground font-light">
                Günlük Gelir Dağılımı
              </p>
              {stats!.dailyRevenue.map((d) => {
                const label = new Date(d.date).toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "2-digit",
                });
                const maxVal = Math.max(
                  ...stats!.dailyRevenue.map((r) => r.revenue),
                  1,
                );
                return (
                  <HorizontalBar
                    key={d.date}
                    label={label}
                    value={d.revenue}
                    maxValue={maxVal}
                    color={
                      d.refunds > 0 ? "bg-amber-400/60" : "bg-primary/60"
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
