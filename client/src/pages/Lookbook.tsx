import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, type Collection } from "@/lib/api";

function collectionLabel(col: Collection, lang: "TR" | "EN" | "AR") {
  return lang === "EN" ? col.nameEN : lang === "AR" ? col.nameAR : col.nameTR;
}

function toWordTR(n: number): string {
  const words: Record<number, string> = {
    1: "Bir", 2: "İki", 3: "Üç", 4: "Dört", 5: "Beş",
    6: "Altı", 7: "Yedi", 8: "Sekiz", 9: "Dokuz", 10: "On",
  };
  return words[n] ?? String(n);
}

function toWordEN(n: number): string {
  const words: Record<number, string> = {
    1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five",
    6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten",
  };
  return words[n] ?? String(n);
}

const LOOKBOOK_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_lookbook-NdUh3UyfmAcub83uXdTERo.webp";

const collectionCopy: Record<
  string,
  { tagTR: string; tagEN: string; bodyTR: string; bodyEN: string }
> = {
  origine: {
    tagTR: "Sade bir başlangıç.",
    tagEN: "A simple beginning.",
    bodyTR: "Günün en sessiz anı. Fazlalık yok. Kendinle arandaki mesafe kapanmış.",
    bodyEN: "The quietest moment of the day. No excess. The distance between you and yourself, closed.",
  },
  mouvement: {
    tagTR: "Akışın içinde.",
    tagEN: "In the flow.",
    bodyTR: "Hareket kısıtlanmaz. Gün hafifçe akar — onunla birlikte.",
    bodyEN: "Movement is never constrained. The day flows gently — and so do you.",
  },
  epure: {
    tagTR: "Netlik yeterlidir.",
    tagEN: "Clarity is enough.",
    bodyTR: "Nerede durulduğu belli. Düzen kendiliğinden gelir, dayatılmaz.",
    bodyEN: "Where to stand is clear. Order arrives on its own — never imposed.",
  },
  noir: {
    tagTR: "Sessiz bir varlık.",
    tagEN: "A silent presence.",
    bodyTR: "Dikkat istemez. Yine de hissedilir.",
    bodyEN: "It asks for no attention. And yet, it is felt.",
  },
  heritage: {
    tagTR: "Kalan anlar.",
    tagEN: "The moments that stay.",
    bodyTR: "Bazı günler sıradan kalmak istemez. İz bırakmak için çaba değil, özen gerekir.",
    bodyEN: "Some days refuse to be ordinary. Leaving a mark takes care, not effort.",
  },
  atelier: {
    tagTR: "Tek parça. Tek ifade.",
    tagEN: "One piece. One expression.",
    bodyTR: "Herkese ait olmayan seçimler. Detay fark edilir.",
    bodyEN: "Choices that don't belong to everyone. The detail is noticed.",
  },
};

const ui = {
  TR: {
    seasonTag: "Lookbook 2026",
    coverTitle: "Bir Duruşun\nHikayesi",
    editorLabel: "Editörden",
    editorText: "2026 sezonu, ışığın bir günde nasıl değiştiğini anlatır. Her silüet ayrı bir an değil — aynı kadının içinden geçtiği farklı bir hâl. Bir parçayı giymek, o hâle adım atmaktır.",
    editorSign: "— VOILÉE Atelier",
    exploreLink: "Keşfet",
    ctaHref: "/siluetler",
    closingCta: "Tüm Silüetleri Gör",
  },
  EN: {
    seasonTag: "Lookbook 2026",
    coverTitle: "The Story of\na Posture",
    editorLabel: "Editor's Note",
    editorText: "The 2026 season tells the story of how light shifts across a single day. Each silhouette is not a separate moment — it is a different state the same woman moves through. To wear a piece is to step into that state.",
    editorSign: "— VOILÉE Atelier",
    exploreLink: "Explore",
    ctaHref: "/en/silhouettes",
    closingCta: "View All Silhouettes",
  },
  AR: {
    seasonTag: "Lookbook 2026",
    coverTitle: "قصة\nموقف",
    editorLabel: "من المحرر",
    editorText: "تحكي موسم 2026 كيف يتغير الضوء خلال يوم واحد. كل صورة ظلية ليست لحظة منفصلة — بل هي حالة مختلفة تمر بها نفس المرأة. ارتداء قطعة يعني الدخول في تلك الحالة.",
    editorSign: "— أتيليه VOILÉE",
    exploreLink: "استكشف",
    ctaHref: "/ar/silhouettes",
    closingCta: "عرض جميع الصور الظلية",
  },
};

