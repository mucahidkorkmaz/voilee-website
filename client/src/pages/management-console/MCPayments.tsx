import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CreditCard,
  Minus,
  RotateCcw,
  TrendingUp,
  Wallet,
} from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};
const statusLabels: Record<string, string> = {
  pending: "Bekliyor",
  processing: "İşleniyor",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal",
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(v);
}

function MiniBarChart({
  data,
  height = 120,
}: {
  data: { label: string; value: number; secondary?: number }[];
  height?: number;
}) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-[3px] w-full" style={{ height }}>
      {data.map((d, i) => {
        const barH = Math.max((d.value / maxVal) * height * 0.85, 2);
        const secH = d.secondary
          ? Math.max((d.secondary / maxVal) * height * 0.85, 0)
          : 0;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center justify-end gap-0 group relative"
            style={{ height }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {formatCurrency(d.value)}
              {d.secondary ? ` / İade: ${formatCurrency(d.secondary)}` : ""}
            </div>
            {secH > 0 && (
              <div
                className="w-full bg-red-300/60 rounded-t-sm"
                style={{ height: secH }}
              />
            )}
            <div
              className="w-full bg-primary/70 rounded-t-sm group-hover:bg-primary transition-colors"
              style={{ height: barH }}
            />
            <span className="text-[8px] text-muted-foreground mt-1 truncate w-full text-center">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function MCPayments() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = trpc.admin.revenue.stats.useQuery(undefined, { retry: false });
  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError,
  } = trpc.admin.orders.list.useQuery(undefined, { retry: false });

  const isLoading = statsLoading || ordersLoading;
  const error = statsError || ordersError;

  const returnedSet = new Set(stats?.returnedOrderNumbers ?? []);

  const nonCancelledOrders =
    orders?.filter((o) => o.status !== "cancelled") ?? [];
  const paidOrders =
    nonCancelledOrders.filter((o) => o.status === "delivered").length ?? 0;
  const pendingOrders =
    nonCancelledOrders.filter(
      (o) => o.status === "pending" || o.status === "processing",
    ).length ?? 0;
  const returnedOrders = nonCancelledOrders.filter((o) =>
    returnedSet.has(o.orderNumber),
  ).length;

  const kpiCards = [
    {
      label: "Net Gelir",
      value: stats?.netRevenue ?? 0,
      icon: Wallet,
      desc: "Brüt gelir − iadeler",
      highlight: true,
    },
    {
      label: "Brüt Gelir",
      value: stats?.totalRevenue ?? 0,
      icon: TrendingUp,
      desc: `${stats?.totalOrderCount ?? 0} sipariş`,
    },
    {
      label: "Toplam İadeler",
      value: stats?.totalRefunds ?? 0,
      icon: RotateCcw,
      desc: `${stats?.processedReturnCount ?? 0} tamamlanan iade`,
      negative: true,
    },
    {
      label: "Toplam Giderler",
      value: stats?.totalExpenses ?? 0,
      icon: ArrowDownRight,
      desc: "Tüm gider kalemleri",
      negative: true,
    },
    {
      label: "Kâr",
      value: stats?.profit ?? 0,
      icon: Banknote,
      desc: "Net gelir − giderler",
      highlight: true,
    },
    {
      label: "Ort. Sepet",
      value: stats?.avgOrderValue ?? 0,
      icon: CreditCard,
      desc: "Sipariş başı ortalama",
    },
  ];

  const periodCards = [
    {
      label: "Bu Ay Brüt",
      value: stats?.monthRevenue ?? 0,
      desc: `${stats?.monthOrderCount ?? 0} sipariş`,
    },
    {
      label: "Bu Ay İade",
      value: stats?.monthRefunds ?? 0,
      desc: "İade toplamı",
      negative: true,
    },
    {
      label: "Bu Ay Net",
      value: stats?.netMonthRevenue ?? 0,
      desc: "Net gelir",
      highlight: true,
    },
    {
      label: "Bu Ay Gider",
      value: stats?.monthExpenses ?? 0,
      desc: "Aylık giderler",
      negative: true,
    },
    {
      label: "Bu Ay Kâr",
      value: stats?.monthProfit ?? 0,
      desc: "Aylık kâr",
      highlight: true,
    },
    {
      label: "Son 7 Gün",
      value: stats?.weekRevenue ?? 0,
      desc: "Haftalık brüt",
    },
  ];

  const monthlyChartData = (stats?.monthlyRevenue ?? []).map((m) => {
    const parts = m.month.split("-");
    const monthNames = [
      "Oca",
      "Şub",
      "Mar",
      "Nis",
      "May",
      "Haz",
      "Tem",
      "Ağu",
      "Eyl",
      "Eki",
      "Kas",
      "Ara",
    ];
    return {
      label: monthNames[parseInt(parts[1], 10) - 1] ?? parts[1],
      value: m.revenue,
      secondary: m.refunds,
    };
  });

  const dailyChartData = (stats?.dailyRevenue ?? []).slice(-14).map((d) => {
    const parts = d.date.split("-");
    return {
      label: `${parts[2]}/${parts[1]}`,
      value: d.revenue,
      secondary: d.refunds,
    };
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">
            Finans
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">
            Finansal Özet
          </h1>
        </div>
        <CreditCard className="h-5 w-5 text-muted-foreground/40" />
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>Veri yüklenemedi.</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((card) => {
          const isNeg = card.negative || card.value < 0;
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
              <div className="flex items-center justify-between">
                <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">
                  {card.label}
                </p>
                <card.icon className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
              {isLoading ? (
                <div className="h-7 w-20 bg-muted animate-pulse rounded" />
              ) : (
                <p className={`font-['Cormorant_Garamond'] text-xl font-light ${colorClass}`}>
                  {card.negative ? "−" : ""}
                  {formatCurrency(card.negative ? Math.abs(card.value) : card.value)}
                </p>
              )}
              <p className="text-[9px] text-muted-foreground">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Period Summary */}
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
              className={`bg-card border rounded p-3 space-y-1.5 ${
                card.highlight
                  ? "border-primary/30 bg-primary/[0.02]"
                  : "border-border/50"
              }`}
            >
              <p className="text-[9px] tracking-wider uppercase text-muted-foreground font-light">
                {card.label}
              </p>
              {isLoading ? (
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <p className={`font-['Cormorant_Garamond'] text-lg font-light ${colorClass}`}>
                  {card.negative ? "−" : ""}
                  {formatCurrency(card.negative ? Math.abs(card.value) : card.value)}
                </p>
              )}
              <p className="text-[9px] text-muted-foreground">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        <div className="bg-card border border-border/50 rounded p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-['Cormorant_Garamond'] text-lg font-light tracking-wide">
              Aylık Gelir Trendi
            </h2>
            <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary/70 rounded-sm" />
                Gelir
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-300/60 rounded-sm" />
                İade
              </span>
            </div>
          </div>
          {isLoading ? (
            <div className="h-32 bg-muted animate-pulse rounded" />
          ) : monthlyChartData.length > 0 ? (
            <MiniBarChart data={monthlyChartData} height={130} />
          ) : (
            <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
              Henüz veri yok
            </div>
          )}
        </div>

        {/* Daily Chart */}
        <div className="bg-card border border-border/50 rounded p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-['Cormorant_Garamond'] text-lg font-light tracking-wide">
              Son 14 Gün
            </h2>
            <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary/70 rounded-sm" />
                Gelir
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-300/60 rounded-sm" />
                İade
              </span>
            </div>
          </div>
          {isLoading ? (
            <div className="h-32 bg-muted animate-pulse rounded" />
          ) : dailyChartData.length > 0 ? (
            <MiniBarChart data={dailyChartData} height={130} />
          ) : (
            <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
              Henüz veri yok
            </div>
          )}
        </div>
      </div>

      {/* Gelir/Gider Tablosu */}
      {!isLoading && stats && (
        <div className="bg-card border border-border/50 rounded">
          <div className="px-6 py-4 border-b border-border/40">
            <h2 className="font-['Cormorant_Garamond'] text-xl font-light tracking-wide">
              Kâr / Zarar Özeti
            </h2>
          </div>
          <div className="divide-y divide-border/30">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                <span className="text-sm">Brüt Satış Geliri</span>
              </div>
              <span className="font-['Cormorant_Garamond'] text-lg font-light text-emerald-700">
                {formatCurrency(stats.totalRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between px-6 py-3 bg-red-50/30">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-red-400" />
                <span className="text-sm">İade Toplamı</span>
                <span className="text-[10px] text-muted-foreground">
                  ({stats.processedReturnCount} iade)
                </span>
              </div>
              <span className="font-['Cormorant_Garamond'] text-lg font-light text-red-600">
                −{formatCurrency(stats.totalRefunds)}
              </span>
            </div>
            <div className="flex items-center justify-between px-6 py-3 bg-primary/[0.02]">
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Net Satış Geliri</span>
              </div>
              <span className="font-['Cormorant_Garamond'] text-lg font-light font-medium">
                {formatCurrency(stats.netRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between px-6 py-3 bg-red-50/30">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-red-400" />
                <span className="text-sm">Toplam Giderler</span>
              </div>
              <span className="font-['Cormorant_Garamond'] text-lg font-light text-red-600">
                −{formatCurrency(stats.totalExpenses)}
              </span>
            </div>
            {(stats.expensesByCategory ?? []).map((ec) => (
              <div
                key={ec.category}
                className="flex items-center justify-between px-6 py-2 pl-12 text-muted-foreground"
              >
                <span className="text-xs">{expenseCategoryLabels[ec.category] ?? ec.category}</span>
                <span className="text-xs">
                  −{formatCurrency(ec.total)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between px-6 py-4 bg-primary/[0.04]">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">NET KÂR / ZARAR</span>
              </div>
              <span
                className={`font-['Cormorant_Garamond'] text-2xl font-light ${
                  stats.profit >= 0 ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {stats.profit < 0 ? "−" : ""}
                {formatCurrency(Math.abs(stats.profit))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-card border border-border/50 rounded">
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
          <h2 className="font-['Cormorant_Garamond'] text-xl font-light tracking-wide">
            Son Siparişler
          </h2>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              Toplam:{" "}
              <strong className="text-foreground">
                {nonCancelledOrders.length}
              </strong>
            </span>
            <span>
              Teslim: <strong className="text-foreground">{paidOrders}</strong>
            </span>
            <span>
              Bekleyen:{" "}
              <strong className="text-foreground">{pendingOrders}</strong>
            </span>
            <span>
              İade Yapılan:{" "}
              <strong className="text-red-600">{returnedOrders}</strong>
            </span>
          </div>
        </div>
        {ordersLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !orders?.length ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Henüz sipariş yok.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {[
                    "Sipariş No",
                    "Tutar",
                    "Ülke",
                    "Durum",
                    "İade",
                    "Tarih",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 30).map((order) => {
                  const hasReturn = returnedSet.has(order.orderNumber);
                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors ${
                        hasReturn ? "bg-red-50/40" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-mono text-xs">
                        {order.orderNumber}
                      </td>
                      <td
                        className={`px-6 py-4 font-medium ${hasReturn ? "line-through text-muted-foreground" : ""}`}
                      >
                        {formatCurrency(Number(order.totalPrice))}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {order.shippingCountry || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[order.status ?? "pending"]}`}
                        >
                          {statusLabels[order.status ?? "pending"]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {hasReturn ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                            <RotateCcw className="h-3 w-3" />
                            İade
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const expenseCategoryLabels: Record<string, string> = {
  shipping: "Kargo",
  advertising: "Reklam",
  material: "Malzeme / Hammadde",
  salary: "Maaş / Personel",
  rent: "Kira",
  tax: "Vergi",
  commission: "Komisyon",
  packaging: "Ambalaj",
  software: "Yazılım / Teknoloji",
  other: "Diğer",
};
