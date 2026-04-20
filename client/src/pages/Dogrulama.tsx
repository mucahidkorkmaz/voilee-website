import { useEffect, useMemo, useRef, useState } from "react";
import { useRoute } from "wouter";
import { toast } from "sonner";
import { Search, ArrowRight, Download, ShieldCheck, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";

type Lang = "TR" | "EN" | "AR";

function pickText(lang: Lang, tr: string, en: string, ar: string) {
  if (lang === "TR") return tr;
  if (lang === "EN") return en;
  return ar;
}

function formatLocalizedDate(date: Date | string | null | undefined, lang: Lang) {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return null;
  const locale = lang === "TR" ? "tr-TR" : lang === "EN" ? "en-GB" : "ar";
  return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export default function Dogrulama() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [, detailMatch] = useRoute<{ serial: string }>("/dogrulama/:serial");
  const [, enMatch] = useRoute<{ serial: string }>("/en/verify/:serial");
  const [, arMatch] = useRoute<{ serial: string }>("/ar/verify/:serial");
  const serialFromUrl =
    (detailMatch as { serial?: string } | null)?.serial ??
    (enMatch as { serial?: string } | null)?.serial ??
    (arMatch as { serial?: string } | null)?.serial ??
    null;

  const [searchInput, setSearchInput] = useState("");
  const [activeSerial, setActiveSerial] = useState<string | null>(null);
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (serialFromUrl) setActiveSerial(serialFromUrl);
  }, [serialFromUrl]);

  const utils = trpc.useUtils();
  const verificationQuery = trpc.verification.bySerial.useQuery(
    { serialNumber: activeSerial ?? "", track: trackedRef.current !== activeSerial },
    { enabled: !!activeSerial, retry: false },
  );

  useEffect(() => {
    if (activeSerial && verificationQuery.isSuccess) {
      trackedRef.current = activeSerial;
    }
  }, [activeSerial, verificationQuery.isSuccess]);

  const registerMutation = trpc.verification.register.useMutation({
    onSuccess: () => {
      utils.verification.bySerial.invalidate();
      toast.success(pickText(lang, "Parça adınıza tescil edildi.", "Piece registered in your name.", "تم تسجيل القطعة باسمك."));
    },
    onError: e => toast.error(e.message),
  });
  const transferStartMutation = trpc.verification.transferStart.useMutation({
    onSuccess: () => {
      utils.verification.bySerial.invalidate();
      toast.success(pickText(lang, "Davet gönderildi.", "Invitation sent.", "تم إرسال الدعوة."));
    },
    onError: e => toast.error(e.message),
  });
  const transferCancelMutation = trpc.verification.transferCancel.useMutation({
    onSuccess: () => {
      utils.verification.bySerial.invalidate();
    },
    onError: e => toast.error(e.message),
  });
  const claimForOrderMutation = trpc.verification.claimForOrder.useMutation({
    onSuccess: () => {
      utils.verification.bySerial.invalidate();
      toast.success(pickText(lang, "Parça siparişinizle eşleşti ve adınıza tescil edildi.", "Piece matched with your order and registered in your name.", "تمت مطابقة القطعة مع طلبك وتسجيلها باسمك."));
    },
    onError: e => toast.error(e.message),
  });

  const data = verificationQuery.data ?? null;

  /** Sahip adı ve "size aittir" yalnızca giriş yapmış ve DB'deki kayıtla eşleşen kullanıcıya gösterilir. */
  const viewerIsOwner = useMemo(() => {
    if (!data || !user) return false;
    if (data.ownerUserId != null && data.ownerUserId === user.id) return true;
    const ue = user.email?.trim().toLowerCase();
    const oe = data.ownerEmail?.trim().toLowerCase();
    return !!(ue && oe && ue === oe);
  }, [data, user]);

  const productName = useMemo(() => {
    if (!data) return "";
    return pickText(lang, data.productNameTR ?? "", data.productNameEN ?? data.productNameTR ?? "", data.productNameAR ?? data.productNameTR ?? "");
  }, [data, lang]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    if (!clean) return;
    trackedRef.current = null;
    setActiveSerial(clean);
  };

  const statusLabel = (status: "unowned" | "registered" | "transferring") => {
    if (status === "registered")
      return pickText(lang, "Tescilli · Sahipli", "Registered · Owned", "مسجّل · مملوك");
    if (status === "transferring")
      return pickText(lang, "Devir Sürecinde", "Transfer Pending", "قيد النقل");
    return pickText(lang, "Stokta · Sahipsiz", "Available · Unowned", "متاح · غير مملوك");
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-[640px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="pt-8 pb-10">
            <p className="font-body text-xs tracking-[0.25em] uppercase text-[#C9A96E] mb-4">
              {pickText(lang, "Doğrulama", "Authentication", "التحقق")}
            </p>
            <h1 className="font-display text-5xl sm:text-6xl text-[#1C1C1E] leading-[0.95] mb-4">
              {pickText(lang, "Orijinal.", "Original.", "أصلي.")}
            </h1>
            <p className="font-display italic text-lg sm:text-xl text-[#1C1C1E]/70 mb-8">
              {pickText(
                lang,
                "VOILÉE parçanızın kaydını seri numarasıyla doğrulayın.",
                "Verify your VOILÉE piece by its serial number.",
                "تحقق من قطعة VOILÉE الخاصة بك من خلال الرقم التسلسلي.",
              )}
            </p>

            {/* Search form */}
            <form onSubmit={handleSearch} className="flex items-center gap-0 border border-[#1C1C1E]/15 bg-white">
              <div className="pl-4 text-[#1C1C1E]/40">
                <Search size={16} />
              </div>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={pickText(lang, "Seri numarası · örn. 00147", "Serial number · e.g. 00147", "الرقم التسلسلي · مثال 00147")}
                className="flex-1 bg-transparent py-3.5 px-3 font-body text-sm text-[#1C1C1E] placeholder:text-[#1C1C1E]/40 focus:outline-none"
              />
              <button
                type="submit"
                className="h-full px-5 py-3.5 bg-[#1C1C1E] text-white font-body text-[11px] tracking-[0.25em] uppercase hover:bg-[#1C1C1E]/90 transition-colors"
              >
                {pickText(lang, "Doğrula", "Verify", "تحقق")}
              </button>
            </form>

            {!activeSerial && (
              <p className="mt-6 font-display italic text-sm text-[#1C1C1E]/50">
                {pickText(
                  lang,
                  "Seri numarası, parçanızın iç etiketinde ya da sertifika kartında yer alır.",
                  "The serial number appears on the inner label or certificate card of your piece.",
                  "يظهر الرقم التسلسلي على الملصق الداخلي أو بطاقة الشهادة لقطعتك.",
                )}
              </p>
            )}
          </section>

          {/* States */}
          {activeSerial && verificationQuery.isLoading && (
            <LoadingState lang={lang} />
          )}

          {activeSerial && !verificationQuery.isLoading && !data && (
            <NotFoundState lang={lang} serial={activeSerial} />
          )}

          {activeSerial && data && (
            <>
              {/* Authenticity badge */}
              <section className="border-t border-[#1C1C1E]/10 pt-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-px bg-[#C9A96E]" />
                  <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#1C1C1E]/60">
                    {pickText(lang, "Orijinal Ürün", "Authentic Piece", "قطعة أصلية")}
                  </p>
                </div>

                <div className="inline-flex items-center gap-3 border border-[#C9A96E]/30 bg-white px-4 py-2.5">
                  <span className="relative flex items-center justify-center w-2.5 h-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#C9A96E] opacity-40 animate-ping" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#C9A96E]" />
                  </span>
                  <span className="font-body text-[11px] tracking-[0.25em] uppercase text-[#1C1C1E]">
                    {pickText(lang, "Doğrulandı", "Verified", "تم التحقق")}
                  </span>
                </div>
              </section>

              <SectionHeader num="01" title={pickText(lang, "Parça", "Piece", "القطعة")} />

              {/* Product */}
              <section className="mb-12">
                <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-[#8B7355] to-[#4A3F30] overflow-hidden mb-7">
                  {data.imageUrl ? (
                    <img src={data.imageUrl} alt={productName} className="w-full h-full object-cover" />
                  ) : null}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.18), transparent 55%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.22), transparent 55%)",
                    }}
                  />
                  <span className="absolute bottom-4 left-4 font-display italic text-sm text-white tracking-wider drop-shadow">
                    No {data.serialNumber}
                  </span>
                </div>

                <div className="grid grid-cols-[2fr_1fr] gap-6 items-end">
                  <div>
                    <h2 className="font-heading text-2xl text-[#1C1C1E] leading-tight mb-1">
                      {productName || pickText(lang, "İsimsiz Parça", "Untitled Piece", "قطعة بدون اسم")}
                    </h2>
                    {data.collection && (
                      <p className="font-display italic text-[15px] text-[#1C1C1E]/60">
                        {data.collection}
                        {data.collectionYear ? ` · ${data.collectionYear}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/50 mb-1.5">
                      {pickText(lang, "Seri No", "Serial", "الرقم")}
                    </p>
                    <p className="font-display text-lg tracking-widest text-[#1C1C1E]">
                      {data.serialNumber}
                    </p>
                  </div>
                </div>
              </section>

              <SectionHeader num="02" title={pickText(lang, "Detaylar", "Details", "التفاصيل")} />

              {/* Details */}
              <section className="mb-10">
                <DetailRow
                  label={pickText(lang, "Parti No", "Batch No", "رقم الدفعة")}
                  value={data.batchNumber || "—"}
                />
                <DetailRow
                  label={pickText(lang, "Üretim", "Production", "الإنتاج")}
                  value={data.productionDate || "—"}
                  italic
                />
                <DetailRow
                  label={pickText(lang, "Kumaş", "Material", "القماش")}
                  value={data.material || "—"}
                  italic
                />
                <DetailRow
                  label={pickText(lang, "Statü", "Status", "الحالة")}
                  value={
                    data.status === "registered" && !viewerIsOwner
                      ? pickText(lang, "Tescilli", "Registered", "مسجّل")
                      : statusLabel(data.status)
                  }
                  italic
                />
              </section>

              {/* Counter card */}
              <section className="relative bg-white border border-[#1C1C1E]/10 p-7 mb-12">
                <span className="absolute top-[-1px] left-6 w-8 h-0.5 bg-[#C9A96E]" />
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/50 mb-2.5">
                      {pickText(lang, "Görüntülenme", "Scans", "المسح")}
                    </p>
                    <p className="font-heading text-4xl text-[#1C1C1E] leading-none">
                      {String(data.scanCount ?? 0).padStart(2, "0")}
                    </p>
                    <p className="font-display italic text-sm text-[#1C1C1E]/60 mt-1">
                      {pickText(lang, "toplam tarama", "total scans", "إجمالي المسح")}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/50 mb-2.5">
                      {pickText(lang, "İlk Tarama", "First Scan", "أول مسح")}
                    </p>
                    <p className="font-heading text-lg text-[#1C1C1E] leading-none pt-3.5">
                      {formatLocalizedDate(data.firstScannedAt, lang) ||
                        pickText(lang, "Az önce", "Just now", "للتو")}
                    </p>
                  </div>
                </div>
                <p className="mt-5 pt-5 border-t border-[#1C1C1E]/10 font-display italic text-[15px] text-[#1C1C1E]/70 leading-relaxed">
                  {(data.scanCount ?? 0) > 5
                    ? pickText(
                        lang,
                        "Bu parça birçok kez görüntülenmiştir. Yüksek sayı, sahiplik kaydı yapılmadıysa taklit şüphesi doğurabilir.",
                        "This piece has been scanned many times. High counts may raise authenticity concerns if ownership is not registered.",
                        "تم مسح هذه القطعة عدة مرات. قد يثير العدد المرتفع مخاوف بشأن الأصالة.",
                      )
                    : pickText(
                        lang,
                        "Düşük görüntülenme sayısı parçanın yeni olduğunu gösterir — yüksek sayı taklit şüphesi doğurur.",
                        "A low scan count indicates a fresh piece — high counts may raise authenticity concerns.",
                        "عدد مسح منخفض يشير إلى قطعة جديدة — الأعداد العالية قد تثير شكوكًا في الأصالة.",
                      )}
                </p>
              </section>

              <SectionHeader num="03" title={pickText(lang, "Sahiplik", "Ownership", "الملكية")} />

              <OwnershipCard
                lang={lang}
                data={data}
                viewerIsOwner={viewerIsOwner}
                isAuthenticated={!!user}
                currentUserName={user?.name || null}
                currentUserEmail={user?.email || null}
                onClaimForOrder={() =>
                  claimForOrderMutation.mutate({ serialNumber: data.serialNumber })
                }
                onRegister={(name, email) =>
                  registerMutation.mutate({ serialNumber: data.serialNumber, name, email })
                }
                onTransferStart={(name, email, note) =>
                  transferStartMutation.mutate({
                    serialNumber: data.serialNumber,
                    name,
                    email,
                    note,
                  })
                }
                onTransferCancel={() =>
                  transferCancelMutation.mutate({ serialNumber: data.serialNumber })
                }
                busy={
                  registerMutation.isPending ||
                  transferStartMutation.isPending ||
                  transferCancelMutation.isPending ||
                  claimForOrderMutation.isPending
                }
              />

              {/* Certificate */}
              <section className="relative bg-white border border-[#1C1C1E]/10 text-center py-10 px-6 my-12">
                <span className="absolute top-3 left-3 w-5 h-5 border-t border-l border-[#C9A96E]" />
                <span className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-[#C9A96E]" />
                <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/50 mb-4">
                  {pickText(lang, "Orijinallik Belgesi", "Certificate of Authenticity", "شهادة الأصالة")}
                </p>
                <h3 className="font-display italic text-3xl text-[#1C1C1E] leading-tight mb-2">
                  {pickText(lang, "Orijinallik", "Certificate of", "شهادة")}
                  <br />
                  {pickText(lang, "Sertifikası", "Authenticity", "الأصالة")}
                </h3>
                <p className="font-display text-sm text-[#1C1C1E]/60 mb-7">
                  {pickText(
                    lang,
                    "Bu parçaya özel dijital belge",
                    "Digital document for this piece",
                    "وثيقة رقمية خاصة بهذه القطعة",
                  )}
                </p>
                <button
                  onClick={() =>
                    downloadCertificate(data, lang, productName, { includeOwner: viewerIsOwner })
                  }
                  className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#1C1C1E] text-white font-body text-[11px] tracking-[0.25em] uppercase hover:bg-[#1C1C1E]/90 transition-colors"
                >
                  <Download size={14} />
                  <span>{pickText(lang, "Sertifikayı İndir", "Download Certificate", "تحميل الشهادة")}</span>
                </button>
              </section>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-4 my-10">
      <span className="font-display italic text-[15px] text-[#C9A96E]">{num}</span>
      <span className="font-body text-[11px] tracking-[0.3em] uppercase text-[#1C1C1E]/60">{title}</span>
      <span className="flex-1 h-px bg-[#1C1C1E]/10" />
    </div>
  );
}

function DetailRow({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-4 border-b border-[#1C1C1E]/10 last:border-b-0">
      <span className="font-body text-[11px] tracking-[0.3em] uppercase text-[#1C1C1E]/55 shrink-0">{label}</span>
      <span className={`font-display text-[17px] text-[#1C1C1E] text-right ${italic ? "italic" : ""}`}>{value}</span>
    </div>
  );
}

function LoadingState({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-[#1C1C1E]/50 gap-4">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="font-display italic text-[15px]">
        {pickText(lang, "Kayıt doğrulanıyor…", "Verifying record…", "جاري التحقق من السجل…")}
      </p>
    </div>
  );
}

function NotFoundState({ lang, serial }: { lang: Lang; serial: string }) {
  return (
    <div className="relative bg-white border border-[#1C1C1E]/10 text-center py-12 px-6 mt-6">
      <span className="absolute top-3 left-3 w-5 h-5 border-t border-l border-[#C9A96E]" />
      <span className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-[#C9A96E]" />
      <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/50 mb-3">
        {pickText(lang, "Kayıt Bulunamadı", "No Record Found", "لم يتم العثور على سجل")}
      </p>
      <h3 className="font-display italic text-2xl text-[#1C1C1E] leading-tight mb-3">
        “{serial}”
      </h3>
      <p className="font-display italic text-[15px] text-[#1C1C1E]/60 max-w-sm mx-auto leading-relaxed">
        {pickText(
          lang,
          "Bu seri numarasıyla eşleşen bir VOILÉE kaydı bulamadık. Lütfen numarayı kontrol edin veya müşteri hizmetleriyle iletişime geçin.",
          "We couldn’t find a VOILÉE record matching this serial. Please check the number or contact customer care.",
          "لم نتمكن من العثور على سجل VOILÉE مطابق. يرجى التحقق من الرقم أو التواصل معنا.",
        )}
      </p>
    </div>
  );
}

type VerificationData = {
  serialNumber: string;
  status: "unowned" | "registered" | "transferring";
  ownerUserId: number | null;
  ownerName: string | null;
  ownerEmail: string | null;
  registeredAt: Date | string | null;
  orderNumber: string | null;
  transferToName: string | null;
  transferToEmail: string | null;
};

function OwnershipCard({
  lang,
  data,
  viewerIsOwner,
  isAuthenticated,
  currentUserName,
  currentUserEmail,
  onClaimForOrder,
  onRegister,
  onTransferStart,
  onTransferCancel,
  busy,
}: {
  lang: Lang;
  data: VerificationData;
  viewerIsOwner: boolean;
  isAuthenticated: boolean;
  currentUserName: string | null;
  currentUserEmail: string | null;
  onClaimForOrder: () => void;
  onRegister: (name: string, email: string | undefined) => void;
  onTransferStart: (name: string, email: string, note?: string) => void;
  onTransferCancel: () => void;
  busy: boolean;
}) {
  const [registerName, setRegisterName] = useState(currentUserName ?? "");
  const [registerEmail, setRegisterEmail] = useState(currentUserEmail ?? "");
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferName, setTransferName] = useState("");
  const [transferEmail, setTransferEmail] = useState("");
  const [transferNote, setTransferNote] = useState("");

  useEffect(() => {
    if (currentUserName && !registerName) setRegisterName(currentUserName);
    if (currentUserEmail && !registerEmail) setRegisterEmail(currentUserEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserName, currentUserEmail]);

  useEffect(() => {
    if (!viewerIsOwner) setTransferOpen(false);
  }, [viewerIsOwner]);

  const registrationDate = formatLocalizedDate(data.registeredAt, lang);

  return (
    <section className="relative bg-white border border-[#1C1C1E]/10 p-7 sm:p-9 mb-8">
      <span className="absolute top-[-1px] left-6 w-8 h-0.5 bg-[#C9A96E]" />

      {data.status === "unowned" && (
        <>
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/50 mb-4">
            {pickText(lang, "Tescil", "Registration", "التسجيل")}
          </p>
          <h3 className="font-display italic text-2xl sm:text-3xl text-[#1C1C1E] leading-snug mb-2">
            {pickText(lang, "Bu parça sizi bekliyor.", "This piece is waiting for you.", "هذه القطعة بانتظارك.")}
          </h3>
          <p className="font-display italic text-[15px] text-[#1C1C1E]/60 mb-6">
            {pickText(
              lang,
              "Sahipliği adınıza tescil ederek bu parçanın kalıcı kaydını oluşturabilirsiniz.",
              "Register ownership in your name to create a permanent record of this piece.",
              "سجّل الملكية باسمك لإنشاء سجل دائم لهذه القطعة.",
            )}
          </p>

          {data.orderNumber && (
            <div className="bg-[#C9A96E]/10 border-l-2 border-[#C9A96E] px-5 py-4 mb-6">
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/55 mb-1">
                {pickText(lang, "Eşleşen Sipariş", "Matching Order", "الطلب المطابق")}
              </p>
              <p className="font-display text-base text-[#1C1C1E]">#{data.orderNumber}</p>
              {isAuthenticated && (
                <button
                  onClick={onClaimForOrder}
                  disabled={busy}
                  className="mt-3 inline-flex items-center gap-2 font-body text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] border-b border-[#C9A96E] pb-1 hover:opacity-80 transition-opacity disabled:opacity-60"
                >
                  <span>
                    {pickText(
                      lang,
                      "Bu Siparişle Eşleştir ve Tescil Et",
                      "Match with This Order & Register",
                      "طابق هذا الطلب وسجّل",
                    )}
                  </span>
                  <ArrowRight size={12} />
                </button>
              )}
              {!isAuthenticated && (
                <p className="mt-2 font-display italic text-[13px] text-[#1C1C1E]/55">
                  {pickText(
                    lang,
                    "Giriş yaparsanız tek tıkla siparişinizle eşleştirebilirsiniz.",
                    "Sign in to auto-match with your order in one click.",
                    "سجّل الدخول لمطابقة الطلب بنقرة واحدة.",
                  )}
                </p>
              )}
            </div>
          )}

          <div className="space-y-3.5 mb-5">
            <FormField label={pickText(lang, "Ad Soyad", "Full Name", "الاسم الكامل")}>
              <input
                value={registerName}
                onChange={e => setRegisterName(e.target.value)}
                placeholder={pickText(lang, "Örn. Elif A.", "e.g. Elif A.", "مثال: إليف أ.")}
                className="w-full px-4 py-3 bg-[#F7F3EC] border border-[#1C1C1E]/10 font-display text-[15px] text-[#1C1C1E] placeholder:italic placeholder:text-[#1C1C1E]/40 focus:outline-none focus:border-[#C9A96E] transition-colors"
              />
            </FormField>
            <FormField label={pickText(lang, "E-posta · İsteğe Bağlı", "Email · Optional", "البريد · اختياري")}>
              <input
                type="email"
                value={registerEmail}
                onChange={e => setRegisterEmail(e.target.value)}
                placeholder="ornek@eposta.com"
                className="w-full px-4 py-3 bg-[#F7F3EC] border border-[#1C1C1E]/10 font-display text-[15px] text-[#1C1C1E] placeholder:italic placeholder:text-[#1C1C1E]/40 focus:outline-none focus:border-[#C9A96E] transition-colors"
              />
            </FormField>
          </div>

          <button
            onClick={() => {
              const name = registerName.trim();
              if (!name) {
                toast.error(pickText(lang, "Lütfen adınızı girin.", "Please enter your name.", "الرجاء إدخال الاسم."));
                return;
              }
              onRegister(name, registerEmail.trim() || undefined);
            }}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 py-4 bg-[#1C1C1E] text-white font-body text-[11px] tracking-[0.3em] uppercase hover:bg-[#1C1C1E]/90 transition-colors disabled:opacity-60"
          >
            <span>{pickText(lang, "Adıma Tescil Et", "Register in My Name", "سجّل باسمي")}</span>
            <ArrowRight size={14} />
          </button>

          <p className="mt-5 font-display italic text-sm text-[#1C1C1E]/55 leading-relaxed">
            {pickText(
              lang,
              "Tescil sonrası parça kalıcı olarak adınıza kaydedilir. İade durumunda kayıt otomatik geri alınır.",
              "After registration the piece is permanently recorded in your name. In case of return, the record is rolled back automatically.",
              "بعد التسجيل، تُسجَّل القطعة باسمك بشكل دائم. في حال الإرجاع يُستعاد السجل تلقائيًا.",
            )}
          </p>
        </>
      )}

      {data.status === "registered" && !transferOpen && viewerIsOwner && (
        <>
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/50 mb-4">
            {pickText(lang, "Tescilli", "Registered", "مسجّل")}
          </p>
          <h3 className="font-display italic text-2xl sm:text-3xl text-[#1C1C1E] leading-snug mb-6">
            {pickText(lang, "Bu parça size aittir.", "This piece is yours.", "هذه القطعة لك.")}
          </h3>

          <div className="flex items-start gap-4 border border-[#C9A96E] bg-[#C9A96E]/5 p-5 mb-6">
            <div className="font-display italic text-5xl leading-none text-[#C9A96E] shrink-0">
              {(data.ownerName ?? "—").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-body text-[9px] tracking-[0.3em] uppercase text-[#1C1C1E]/55 mb-1">
                {pickText(lang, "Sahip", "Owner", "المالك")}
              </p>
              <p className="font-heading text-lg text-[#1C1C1E] mb-0.5">{data.ownerName}</p>
              {registrationDate && (
                <p className="font-display italic text-[13px] text-[#1C1C1E]/55">
                  {pickText(lang, "Tescil tarihi", "Registered on", "تاريخ التسجيل")} · {registrationDate}
                </p>
              )}
            </div>
            <ShieldCheck className="w-5 h-5 text-[#C9A96E] shrink-0" />
          </div>

          <p className="font-display italic text-[15px] text-[#1C1C1E]/60 mb-4 leading-relaxed">
            {pickText(
              lang,
              "Parçayı bir sevdiğinize devretmek mi istiyorsunuz? VOILÉE kaydı ona geçer, sahiplik tarihçesi korunur.",
              "Would you like to transfer this piece? The VOILÉE record passes to them, and the ownership history is preserved.",
              "هل تودّ نقل ملكية القطعة؟ ينتقل سجل VOILÉE إلى الشخص الجديد مع الحفاظ على التاريخ.",
            )}
          </p>

          <button
            onClick={() => setTransferOpen(true)}
            className="inline-flex items-center gap-2 font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/70 hover:text-[#C9A96E] border-b border-[#C9A96E] pb-1 transition-colors"
          >
            <span>{pickText(lang, "Bu Parçayı Devret", "Transfer This Piece", "نقل هذه القطعة")}</span>
            <ArrowRight size={12} />
          </button>
        </>
      )}

      {data.status === "registered" && !transferOpen && !viewerIsOwner && (
        <>
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/50 mb-4">
            {pickText(lang, "Tescilli", "Registered", "مسجّل")}
          </p>
          <h3 className="font-display italic text-2xl sm:text-3xl text-[#1C1C1E] leading-snug mb-4">
            {pickText(
              lang,
              "Bu parça bir sahip kaydına bağlıdır.",
              "This piece is linked to an ownership record.",
              "هذه القطعة مرتبطة بسجل ملكية.",
            )}
          </h3>
          <p className="font-display italic text-[15px] text-[#1C1C1E]/60 mb-6 leading-relaxed">
            {!isAuthenticated
              ? pickText(
                  lang,
                  "Sahip adı ve kişisel bilgiler yalnızca kayıtlı hesap sahibine gösterilir. Giriş yaparak parçanın size ait olup olmadığını doğrulayabilirsiniz.",
                  "Owner details are only shown to the signed-in account holder. Sign in to confirm whether this piece is registered to you.",
                  "تُعرض بيانات المالك فقط لصاحب الحساب المسجّل. سجّل الدخول للتحقق مما إذا كانت القطعة مسجّلة باسمك.",
                )
              : pickText(
                  lang,
                  "Bu parça şu an hesabınıza tescil edilmemiş görünüyor. Sahip bilgileri gizlenmektedir.",
                  "This piece does not appear to be registered to your account. Owner details are hidden.",
                  "لا تبدو هذه القطعة مسجّلة لحسابك. تفاصيل المالك مخفية.",
                )}
          </p>
          <div className="flex items-start gap-4 border border-[#1C1C1E]/10 bg-[#F7F3EC] p-5">
            <ShieldCheck className="w-5 h-5 text-[#C9A96E] shrink-0 mt-0.5" />
            <p className="font-body text-xs text-[#1C1C1E]/55 leading-relaxed">
              {pickText(
                lang,
                "Gizlilik nedeniyle üçüncü şahıslar sahip adını göremez.",
                "For privacy, owner names are not visible to third parties.",
                "لأسباب الخصوصية، لا يظهر اسم المالك لأطراف ثالثة.",
              )}
            </p>
          </div>
        </>
      )}

      {data.status === "transferring" && !viewerIsOwner && (
          <>
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/50 mb-4">
              {pickText(lang, "Devir", "Transfer", "النقل")}
            </p>
            <h3 className="font-display italic text-2xl sm:text-3xl text-[#1C1C1E] leading-snug mb-4">
              {pickText(
                lang,
                "Bu parça için devir süreci devam ediyor olabilir.",
                "A transfer may be in progress for this piece.",
                "قد يكون نقل ملكية قيد التنفيذ لهذه القطعة.",
              )}
            </h3>
            <p className="font-display italic text-[15px] text-[#1C1C1E]/60 leading-relaxed">
              {pickText(
                lang,
                "Devir ve alıcı bilgileri yalnızca kayıtlı sahip hesabına gösterilir.",
                "Transfer and recipient details are only visible to the registered owner account.",
                "تفاصيل النقل والمستلم تظهر فقط لحساب المالك المسجّل.",
              )}
            </p>
          </>
        )}

      {(data.status === "transferring" || (data.status === "registered" && transferOpen)) && viewerIsOwner && (
        <>
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/50 mb-4">
            {pickText(lang, "Devir", "Transfer", "النقل")}
          </p>
          <h3 className="font-display italic text-2xl sm:text-3xl text-[#1C1C1E] leading-snug mb-2">
            {pickText(
              lang,
              "Yeni sahibi kime emanet ediyorsunuz?",
              "To whom are you entrusting the new ownership?",
              "إلى من تُسند الملكية الجديدة؟",
            )}
          </h3>
          <p className="font-display italic text-[15px] text-[#1C1C1E]/60 mb-6">
            {pickText(
              lang,
              "Belirlediğiniz kişiye davet gönderilir. Kabul ettiğinde parça VOILÉE hesabına aktarılır.",
              "An invitation is sent to the person you specify. The piece is transferred once they accept.",
              "تُرسل دعوة إلى الشخص المحدد، وتنتقل القطعة فور قبوله.",
            )}
          </p>

          {data.status === "transferring" && data.transferToName && (
            <div className="bg-[#C9A96E]/10 border-l-2 border-[#C9A96E] px-5 py-4 mb-6">
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/55 mb-1">
                {pickText(lang, "Bekleyen Alıcı", "Pending Recipient", "المستلم المعلّق")}
              </p>
              <p className="font-display text-base text-[#1C1C1E]">
                {data.transferToName} · <span className="italic text-[#1C1C1E]/60">{data.transferToEmail}</span>
              </p>
            </div>
          )}

          {data.status !== "transferring" && (
            <div className="space-y-3.5 mb-5">
              <FormField label={pickText(lang, "Alıcı · Ad Soyad", "Recipient · Full Name", "المستلم · الاسم")}>
                <input
                  value={transferName}
                  onChange={e => setTransferName(e.target.value)}
                  placeholder={pickText(lang, "Örn. Ayşe Yılmaz", "e.g. Ayşe Yılmaz", "مثال: أيشه يلماز")}
                  className="w-full px-4 py-3 bg-[#F7F3EC] border border-[#1C1C1E]/10 font-display text-[15px] text-[#1C1C1E] placeholder:italic placeholder:text-[#1C1C1E]/40 focus:outline-none focus:border-[#C9A96E] transition-colors"
                />
              </FormField>
              <FormField label={pickText(lang, "E-posta Adresi", "Email Address", "البريد الإلكتروني")}>
                <input
                  type="email"
                  value={transferEmail}
                  onChange={e => setTransferEmail(e.target.value)}
                  placeholder="ornek@eposta.com"
                  className="w-full px-4 py-3 bg-[#F7F3EC] border border-[#1C1C1E]/10 font-display text-[15px] text-[#1C1C1E] placeholder:italic placeholder:text-[#1C1C1E]/40 focus:outline-none focus:border-[#C9A96E] transition-colors"
                />
              </FormField>
              <FormField label={pickText(lang, "Kişisel Not · İsteğe Bağlı", "Personal Note · Optional", "ملاحظة · اختياري")}>
                <input
                  value={transferNote}
                  onChange={e => setTransferNote(e.target.value)}
                  placeholder={pickText(
                    lang,
                    "Kısa bir dilek ya da anı notu",
                    "A short wish or memory note",
                    "تمنٍّ أو ذكرى قصيرة",
                  )}
                  className="w-full px-4 py-3 bg-[#F7F3EC] border border-[#1C1C1E]/10 font-display text-[15px] text-[#1C1C1E] placeholder:italic placeholder:text-[#1C1C1E]/40 focus:outline-none focus:border-[#C9A96E] transition-colors"
                />
              </FormField>
            </div>
          )}

          <div className="flex gap-3">
            {data.status === "transferring" ? (
              <button
                onClick={() => onTransferCancel()}
                disabled={busy}
                className="flex-1 py-4 bg-transparent border border-[#1C1C1E] text-[#1C1C1E] font-body text-[11px] tracking-[0.3em] uppercase hover:bg-[#1C1C1E] hover:text-white transition-colors disabled:opacity-60"
              >
                {pickText(lang, "Daveti İptal Et", "Cancel Invitation", "إلغاء الدعوة")}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setTransferOpen(false)}
                  disabled={busy}
                  className="py-4 px-6 bg-transparent border border-[#1C1C1E] text-[#1C1C1E] font-body text-[11px] tracking-[0.3em] uppercase hover:bg-[#1C1C1E] hover:text-white transition-colors disabled:opacity-60"
                >
                  {pickText(lang, "Vazgeç", "Cancel", "إلغاء")}
                </button>
                <button
                  onClick={() => {
                    const name = transferName.trim();
                    const email = transferEmail.trim();
                    if (!name || !email) {
                      toast.error(
                        pickText(lang, "Lütfen ad ve e-posta girin.", "Please enter name and email.", "الرجاء إدخال الاسم والبريد."),
                      );
                      return;
                    }
                    onTransferStart(name, email, transferNote.trim() || undefined);
                    setTransferOpen(false);
                    setTransferName("");
                    setTransferEmail("");
                    setTransferNote("");
                  }}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#1C1C1E] text-white font-body text-[11px] tracking-[0.3em] uppercase hover:bg-[#1C1C1E]/90 transition-colors disabled:opacity-60"
                >
                  <span>{pickText(lang, "Daveti Gönder", "Send Invitation", "إرسال الدعوة")}</span>
                  <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>

          <p className="mt-5 font-display italic text-sm text-[#1C1C1E]/55 leading-relaxed">
            {pickText(
              lang,
              "Davet 7 gün geçerlidir. Alıcı kabul edene kadar parça sizin adınıza kayıtlı kalır.",
              "The invitation is valid for 7 days. Until accepted, the piece remains under your name.",
              "الدعوة صالحة لمدة 7 أيام. تظل القطعة باسمك حتى يقبلها المستلم.",
            )}
          </p>
        </>
      )}
    </section>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/55">{label}</label>
      {children}
    </div>
  );
}

function downloadCertificate(
  data: {
    serialNumber: string;
    batchNumber: string | null;
    productionDate: string | null;
    material: string | null;
    collection: string | null;
    collectionYear: string | null;
    ownerName: string | null;
  },
  lang: Lang,
  productName: string,
  opts?: { includeOwner?: boolean },
) {
  const includeOwner = opts?.includeOwner === true;
  const title = pickText(lang, "VOILÉE — Orijinallik Sertifikası", "VOILÉE — Certificate of Authenticity", "VOILÉE — شهادة الأصالة");
  const lines = [
    title,
    "",
    `${pickText(lang, "Parça", "Piece", "القطعة")}: ${productName || "—"}`,
    `${pickText(lang, "Koleksiyon", "Collection", "المجموعة")}: ${data.collection ?? "—"}${data.collectionYear ? ` · ${data.collectionYear}` : ""}`,
    `${pickText(lang, "Seri No", "Serial", "الرقم")}: ${data.serialNumber}`,
    `${pickText(lang, "Parti", "Batch", "الدفعة")}: ${data.batchNumber ?? "—"}`,
    `${pickText(lang, "Üretim", "Production", "الإنتاج")}: ${data.productionDate ?? "—"}`,
    `${pickText(lang, "Kumaş", "Material", "القماش")}: ${data.material ?? "—"}`,
    includeOwner && data.ownerName
      ? `${pickText(lang, "Sahip", "Owner", "المالك")}: ${data.ownerName}`
      : "",
    "",
    pickText(
      lang,
      "Bu belge, VOILÉE tarafından üretilmiş orijinal bir parçanın dijital sertifikasıdır.",
      "This document is the digital certificate of an original piece produced by VOILÉE.",
      "هذه الوثيقة هي الشهادة الرقمية لقطعة أصلية من إنتاج VOILÉE.",
    ),
    "",
    `voilee.com.tr/dogrulama/${data.serialNumber}`,
  ].filter(Boolean);

  const content = lines.join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `VOILEE-Sertifika-${data.serialNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}
