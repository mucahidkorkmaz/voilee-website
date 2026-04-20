import { Link, useParams } from "wouter";
import {
  ChevronLeft,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import AccountLayout, { hesapUrls } from "../../layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

// ─── Translations ───────────────────────────────────────────────────────────────

const t = {
  TR: {
    back: "İadelerime Dön",
    overline: "İade Detayı",
    returnNo: "İade No",
    orderNo: "Sipariş No",
    date: "Tarih",
    status: "Durum",
    returnedItems: "İade Edilecek Ürünler",
    adminNote: "Yönetici Notu",
    reason: "İade Nedeni",
    notes: "Açıklama",
    qty: "Adet",
    steps: {
      requested: "Talep Alındı",
      accepted: "Onaylandı",
      processed: "Tamamlandı",
    },
    rejected: "Reddedildi",
    rejectedDesc: "İade talebiniz değerlendirme sonucunda reddedildi.",
    info: "İade talebiniz inceleme sürecindedir. Güncellemeler e-posta ile iletilecektir.",
    contactSupport: "Destek ile İletişime Geç",
    notFound: "İade talebi bulunamadı.",
    loading: "Yükleniyor...",
    reasons: {
      defective: "Ürün hasarlı / kusurlu",
      wrong: "Yanlış ürün gönderildi",
      notAsDescribed: "Ürün açıklamaya uymuyor",
      noLongerNeeded: "İhtiyaç duyulmadı",
      other: "Diğer",
    },
  },
  EN: {
    back: "Back to Returns",
    overline: "Return Detail",
    returnNo: "Return No",
    orderNo: "Order No",
    date: "Date",
    status: "Status",
    returnedItems: "Items Being Returned",
    adminNote: "Admin Note",
    reason: "Return Reason",
    notes: "Notes",
    qty: "Qty",
    steps: {
      requested: "Request Received",
      accepted: "Approved",
      processed: "Completed",
    },
    rejected: "Rejected",
    rejectedDesc: "Your return request has been rejected after review.",
    info: "Your return request is under review. Updates will be sent via email.",
    contactSupport: "Contact Support",
    notFound: "Return request not found.",
    loading: "Loading...",
    reasons: {
      defective: "Product is damaged / defective",
      wrong: "Wrong item was sent",
      notAsDescribed: "Item doesn't match description",
      noLongerNeeded: "No longer needed",
      other: "Other",
    },
  },
  AR: {
    back: "العودة إلى المرتجعات",
    overline: "تفاصيل الإرجاع",
    returnNo: "رقم الإرجاع",
    orderNo: "رقم الطلب",
    date: "التاريخ",
    status: "الحالة",
    returnedItems: "المنتجات المُرجَعة",
    adminNote: "ملاحظة المسؤول",
    reason: "سبب الإرجاع",
    notes: "ملاحظات",
    qty: "الكمية",
    steps: {
      requested: "تم استلام الطلب",
      accepted: "تمت الموافقة",
      processed: "مكتمل",
    },
    rejected: "مرفوض",
    rejectedDesc: "تم رفض طلب الإرجاع بعد المراجعة.",
    info: "طلب الإرجاع هذا قيد المراجعة. سيتم إرسال التحديثات عبر البريد الإلكتروني.",
    contactSupport: "تواصل مع الدعم",
    notFound: "طلب الإرجاع غير موجود.",
    loading: "جارٍ التحميل...",
    reasons: {
      defective: "المنتج تالف / معيب",
      wrong: "تم إرسال منتج خاطئ",
      notAsDescribed: "المنتج لا يطابق الوصف",
      noLongerNeeded: "لم أعد بحاجة إليه",
      other: "أخرى",
    },
  },
};

// ─── Status timeline ─────────────────────────────────────────────────────────

const RETURN_STEPS = ["requested", "accepted", "processed"] as const;
type ReturnStep = (typeof RETURN_STEPS)[number];

const stepIcons: Record<ReturnStep, React.ElementType> = {
  requested: Clock,
  accepted: CheckCircle2,
  processed: PackageCheck,
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function IadeDetayPage() {
  const { lang, isRTL } = useLanguage();
  const params = useParams<{ id: string }>();
  const tx = t[lang];
  const u = hesapUrls[lang];

  const { data: ret, isLoading } = trpc.returns.get.useQuery(
    { id: Number(params.id) },
    { enabled: !!params.id && !isNaN(Number(params.id)), retry: false },
  );

  const isRejected = ret?.status === "rejected";
  const currentStep = isRejected
    ? "requested"
    : (ret?.status as ReturnStep | undefined) ?? "requested";
  const currentIdx = RETURN_STEPS.indexOf(currentStep);

  return (
    <AccountLayout>
      {/* Back */}
      <Link
        href={u.iade}
        className={`inline-flex items-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/50 hover:text-[#C9A96E] transition-colors mb-7 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <ChevronLeft size={13} className={isRTL ? "rotate-180" : ""} />
        {tx.back}
      </Link>

      {isLoading ? (
        <div className="bg-white border border-[#C9A96E]/15 p-10 flex items-center justify-center">
          <div className="h-5 w-5 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !ret ? (
        <div className="bg-white border border-[#C9A96E]/15 py-20 px-6 flex flex-col items-center text-center">
          <RotateCcw size={28} className="text-[#C9A96E]/30 mb-4" strokeWidth={1.4} />
          <p className="font-display text-xl text-[#1C1C1E]/60">{tx.notFound}</p>
        </div>
      ) : (
        <div dir={isRTL ? "rtl" : "ltr"} className="space-y-4">
          {/* Header */}
          <div className="mb-6">
            <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">
              {tx.overline}
            </p>
            <h1 className="font-display text-2xl lg:text-3xl text-[#1C1C1E]">
              {ret.returnNumber}
            </h1>
            <p className="font-body text-xs text-[#1C1C1E]/45 mt-1.5">
              {tx.orderNo} #{ret.orderNumber} · {new Date(ret.createdAt).toLocaleDateString(
                lang === "TR" ? "tr-TR" : lang === "EN" ? "en-US" : "ar-EG",
                { year: "numeric", month: "long", day: "numeric" },
              )}
            </p>
          </div>

          {/* Rejected state */}
          {isRejected ? (
            <div className="bg-red-50 border border-red-200 p-6 flex items-start gap-3">
              <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-sm font-medium text-red-700">{tx.rejected}</p>
                <p className="font-body text-sm text-red-600/80 mt-1">{tx.rejectedDesc}</p>
                {ret.adminNote && (
                  <p className="font-body text-sm text-red-600/70 mt-2 italic">"{ret.adminNote}"</p>
                )}
              </div>
            </div>
          ) : (
            /* Status timeline */
            <div className="bg-white border border-[#C9A96E]/15 p-6 lg:p-8">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-[#1C1C1E]/40 mb-6">
                {tx.status}
              </p>
              <div
                className={`flex items-start gap-0 overflow-x-auto ${isRTL ? "flex-row-reverse" : ""}`}
              >
                {RETURN_STEPS.map((step, idx) => {
                  const Icon = stepIcons[step];
                  const done = idx <= currentIdx;
                  const current = idx === currentIdx;
                  return (
                    <div
                      key={step}
                      className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <div className="flex flex-col items-center gap-2 min-w-[72px]">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                            current
                              ? "border-[#C9A96E] bg-[#C9A96E] text-white"
                              : done
                              ? "border-[#C9A96E]/50 bg-[#C9A96E]/10 text-[#C9A96E]"
                              : "border-[#1C1C1E]/15 bg-white text-[#1C1C1E]/25"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <span
                          className={`font-body text-[9px] tracking-[0.1em] uppercase text-center leading-tight max-w-[70px] ${
                            done ? "text-[#C9A96E]" : "text-[#1C1C1E]/30"
                          }`}
                        >
                          {tx.steps[step]}
                        </span>
                      </div>
                      {idx < RETURN_STEPS.length - 1 && (
                        <div
                          className={`h-px w-10 sm:w-16 mx-1 mb-6 flex-shrink-0 ${
                            idx < currentIdx ? "bg-[#C9A96E]/50" : "bg-[#1C1C1E]/10"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Admin note */}
              {ret.adminNote && (
                <div className="mt-5 pt-5 border-t border-[#C9A96E]/15">
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/40 mb-1.5">
                    {tx.adminNote}
                  </p>
                  <p className="font-body text-sm text-[#1C1C1E]/70 italic">"{ret.adminNote}"</p>
                </div>
              )}
            </div>
          )}

          {/* Items being returned */}
          {ret.items && ret.items.length > 0 && (
            <div className="bg-white border border-[#C9A96E]/15 p-6 lg:p-7">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-[#1C1C1E]/40 mb-5">
                {tx.returnedItems}
              </p>
              <ul className="space-y-3">
                {ret.items.map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-center gap-4 pb-3 border-b border-[#C9A96E]/10 last:border-0 last:pb-0 ${
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
                        <div className="w-11 h-13 flex items-center justify-center text-[#C9A96E]/30 bg-[#E8E0D5]">
                          <ShoppingBag size={14} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-[#1C1C1E] font-medium leading-tight">
                        {item.productName}
                      </p>
                      <p className="font-body text-xs text-[#1C1C1E]/45 mt-0.5">
                        {tx.qty}: {item.quantity}
                        {item.price && (
                          <> · ₺{(Number(item.price) * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Return reason & notes */}
          <div className="bg-white border border-[#C9A96E]/15 p-6 lg:p-7 space-y-4">
            <div>
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/40 mb-1.5">
                {tx.reason}
              </p>
              <p className="font-body text-sm text-[#1C1C1E]/80">
                {tx.reasons[ret.reason as keyof typeof tx.reasons] ?? ret.reason}
              </p>
            </div>
            {ret.notes && (
              <div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/40 mb-1.5">
                  {tx.notes}
                </p>
                <p className="font-body text-sm text-[#1C1C1E]/70 whitespace-pre-line">{ret.notes}</p>
              </div>
            )}
          </div>

          {/* Info notice */}
          {!isRejected && ret.status !== "processed" && (
            <div className="bg-[#C9A96E]/8 border border-[#C9A96E]/25 p-5 flex items-start gap-3">
              <RotateCcw size={16} className="text-[#C9A96E] flex-shrink-0 mt-0.5" />
              <p className="font-body text-sm text-[#1C1C1E]/70">{tx.info}</p>
            </div>
          )}
        </div>
      )}
    </AccountLayout>
  );
}
