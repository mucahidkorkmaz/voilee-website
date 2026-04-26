import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Package,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import AccountLayout, { hesapUrls } from "../layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOrders, type OrderHistoryEntry } from "@/contexts/OrdersContext";
import { api } from "@/lib/api";

// ─── Translations ───────────────────────────────────────────────────────────────

const t = {
  TR: {
    overline: "Siparişlerim",
    title: "Sipariş Geçmişim",
    subtitle: "Geçmiş siparişlerinizi inceleyin ve durumlarını takip edin.",
    empty: "Henüz bir sipariş vermediniz.",
    emptyDesc:
      "İlk siparişinizi vermek için silüetlerimize göz atabilirsiniz.",
    explore: "Alışverişe Başla",
    orderNo: "Sipariş No",
    date: "Tarih",
    total: "Toplam",
    items: "Ürünler",
    status: "Durum",
    showMore: "Detayları Gör",
    showLess: "Detayları Gizle",
    detail: "Sipariş Detayı",
    qty: "Adet",
    shippingTo: "Teslimat",
    countOne: "sipariş",
    countMany: "sipariş",
    statuses: {
      pending: "Beklemede",
      confirmed: "Onaylandı",
      processing: "Hazırlanıyor",
      shipped: "Kargoya Verildi",
      delivered: "Teslim Edildi",
      cancelled: "İptal Edildi",
    },
  },
  EN: {
    overline: "My Orders",
    title: "Order History",
    subtitle: "Review your past orders and track their status.",
    empty: "You haven't placed any orders yet.",
    emptyDesc: "Browse our silhouettes to place your first order.",
    explore: "Start Shopping",
    orderNo: "Order No",
    date: "Date",
    total: "Total",
    items: "Items",
    status: "Status",
    showMore: "Show Details",
    showLess: "Hide Details",
    detail: "Order Detail",
    qty: "Qty",
    shippingTo: "Shipping",
    countOne: "order",
    countMany: "orders",
    statuses: {
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    },
  },
  AR: {
    overline: "طلباتي",
    title: "سجل الطلبات",
    subtitle: "راجع طلباتك السابقة وتابع حالتها.",
    empty: "لم تقم بأي طلب بعد.",
    emptyDesc: "تصفح صورنا الظلية لإجراء طلبك الأول.",
    explore: "ابدأ التسوق",
    orderNo: "رقم الطلب",
    date: "التاريخ",
    total: "الإجمالي",
    items: "المنتجات",
    status: "الحالة",
    showMore: "عرض التفاصيل",
    showLess: "إخفاء التفاصيل",
    detail: "تفاصيل الطلب",
    qty: "الكمية",
    shippingTo: "الشحن",
    countOne: "طلب",
    countMany: "طلبات",
    statuses: {
      pending: "قيد الانتظار",
      confirmed: "مؤكّد",
      processing: "قيد التحضير",
      shipped: "تم الشحن",
      delivered: "تم التسليم",
      cancelled: "ملغى",
    },
  },
};

const localeMap = { TR: "tr-TR", EN: "en-US", AR: "ar-EG" } as const;