// ─── Scroll fade-in ───────────────────────────────────────────────────────────

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); ob.disconnect(); } }, { threshold: 0.1 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return { ref, visible };
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useFadeIn();
  return (
    <div ref={ref} className={`transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── Koleksiyon satırı ────────────────────────────────────────────────────────

function CollectionRow({ col, index, lang, exploreLabel, ctaHref }: {
  col: Collection; index: number; lang: "TR" | "EN" | "AR"; exploreLabel: string; ctaHref: string;
}) {
  const isReversed = index % 2 !== 0;
  const fallbackName = collectionLabel(col, lang);
  const copy = collectionCopy[col.slug] ?? { tagTR: fallbackName, tagEN: fallbackName, bodyTR: "", bodyEN: "" };
  const tag = lang === "TR" ? copy.tagTR : copy.tagEN;
  const body = lang === "TR" ? copy.bodyTR : copy.bodyEN;

  return (
    <FadeIn>
      <div className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
        {/* Görsel — %58 genişlik */}
        <div className="relative overflow-hidden lg:w-[58%] aspect-[4/5] lg:aspect-[4/3] group">
          {col.imageUrl
            ? <img src={col.imageUrl} alt={collectionLabel(col, lang)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            : <div className="w-full h-full bg-[#E8E0D5]" />}
          <div className={`absolute top-6 ${isReversed ? "right-6" : "left-6"} font-body text-[10px] tracking-[0.3em] uppercase text-white/50`}>
            {String(index + 1).padStart(2, "0")}
          </div>
        </div>

        {/* Metin — %42 genişlik */}
        <div className={`lg:w-[42%] bg-[#F7F3EC] flex items-center ${isReversed ? "lg:justify-end" : "lg:justify-start"}`}>
          <div className="p-8 lg:p-14 xl:p-20 max-w-sm w-full">
            <p className="font-body text-[10px] tracking-[0.35em] uppercase text-[#C9A96E] mb-4">
              {collectionLabel(col, lang)}
            </p>
            <h2 className="font-display text-3xl lg:text-4xl italic text-[#1C1C1E] leading-tight mb-5">
              {tag}
            </h2>
            <div className="w-10 h-px bg-[#C9A96E] mb-5" />
            {body && (
              <p className="font-body text-sm text-[#1C1C1E]/60 leading-relaxed mb-8">
                {body}
              </p>
            )}
            <Link href={ctaHref}>
              <span className="inline-flex items-center gap-2 font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E] border-b border-[#1C1C1E]/30 pb-0.5 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors duration-300 cursor-pointer">
                {exploreLabel} <ArrowRight size={11} />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Skeleton satır ───────────────────────────────────────────────────────────

function SkeletonRow({ index }: { index: number }) {
  const isReversed = index % 2 !== 0;
  return (
    <div className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
      <div className="lg:w-[58%] bg-[#E8E0D5] animate-pulse aspect-[4/5] lg:aspect-[4/3]" />
      <div className="lg:w-[42%] bg-[#F7F3EC] flex items-center p-14">
        <div className="space-y-4 w-full max-w-xs">
          <div className="h-3 bg-[#E8E0D5] rounded animate-pulse w-20" />
          <div className="h-8 bg-[#E8E0D5] rounded animate-pulse w-full" />
          <div className="h-px bg-[#E8E0D5] w-10" />
          <div className="h-4 bg-[#E8E0D5] rounded animate-pulse w-3/4" />
          <div className="h-4 bg-[#E8E0D5] rounded animate-pulse w-1/2" />
        </div>
      </div>
    </div>
  );
}

// ─── Ana sayfa ────────────────────────────────────────────────────────────────

export default function Lookbook() {
  const { lang, isRTL } = useLanguage();
  const t = ui[lang];
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCollections()
      .then(res => {
        const sorted = [...res.data].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setCollections(sorted);
      })
      .catch(err => { console.error("[Lookbook]", err); setCollections([]); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F3EC]" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      {/* ── 1. KAPAK ── */}
      <section>
        <div className="grid lg:grid-cols-2 min-h-[70vh]">
          <div className="relative overflow-hidden min-h-[50vh] lg:min-h-[70vh]">
            <img src={LOOKBOOK_IMG} alt="Lookbook 2026" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/25" />
            <p className="absolute top-8 left-8 font-body text-[10px] tracking-[0.35em] uppercase text-white/55">
              {t.seasonTag}
            </p>
          </div>
          <div className="bg-[#1C1C1E] flex items-center justify-center p-10 lg:p-20">
            <div className="max-w-md">
              <h1 className="font-display text-4xl lg:text-5xl xl:text-6xl italic text-[#F7F3EC] leading-[1.15] mb-6 whitespace-pre-line">
                {t.coverTitle}
              </h1>
              <div className="w-12 h-px bg-[#C9A96E] mb-6" />
              <p className="font-body text-sm text-[#F7F3EC]/55 leading-relaxed">
                {lang === "TR"
                  ? `${toWordTR(collections.length)} silüet. Aynı kadının farklı hâlleri. Sabahın sessizliğinden gecenin gücüne.`
                  : lang === "EN"
                  ? `${toWordEN(collections.length)} silhouettes. The many states of one woman. From the silence of morning to the power of night.`
                  : `${collections.length} صور ظلية. حالات مختلفة لنفس المرأة. من هدوء الصباح إلى قوة الليل.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. EDİTÖRDEN ── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <FadeIn>
            <div className="max-w-2xl">
              <p className="font-body text-[10px] tracking-[0.35em] uppercase text-[#C9A96E] mb-6">
                {t.editorLabel}
              </p>
              <p className="font-display text-xl lg:text-2xl italic text-[#1C1C1E] leading-relaxed mb-8">
                {t.editorText}
              </p>
              <p className="font-body text-xs tracking-[0.2em] text-[#8B7355]">
                {t.editorSign}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 3. KOLEKSİYON AKIŞI ── */}
      <section>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} index={i} />)
          : collections.map((col, i) => (
              <CollectionRow key={col.id} col={col} index={i} lang={lang}
                exploreLabel={t.exploreLink}
                ctaHref={`${
                  lang === "TR" ? "/lookbook" : lang === "EN" ? "/en/lookbook" : "/ar/lookbook"
                }/${col.slug}`} />
            ))}
      </section>

      {/* ── 4. KAPANIŞ ── */}
      <section className="bg-[#1C1C1E] py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <FadeIn>
            <div className="max-w-xl">
              <p className="font-display text-2xl lg:text-3xl italic text-[#F7F3EC] leading-relaxed mb-10">
                {lang === "TR"
                  ? `${toWordTR(collections.length)} hâl. Bir kadın. Her gün için bir siluet.`
                  : lang === "EN"
                  ? `${toWordEN(collections.length)} states. One woman. A silhouette for every day.`
                  : `${collections.length} حالات. امرأة واحدة. صورة ظلية لكل يوم.`}
              </p>
              <Link href={t.ctaHref}>
                <span className="inline-flex items-center gap-3 font-body text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] border-b border-[#C9A96E]/40 pb-1 hover:border-[#C9A96E] transition-colors duration-300 cursor-pointer">
                  {t.closingCta} <ArrowRight size={11} />
                </span>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
