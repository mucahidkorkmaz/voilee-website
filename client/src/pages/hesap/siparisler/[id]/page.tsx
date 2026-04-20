import { Link, useParams } from "wouter";
import { useEffect } from "react";
import {
  ChevronLeft,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ShieldCheck,
  QrCode,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import AccountLayout, { hesapUrls } from "../../layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOrders } from "@/contexts/OrdersContext";
import { api } from "@/lib/api";
import { trpc } from "@/lib/trpc";

// ─── Translations ───────────────────────────────────────────────────────────────

const t = {
  TR: {
    back: "Siparişlerime Dön",
    overline: "Sipariş Detayı",
    notFound: "Sipariş bulunamadı.",
    notFoundDesc: "Bu sipariş numarasına ait kayıt mevcut değil.",
    orderNo: "Sipariş No",
    date: "Tarih",
    payment: "Ödeme",
    subtotal: "Ara Toplam",
    shipping: "Kargo",
    total: "Genel Toplam",
    items: "Sipariş Kalemleri",
    qty: "Adet",
    shippingTo: "Teslimat Adresi",
    status: "Durum",
    paymentMethods: { card: "Kredi Kartı", bank: "Banka Transferi" },
    statuses: {
      pending: "Beklemede",
      confirmed: "Onaylandı",
      processing: "Hazırlanıyor",
      shipped: "Kargoya Verildi",
      delivered: "Teslim Edildi",
      cancelled: "İptal Edildi",
    },
    initiateReturn: "İade Talebi Oluştur",
    authenticity: "Orijinallik Sertifikaları",
    authenticityDesc:
      "Siparişinize ait parçaların benzersiz seri numaralarını buradan görüntüleyebilir, karekodunu tarayarak orijinalliğini doğrulayabilir ve sahipliği adınıza tescil edebilirsiniz.",
    serialNumber: "Seri Numarası",
    claimOwnership: "Sahipliği Üstlen",
    viewCertificate: "Sertifikayı Görüntüle",
    ownedByYou: "Adınıza Tescilli",
    ownedByOther: "Başka Bir Sahibi Var",
    transferring: "Devir Sürecinde",
    claimSuccess: "Parça adınıza başarıyla tescil edildi.",
  },
  EN: {
    back: "Back to Orders",
    overline: "Order Detail",
    notFound: "Order not found.",
    notFoundDesc: "No record found for this order number.",
    orderNo: "Order No",
    date: "Date",
    payment: "Payment",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    items: "Order Items",
    qty: "Qty",
    shippingTo: "Shipping Address",
    status: "Status",
    paymentMethods: { card: "Credit Card", bank: "Bank Transfer" },
    statuses: {
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    },
    initiateReturn: "Initiate Return",
    authenticity: "Authenticity Certificates",
    authenticityDesc:
      "View the unique serial numbers of pieces in your order, verify authenticity by scanning the QR code, and register ownership in your name.",
    serialNumber: "Serial Number",
    claimOwnership: "Claim Ownership",
    viewCertificate: "View Certificate",
    ownedByYou: "Registered to You",
    ownedByOther: "Owned by Someone Else",
    transferring: "Transfer in Progress",
    claimSuccess: "Piece has been registered in your name.",
  },
  AR: {
    back: "العودة إلى الطلبات",
    overline: "تفاصيل الطلب",
    notFound: "الطلب غير موجود.",
    notFoundDesc: "لا يوجد سجل لرقم الطلب هذا.",
    orderNo: "رقم الطلب",
    date: "التاريخ",
    payment: "الدفع",
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    total: "الإجمالي",
    items: "عناصر الطلب",
    qty: "الكمية",
    shippingTo: "عنوان الشحن",
    status: "الحالة",
    paymentMethods: { card: "بطاقة ائتمان", bank: "تحويل مصرفي" },
    statuses: {
      pending: "قيد الانتظار",
      confirmed: "مؤكّد",
      processing: "قيد التحضير",
      shipped: "تم الشحن",
      delivered: "تم التسليم",
      cancelled: "ملغى",
    },
    initiateReturn: "طلب إرجاع",
    authenticity: "شهادات الأصالة",
    authenticityDesc:
      "اعرض الأرقام التسلسلية الفريدة للقطع في طلبك، وتحقق من الأصالة بمسح رمز QR، وسجّل الملكية باسمك.",
    serialNumber: "الرقم التسلسلي",
    claimOwnership: "تسجيل الملكية",
    viewCertificate: "عرض الشهادة",
    ownedByYou: "مسجّل باسمك",
    ownedByOther: "مملوك لشخص آخر",
    transferring: "جاري النقل",
    claimSuccess: "تم تسجيل القطعة باسمك.",
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

// ─── Status Timeline ────────────────────────────────────────────────────────────

const STATUS_STEPS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
] as const;

function StatusTimeline({
  status,
  tx,
  isRTL,
}: {
  status: string;
  tx: (typeof t)[keyof typeof t];
  isRTL: boolean;
}) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <XCircle size={18} />
        <span className="font-body text-sm">{tx.statuses.cancelled}</span>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(
    status as (typeof STATUS_STEPS)[number]
  );

  const stepIcons = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle2,
  };

  return (
    <div className={`flex items-center gap-0 ${isRTL ? "flex-row-reverse" : ""}`}>
      {STATUS_STEPS.map((step, idx) => {
        const Icon = stepIcons[step];
        const done = idx <= currentIdx;
        const current = idx === currentIdx;
        return (
          <div
            key={step}
            className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex flex-col items-center gap-1 ${
                isRTL ? "items-end" : "items-center"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  current
                    ? "border-[#C9A96E] bg-[#C9A96E] text-white"
                    : done
                    ? "border-[#C9A96E]/50 bg-[#C9A96E]/10 text-[#C9A96E]"
                    : "border-[#1C1C1E]/15 bg-white text-[#1C1C1E]/25"
                }`}
              >
                <Icon size={14} />
              </div>
              <span
                className={`font-body text-[9px] tracking-[0.1em] uppercase hidden sm:block text-center max-w-[60px] leading-tight ${
                  done ? "text-[#C9A96E]" : "text-[#1C1C1E]/30"
                }`}
              >
                {tx.statuses[step]}
              </span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div
                className={`h-px w-8 sm:w-12 lg:w-16 mx-1 ${
                  idx < currentIdx ? "bg-[#C9A96E]/50" : "bg-[#1C1C1E]/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function SiparisDetayPage() {
  const { lang, isRTL } = useLanguage();
  const { orders, updateOrderStatus } = useOrders();
  const params = useParams<{ id: string }>();
  const tx = t[lang];
  const u = hesapUrls[lang];

  const order = orders.find((o) => o.orderNumber === params.id);

  useEffect(() => {
    if (!params.id) return;
    api.getOrder(params.id).then((res) => {
      if (res?.data?.status) {
        updateOrderStatus(params.id, res.data.status);
      }
    }).catch(() => {});
  }, [params.id, updateOrderStatus]);

  return (
    <AccountLayout>
      {/* Back */}
      <Link
        href={u.siparisler}
        className={`inline-flex items-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/50 hover:text-[#C9A96E] transition-colors mb-7 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <ChevronLeft size={13} className={isRTL ? "rotate-180" : ""} />
        {tx.back}
      </Link>

      {!order ? (
        <div className="bg-white border border-[#C9A96E]/15 py-20 px-6 flex flex-col items-center text-center">
          <Package size={32} className="text-[#C9A96E]/40 mb-4" strokeWidth={1.4} />
          <h2 className="font-display text-2xl text-[#1C1C1E] mb-2">
            {tx.notFound}
          </h2>
          <p className="font-body text-sm text-[#1C1C1E]/55">{tx.notFoundDesc}</p>
        </div>
      ) : (
        <div dir={isRTL ? "rtl" : "ltr"}>
          {/* Header */}
          <div className="mb-7">
            <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">
              {tx.overline}
            </p>
            <h1 className="font-display text-2xl lg:text-3xl text-[#1C1C1E] mb-1">
              #{order.orderNumber}
            </h1>
            <p className="font-body text-sm text-[#1C1C1E]/50">
              {formatDate(order.createdAt, lang)}
            </p>
          </div>

          {/* Status timeline */}
          <div className="bg-white border border-[#C9A96E]/15 p-5 lg:p-7 mb-4 overflow-x-auto">
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-[#1C1C1E]/40 mb-5">
              {tx.status}
            </p>
            <StatusTimeline status={order.status} tx={tx} isRTL={isRTL} />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Items */}
            <div className="lg:col-span-2 bg-white border border-[#C9A96E]/15 p-5 lg:p-7">
              <h2 className="font-body text-[10px] tracking-[0.25em] uppercase text-[#1C1C1E]/40 mb-5">
                {tx.items}
              </h2>
              <ul className="space-y-4">
                {order.items.map((item, idx) => (
                  <li
                    key={`${item.productId ?? "x"}-${idx}`}
                    className={`flex items-center gap-4 pb-4 border-b border-[#C9A96E]/10 last:border-0 last:pb-0 ${
                      isRTL ? "flex-row-reverse text-right" : ""
                    }`}
                  >
                    <div className="w-14 h-[68px] bg-[#E8E0D5] flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#C9A96E]/30">
                          <ShoppingBag size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-[#1C1C1E] font-medium">
                        {item.productName}
                      </p>
                      <p className="font-body text-xs text-[#1C1C1E]/45 mt-0.5">
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
            </div>

            {/* Summary */}
            <div className="space-y-4">
              {/* Price breakdown */}
              <div className="bg-white border border-[#C9A96E]/15 p-5 lg:p-7">
                <div className="space-y-3">
                  <SummaryRow
                    label={tx.subtotal}
                    value={`₺${order.subtotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  />
                  <SummaryRow
                    label={tx.shipping}
                    value={`₺${order.shippingCost.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  />
                  {order.paymentMethod && (
                    <SummaryRow
                      label={tx.payment}
                      value={tx.paymentMethods[order.paymentMethod]}
                    />
                  )}
                  <div className="pt-3 border-t border-[#C9A96E]/15 flex items-center justify-between">
                    <span className="font-body text-sm text-[#1C1C1E] font-medium">
                      {tx.total}
                    </span>
                    <span className="font-display text-lg text-[#C9A96E]">
                      ₺
                      {order.total.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              {(order.shippingAddress || order.shippingCity) && (
                <div className="bg-white border border-[#C9A96E]/15 p-5 lg:p-7">
                  <p className="font-body text-[10px] tracking-[0.25em] uppercase text-[#1C1C1E]/40 mb-3">
                    {tx.shippingTo}
                  </p>
                  {order.customerName && (
                    <p className="font-body text-sm text-[#1C1C1E] font-medium mb-1">
                      {order.customerName}
                    </p>
                  )}
                  <p className="font-body text-sm text-[#1C1C1E]/70">
                    {[order.shippingAddress, order.shippingCity]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}

              {/* Return CTA — only for delivered orders */}
              {order.status === "delivered" && (
                <Link
                  href={u.iade}
                  className={`flex items-center gap-2 w-full font-body text-[11px] tracking-[0.2em] uppercase border border-[#1C1C1E]/20 text-[#1C1C1E]/60 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors px-5 py-3.5 ${
                    isRTL ? "flex-row-reverse justify-center" : "justify-center"
                  }`}
                >
                  <RotateCcw size={14} />
                  {tx.initiateReturn}
                </Link>
              )}
            </div>
          </div>

          {/* Authenticity / verification section — only for delivered orders */}
          {order.status === "delivered" && (
            <div className="mt-4">
              <VerificationsSection
                orderNumber={order.orderNumber}
                tx={tx}
                isRTL={isRTL}
              />
            </div>
          )}
        </div>
      )}
    </AccountLayout>
  );
}

// ─── Verifications Section ──────────────────────────────────────────────────────

function VerificationsSection({
  orderNumber,
  tx,
  isRTL,
}: {
  orderNumber: string;
  tx: (typeof t)[keyof typeof t];
  isRTL: boolean;
}) {
  const utils = trpc.useUtils();
  const { data: verifications = [], isLoading } =
    trpc.verification.byOrderNumber.useQuery({ orderNumber });

  const claimMutation = trpc.verification.claimForOrder.useMutation({
    onSuccess: () => {
      utils.verification.byOrderNumber.invalidate({ orderNumber });
      toast.success(tx.claimSuccess);
    },
    onError: e => toast.error(e.message),
  });

  if (isLoading) return null;
  if (!verifications.length) return null;

  return (
    <div className="bg-white border border-[#C9A96E]/15 p-5 lg:p-7">
      <div
        className={`flex items-center gap-2 mb-2 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <ShieldCheck size={16} className="text-[#C9A96E]" />
        <h2 className="font-body text-[10px] tracking-[0.25em] uppercase text-[#1C1C1E]/55">
          {tx.authenticity}
        </h2>
      </div>
      <p className="font-display italic text-[13px] text-[#1C1C1E]/55 mb-5 max-w-2xl">
        {tx.authenticityDesc}
      </p>

      <ul className="divide-y divide-[#C9A96E]/10">
        {verifications.map((v: any) => {
          const status: string = v.status ?? "unowned";
          const owned = status === "registered";
          const transferring = status === "transferring";
          const certUrl = `/dogrulama?seri=${encodeURIComponent(v.serialNumber)}`;
          return (
            <li
              key={v.id}
              className={`py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
                isRTL ? "sm:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div
                  className={`flex items-center gap-2 mb-1 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <QrCode size={13} className="text-[#C9A96E]" />
                  <p className="font-body text-[10px] tracking-[0.25em] uppercase text-[#1C1C1E]/45">
                    {tx.serialNumber}
                  </p>
                </div>
                <p className="font-mono text-sm tracking-widest text-[#1C1C1E]">
                  {v.serialNumber}
                </p>
                {v.productName && (
                  <p className="font-display italic text-[13px] text-[#1C1C1E]/60 mt-0.5">
                    {v.productName}
                  </p>
                )}
                <p
                  className={`font-body text-[10px] tracking-[0.2em] uppercase mt-1 ${
                    owned
                      ? "text-[#C9A96E]"
                      : transferring
                      ? "text-amber-600"
                      : "text-[#1C1C1E]/40"
                  }`}
                >
                  {owned
                    ? tx.ownedByYou
                    : transferring
                    ? tx.transferring
                    : tx.ownedByOther}
                </p>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                {!owned && !transferring && (
                  <button
                    onClick={() =>
                      claimMutation.mutate({ serialNumber: v.serialNumber })
                    }
                    disabled={claimMutation.isPending}
                    className={`inline-flex items-center gap-1.5 font-body text-[10px] tracking-[0.2em] uppercase bg-[#C9A96E] text-white hover:bg-[#1C1C1E] transition-colors px-3.5 py-2.5 disabled:opacity-60 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span>{tx.claimOwnership}</span>
                    <ArrowRight size={12} className={isRTL ? "rotate-180" : ""} />
                  </button>
                )}
                <Link
                  href={certUrl}
                  className={`inline-flex items-center gap-1.5 font-body text-[10px] tracking-[0.2em] uppercase border border-[#1C1C1E]/20 text-[#1C1C1E]/60 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors px-3.5 py-2.5 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <span>{tx.viewCertificate}</span>
                  <ExternalLink size={11} />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-body text-xs text-[#1C1C1E]/50">{label}</span>
      <span className="font-body text-sm text-[#1C1C1E]">{value}</span>
    </div>
  );
}