function formatDate(ts: number, lang: keyof typeof localeMap) {
  try {
    return new Date(ts).toLocaleDateString(localeMap[lang], {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return new Date(ts).toLocaleDateString();
  }
}

function statusTone(status: string) {
  switch (status) {
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "shipped":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "processing":
    case "confirmed":
      return "bg-[#C9A96E]/10 text-[#C9A96E] border-[#C9A96E]/30";
    case "cancelled":
      return "bg-red-50 text-red-600 border-red-200";
    default:
      return "bg-[#1C1C1E]/5 text-[#1C1C1E]/60 border-[#1C1C1E]/15";
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function SiparislerPage() {
  const { lang, isRTL } = useLanguage();
  const { orders, updateOrderStatus } = useOrders();
  const [expanded, setExpanded] = useState<string | null>(null);
  const tx = t[lang];
  const u = hesapUrls[lang];

  useEffect(() => {
    orders.forEach((order) => {
      api.getOrder(order.orderNumber).then((res) => {
        if (res?.data?.status && res.data.status !== order.status) {
          updateOrderStatus(order.orderNumber, res.data.status);
        }
      }).catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AccountLayout>
      {/* Header */}
      <div className="mb-8 lg:mb-10 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-3">
            {tx.overline}
          </p>
          <h1 className="font-display text-3xl lg:text-4xl text-[#1C1C1E] leading-tight">
            {tx.title}
          </h1>
          <p className="font-body text-sm text-[#1C1C1E]/60 mt-3 max-w-xl">
            {tx.subtitle}
          </p>
        </div>
        {orders.length > 0 && (
          <span className="font-body text-xs tracking-[0.15em] uppercase text-[#1C1C1E]/40">
            {orders.length}{" "}
            {orders.length === 1 ? tx.countOne : tx.countMany}
          </span>
        )}
      </div>

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="bg-white border border-[#C9A96E]/15 py-20 px-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#F7F3EC] border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] mb-6">
            <Package size={22} strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-2xl text-[#1C1C1E] mb-3">
            {tx.empty}
          </h2>
          <p className="font-body text-sm text-[#1C1C1E]/55 max-w-md mb-8">
            {tx.emptyDesc}
          </p>
          <Link
            href={u.siluetler}
            className="font-body text-[11px] tracking-[0.25em] uppercase bg-[#1C1C1E] text-[#F7F3EC] px-8 py-3.5 hover:bg-[#C9A96E] transition-colors duration-300"
          >
            {tx.explore}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard
              key={order.orderNumber}
              order={order}
              lang={lang}
              isRTL={isRTL}
              isExpanded={expanded === order.orderNumber}
              onToggle={() =>
                setExpanded((cur) =>
                  cur === order.orderNumber ? null : order.orderNumber
                )
              }
              detailHref={u.siparis(order.orderNumber)}
              tx={tx}
            />
          ))}
        </div>
      )}
    </AccountLayout>
  );
}

// ─── Order Card ─────────────────────────────────────────────────────────────────

function OrderCard({
  order,
  lang,
  isRTL,
  isExpanded,
  onToggle,
  detailHref,
  tx,
}: {
  order: OrderHistoryEntry;
  lang: "TR" | "EN" | "AR";
  isRTL: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  detailHref: string;
  tx: (typeof t)[keyof typeof t];
}) {
  const statusKey = order.status as keyof typeof tx.statuses;
  const statusLabel = tx.statuses[statusKey] ?? order.status;
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div
      className="bg-white border border-[#C9A96E]/15"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-5 py-4 items-center border-b border-[#C9A96E]/10">
        <Meta label={tx.orderNo} value={order.orderNumber} mono />
        <Meta label={tx.date} value={formatDate(order.createdAt, lang)} />
        <Meta
          label={tx.total}
          value={`₺${order.total.toLocaleString("tr-TR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          accent
        />
        <div>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/40 mb-1.5">
            {tx.status}
          </p>
          <span
            className={`inline-flex items-center font-body text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 border ${statusTone(
              order.status
            )}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Actions row */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-4">
        <p className="font-body text-xs text-[#1C1C1E]/55">
          {itemCount} {tx.items.toLowerCase()}
        </p>
        <div className="flex items-center gap-4">
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1.5 font-body text-[11px] tracking-[0.2em] uppercase text-[#C9A96E] hover:text-[#1C1C1E] transition-colors"
          >
            {tx.detail}
            <ChevronRight size={12} />
          </Link>
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/55 hover:text-[#C9A96E] transition-colors"
          >
            {isExpanded ? tx.showLess : tx.showMore}
            <ChevronDown
              size={13}
              className={`transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expanded items */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-[#C9A96E]/10 pt-4 space-y-4">
          <ul className="space-y-3">
            {order.items.map((item, idx) => (
              <li
                key={`${item.productId ?? "x"}-${idx}`}
                className={`flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse text-right" : ""
                }`}
              >
                <div className="w-11 h-13 bg-[#E8E0D5] flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#C9A96E]/40">
                      <ShoppingBag size={13} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-[#1C1C1E] truncate">
                    {item.productName}
                  </p>
                  <p className="font-body text-[11px] text-[#1C1C1E]/45 mt-0.5">
                    {tx.qty}: {item.quantity}
                  </p>
                </div>
                <p className="font-body text-sm text-[#1C1C1E] font-medium flex-shrink-0">
                  ₺
                  {(item.price * item.quantity).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </li>
            ))}
          </ul>
          {(order.shippingAddress || order.shippingCity) && (
            <div className="pt-3 border-t border-[#C9A96E]/10">
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/40 mb-1.5">
                {tx.shippingTo}
              </p>
              <p className="font-body text-sm text-[#1C1C1E]/75">
                {[order.shippingAddress, order.shippingCity]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Meta({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/40 mb-1.5">
        {label}
      </p>
      <p
        className={`font-body text-sm truncate ${
          accent ? "text-[#C9A96E] font-medium" : "text-[#1C1C1E]"
        } ${mono ? "tracking-wide" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
