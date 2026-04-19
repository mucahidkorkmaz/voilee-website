import { useState } from "react";
import { Link } from "wouter";
import { RotateCcw, Package, ChevronRight, CheckCircle2 } from "lucide-react";
import AccountLayout, { hesapUrls } from "../layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOrders } from "@/contexts/OrdersContext";
import { toast } from "sonner";

// ─── Translations ───────────────────────────────────────────────────────────────

const t = {
  TR: {
    overline: "İadelerim",
    title: "İade Talebi",
    subtitle:
      "Teslim edilen siparişleriniz için iade talebinde bulunabilirsiniz.",
    noOrders: "İade edilebilecek sipariş bulunmuyor.",
    noOrdersDesc:
      "Yalnızca teslim edilmiş siparişler için iade talebi oluşturabilirsiniz.",
    selectOrder: "Sipariş Seçin",
    selectOrderPlaceholder: "Sipariş seçiniz...",
    reason: "İade Nedeni",
    reasons: {
      defective: "Ürün hasarlı / kusurlu",
      wrong: "Yanlış ürün gönderildi",
      notAsDescribed: "Ürün açıklamaya uymuyor",
      noLongerNeeded: "İhtiyaç duyulmadı",
      other: "Diğer",
    },
    notes: "Açıklama (isteğe bağlı)",
    notesPlaceholder: "İade nedeninizi kısaca açıklayın...",
    submit: "İade Talebi Gönder",
    submitting: "Gönderiliyor...",
    success: "İade talebiniz alındı. En kısa sürede size dönüş yapacağız.",
    orderNo: "Sipariş No",
    date: "Tarih",
    total: "Toplam",
    required: "Lütfen bir sipariş ve iade nedeni seçin.",
  },
  EN: {
    overline: "My Returns",
    title: "Return Request",
    subtitle: "You can initiate a return for delivered orders.",
    noOrders: "No returnable orders found.",
    noOrdersDesc: "Only delivered orders are eligible for a return request.",
    selectOrder: "Select Order",
    selectOrderPlaceholder: "Select an order...",
    reason: "Return Reason",
    reasons: {
      defective: "Product is damaged / defective",
      wrong: "Wrong item was sent",
      notAsDescribed: "Item doesn't match description",
      noLongerNeeded: "No longer needed",
      other: "Other",
    },
    notes: "Notes (optional)",
    notesPlaceholder: "Briefly describe your reason for return...",
    submit: "Submit Return Request",
    submitting: "Submitting...",
    success: "Your return request has been received. We will get back to you shortly.",
    orderNo: "Order No",
    date: "Date",
    total: "Total",
    required: "Please select an order and a return reason.",
  },
  AR: {
    overline: "مرتجعاتي",
    title: "طلب إرجاع",
    subtitle: "يمكنك بدء طلب إرجاع للطلبات المُسلَّمة.",
    noOrders: "لا توجد طلبات قابلة للإرجاع.",
    noOrdersDesc: "يمكن تقديم طلب الإرجاع للطلبات المُسلَّمة فقط.",
    selectOrder: "اختر طلباً",
    selectOrderPlaceholder: "اختر طلباً...",
    reason: "سبب الإرجاع",
    reasons: {
      defective: "المنتج تالف / معيب",
      wrong: "تم إرسال منتج خاطئ",
      notAsDescribed: "المنتج لا يطابق الوصف",
      noLongerNeeded: "لم أعد بحاجة إليه",
      other: "أخرى",
    },
    notes: "ملاحظات (اختياري)",
    notesPlaceholder: "صف سبب إرجاعك باختصار...",
    submit: "إرسال طلب الإرجاع",
    submitting: "جارٍ الإرسال...",
    success: "تم استلام طلب الإرجاع. سنتواصل معك قريباً.",
    orderNo: "رقم الطلب",
    date: "التاريخ",
    total: "الإجمالي",
    required: "يرجى تحديد طلب وسبب الإرجاع.",
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

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function IadePage() {
  const { lang, isRTL } = useLanguage();
  const { orders } = useOrders();
  const tx = t[lang];
  const u = hesapUrls[lang];

  const deliveredOrders = orders.filter((o) => o.status === "delivered");

  const [selectedOrderNo, setSelectedOrderNo] = useState("");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderNo || !reason) {
      toast.error(tx.required);
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success(tx.success);
  };

  return (
    <AccountLayout>
      {/* Header */}
      <div className="mb-8 lg:mb-10">
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

      {/* Success state */}
      {submitted ? (
        <div className="bg-white border border-emerald-200 p-10 flex flex-col items-center text-center">
          <CheckCircle2
            size={40}
            className="text-emerald-500 mb-5"
            strokeWidth={1.5}
          />
          <h2 className="font-display text-2xl text-[#1C1C1E] mb-3">
            {lang === "TR"
              ? "Talebiniz Alındı"
              : lang === "EN"
              ? "Request Received"
              : "تم استلام طلبك"}
          </h2>
          <p className="font-body text-sm text-[#1C1C1E]/60 max-w-sm mb-7">
            {tx.success}
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setSelectedOrderNo("");
              setReason("");
              setNotes("");
            }}
            className="font-body text-[11px] tracking-[0.25em] uppercase text-[#C9A96E] hover:text-[#1C1C1E] transition-colors"
          >
            {lang === "TR"
              ? "Yeni İade Talebi"
              : lang === "EN"
              ? "New Return Request"
              : "طلب إرجاع جديد"}
          </button>
        </div>
      ) : deliveredOrders.length === 0 ? (
        /* No eligible orders */
        <div className="bg-white border border-[#C9A96E]/15 py-20 px-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#F7F3EC] border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] mb-6">
            <RotateCcw size={22} strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-2xl text-[#1C1C1E] mb-3">
            {tx.noOrders}
          </h2>
          <p className="font-body text-sm text-[#1C1C1E]/55 max-w-md mb-7">
            {tx.noOrdersDesc}
          </p>
          <Link
            href={u.siparisler}
            className={`inline-flex items-center gap-1.5 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 hover:text-[#C9A96E] transition-colors ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Package size={14} />
            {lang === "TR"
              ? "Siparişlerime Git"
              : lang === "EN"
              ? "View My Orders"
              : "عرض طلباتي"}
            <ChevronRight size={12} className={isRTL ? "rotate-180" : ""} />
          </Link>
        </div>
      ) : (
        /* Return form */
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#C9A96E]/15 p-6 lg:p-8 space-y-6"
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Order select */}
          <div>
            <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/50 mb-3">
              {tx.selectOrder}
            </label>
            <div className="space-y-2">
              {deliveredOrders.map((order) => (
                <label
                  key={order.orderNumber}
                  className={`flex items-center gap-4 border p-4 cursor-pointer transition-colors ${
                    isRTL ? "flex-row-reverse" : ""
                  } ${
                    selectedOrderNo === order.orderNumber
                      ? "border-[#C9A96E]/60 bg-[#C9A96E]/5"
                      : "border-[#1C1C1E]/10 hover:border-[#C9A96E]/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="order"
                    value={order.orderNumber}
                    checked={selectedOrderNo === order.orderNumber}
                    onChange={(e) => setSelectedOrderNo(e.target.value)}
                    className="accent-[#C9A96E]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-[#1C1C1E] font-medium">
                      #{order.orderNumber}
                    </p>
                    <p className="font-body text-xs text-[#1C1C1E]/50 mt-0.5">
                      {formatDate(order.createdAt, lang)} · ₺
                      {order.total.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/50 mb-3">
              {tx.reason}
            </label>
            <div className="space-y-2">
              {(
                Object.entries(tx.reasons) as [
                  keyof typeof tx.reasons,
                  string
                ][]
              ).map(([key, label]) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 cursor-pointer ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={key}
                    checked={reason === key}
                    onChange={(e) => setReason(e.target.value)}
                    className="accent-[#C9A96E] flex-shrink-0"
                  />
                  <span className="font-body text-sm text-[#1C1C1E]/80">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/50 mb-2">
              {tx.notes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={tx.notesPlaceholder}
              rows={3}
              className="w-full bg-transparent border-b border-[#1C1C1E]/20 px-0 py-2 font-body text-sm text-[#1C1C1E] placeholder:text-[#1C1C1E]/30 focus:outline-none focus:border-[#C9A96E] resize-none transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !selectedOrderNo || !reason}
            className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.25em] uppercase bg-[#1C1C1E] text-[#F7F3EC] px-8 py-3.5 hover:bg-[#C9A96E] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tx.submit}
          </button>
        </form>
      )}
    </AccountLayout>
  );
}
