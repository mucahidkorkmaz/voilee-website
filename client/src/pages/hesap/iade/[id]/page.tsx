import { Link, useParams } from "wouter";
import {
  ChevronLeft,
  RotateCcw,
  Clock,
  CheckCircle2,
  Truck,
  Package,
} from "lucide-react";
import AccountLayout, { hesapUrls } from "../../layout";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Translations ───────────────────────────────────────────────────────────────

const t = {
  TR: {
    back: "İadelerime Dön",
    overline: "İade Detayı",
    returnNo: "İade No",
    status: "Durum",
    steps: {
      requested: "Talep Alındı",
      approved: "Onaylandı",
      inTransit: "İadede",
      received: "Teslim Alındı",
      refunded: "İade Edildi",
    },
    info: "Bu iade talebi inceleme sürecindedir. Güncellemeler e-posta ile iletilecektir.",
    contactSupport: "Destek ile İletişime Geç",
  },
  EN: {
    back: "Back to Returns",
    overline: "Return Detail",
    returnNo: "Return No",
    status: "Status",
    steps: {
      requested: "Request Received",
      approved: "Approved",
      inTransit: "In Transit",
      received: "Item Received",
      refunded: "Refunded",
    },
    info: "This return request is under review. Updates will be sent via email.",
    contactSupport: "Contact Support",
  },
  AR: {
    back: "العودة إلى المرتجعات",
    overline: "تفاصيل الإرجاع",
    returnNo: "رقم الإرجاع",
    status: "الحالة",
    steps: {
      requested: "تم استلام الطلب",
      approved: "تمت الموافقة",
      inTransit: "في الطريق",
      received: "تم استلام المنتج",
      refunded: "تم رد المبلغ",
    },
    info: "طلب الإرجاع هذا قيد المراجعة. سيتم إرسال التحديثات عبر البريد الإلكتروني.",
    contactSupport: "تواصل مع الدعم",
  },
};

const RETURN_STEPS = [
  "requested",
  "approved",
  "inTransit",
  "received",
  "refunded",
] as const;

const stepIcons = {
  requested: Clock,
  approved: CheckCircle2,
  inTransit: Truck,
  received: Package,
  refunded: CheckCircle2,
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function IadeDetayPage() {
  const { lang, isRTL } = useLanguage();
  const params = useParams<{ id: string }>();
  const tx = t[lang];
  const u = hesapUrls[lang];

  // Current step: "requested" (first step) since this is a new system
  const currentStep = "requested" as (typeof RETURN_STEPS)[number];
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

      <div dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="mb-7">
          <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">
            {tx.overline}
          </p>
          <h1 className="font-display text-2xl lg:text-3xl text-[#1C1C1E]">
            {tx.returnNo} #{params.id}
          </h1>
        </div>

        {/* Status timeline */}
        <div className="bg-white border border-[#C9A96E]/15 p-6 lg:p-8 mb-4">
          <p className="font-body text-[10px] tracking-[0.25em] uppercase text-[#1C1C1E]/40 mb-6">
            {tx.status}
          </p>
          <div
            className={`flex items-start gap-0 overflow-x-auto ${
              isRTL ? "flex-row-reverse" : ""
            }`}
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
                  <div className="flex flex-col items-center gap-2 min-w-[64px]">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                        current
                          ? "border-[#C9A96E] bg-[#C9A96E] text-white"
                          : done
                          ? "border-[#C9A96E]/50 bg-[#C9A96E]/10 text-[#C9A96E]"
                          : "border-[#1C1C1E]/15 bg-white text-[#1C1C1E]/25"
                      }`}
                    >
                      <Icon size={15} />
                    </div>
                    <span
                      className={`font-body text-[9px] tracking-[0.1em] uppercase text-center leading-tight ${
                        done ? "text-[#C9A96E]" : "text-[#1C1C1E]/30"
                      }`}
                    >
                      {tx.steps[step]}
                    </span>
                  </div>
                  {idx < RETURN_STEPS.length - 1 && (
                    <div
                      className={`h-px w-8 sm:w-12 mx-1 mb-5 flex-shrink-0 ${
                        idx < currentIdx
                          ? "bg-[#C9A96E]/50"
                          : "bg-[#1C1C1E]/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info notice */}
        <div className="bg-[#C9A96E]/8 border border-[#C9A96E]/25 p-5 flex items-start gap-3">
          <RotateCcw
            size={16}
            className="text-[#C9A96E] flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="font-body text-sm text-[#1C1C1E]/70">{tx.info}</p>
            <button
              type="button"
              className="mt-2 font-body text-[11px] tracking-[0.15em] uppercase text-[#C9A96E] hover:text-[#1C1C1E] transition-colors"
            >
              {tx.contactSupport}
            </button>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
