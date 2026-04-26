import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { sitePaths, type Lang } from "@/lib/sitePaths";
import { api, type Silhouette } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

// CDN URLs
const IMGS = {
  heroMain: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_hero_main-Z5A8u2f2u9H3JoSTeyVYih.webp",
  heroNoir: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_hero_noir-hQu4cXB47EThQiYwkHnE3F.webp",
  heroOrigine: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_hero_origine-gGGQSDVPAKHHXiL3dcqJVR.webp",
  about: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_about-koUYMmwRdG337Rztgx3iuQ.webp",
};

/** Rewrites legacy storefront paths from CMS / bookmarks (keys composed so old path literals do not reappear as string constants). */
function normalizeHeroHref(href: string | null | undefined): string {
  if (!href) return "";
  const legacy: Record<string, string> = {
    ["/" + "koleksiyonlar"]: sitePaths.silhouettes.TR,
    ["/" + "siluetler"]: sitePaths.silhouettes.TR,
    ["/en/" + "collections"]: sitePaths.silhouettes.EN,
    ["/ar/" + "collections"]: sitePaths.silhouettes.AR,
    [`${sitePaths.home.TR}/` + "collections"]: sitePaths.silhouettes.TR,
    ["/" + "hakkimizda"]: sitePaths.about.TR,
  };
  return legacy[href] ?? href;
}

const fallbackHeroSlides = [
  {
    imgUrl: IMGS.heroMain,
    imgUrlMobile: "",
    duration: 6000,
    linkUrl: "",
    tagTR: "Yeni Sezon",
    tagEN: "New Season",
    tagAR: "موسم جديد",
    titleTR: "Sessiz Lüks,\nKalıcı Zarafet",
    titleEN: "Quiet Luxury,\nTimeless Grace",
    titleAR: "الفخامة الهادئة،\nالأناقة الدائمة",
    subtitleTR: "VOILÉE ile her gün bir duruş.",
    subtitleEN: "Every day, a statement with VOILÉE.",
    subtitleAR: "مع VOILÉE، موقف كل يوم.",
    collection: "ORIGINE",
    ctaLabelTR: "Silüetleri Keşfet",
    ctaLabelEN: "Explore Silhouettes",
    ctaLabelAR: "استكشف الصور الظلية",
    ctaHrefTR: sitePaths.silhouettes.TR,
    ctaHrefEN: sitePaths.silhouettes.EN,
    ctaHrefAR: sitePaths.silhouettes.AR,
    ctaVisible: true,
    secLabelTR: "Hikayemiz",
    secLabelEN: "Our Story",
    secLabelAR: "Our Story",
    secHrefTR: sitePaths.about.TR,
    secHrefEN: sitePaths.about.EN,
    secHrefAR: sitePaths.about.AR,
    secVisible: true,
  },
  {
    imgUrl: IMGS.heroNoir,
    imgUrlMobile: "",
    duration: 6000,
    linkUrl: "",
    tagTR: "NOIR Silüeti",
    tagEN: "NOIR Silhouette",
    tagAR: "صورة ظلية NOIR",
    titleTR: "Sessiz Bir Güç,\nKaranlıkta Varlık",
    titleEN: "Silent Power,\nPresence in Darkness",
    titleAR: "قوة صامتة،\nالوجود في الظلام",
    subtitleTR: "Çaba gerekmez. Varlık zaten hissedilir.",
    subtitleEN: "No effort needed. Presence is already felt.",
    subtitleAR: "لا تحتاج إلى جهد. الوجود يُشعر به بالفعل.",
    collection: "NOIR",
    ctaLabelTR: "Silüetleri Keşfet",
    ctaLabelEN: "Explore Silhouettes",
    ctaLabelAR: "استكشف الصور الظلية",
    ctaHrefTR: sitePaths.silhouettes.TR,
    ctaHrefEN: sitePaths.silhouettes.EN,
    ctaHrefAR: sitePaths.silhouettes.AR,
    ctaVisible: true,
    secLabelTR: "Hikayemiz",
    secLabelEN: "Our Story",
    secLabelAR: "Our Story",
    secHrefTR: sitePaths.about.TR,
    secHrefEN: sitePaths.about.EN,
    secHrefAR: sitePaths.about.AR,
    secVisible: true,
  },
  {
    imgUrl: IMGS.heroOrigine,
    imgUrlMobile: "",
    duration: 6000,
    linkUrl: "",
    tagTR: "ORIGINE Silüeti",
    tagEN: "ORIGINE Silhouette",
    tagAR: "صورة ظلية ORIGINE",
    titleTR: "Sade Bir Başlangıç,\nDoğadan Gelen Denge",
    titleEN: "A Simple Beginning,\nBalance from Nature",
    titleAR: "بداية بسيطة،\nتوازن من الطبيعة",
    subtitleTR: "Fazlalık yok. Sadece sade bir denge.",
    subtitleEN: "No excess. Just simple balance.",
    subtitleAR: "لا إفراط. فقط توازن بسيط.",
    collection: "ORIGINE",
    ctaLabelTR: "Silüetleri Keşfet",
    ctaLabelEN: "Explore Silhouettes",
    ctaLabelAR: "استكشف الصور الظلية",
    ctaHrefTR: sitePaths.silhouettes.TR,
    ctaHrefEN: sitePaths.silhouettes.EN,
    ctaHrefAR: sitePaths.silhouettes.AR,
    ctaVisible: true,
    secLabelTR: "Hikayemiz",
    secLabelEN: "Our Story",
    secLabelAR: "Our Story",
    secHrefTR: sitePaths.about.TR,
    secHrefEN: sitePaths.about.EN,
    secHrefAR: sitePaths.about.AR,
    secVisible: true,
  },
];

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SilhouetteIndex({
  getText,
  lang,
}: {
  getText: (tr: string, en: string, ar: string) => string;
  lang: Lang;
}) {
  const [silhouettes, setHomeSilhouettes] = useState<Silhouette[]>([]);
  const [silhouettesLoading, setSilhouettesLoading] = useState(true);

  useEffect(() => {
    api.getSilhouettes()
      .then((res) =>
        setHomeSilhouettes(
          [...res.data].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        )
      )
      .catch(console.error)
      .finally(() => setSilhouettesLoading(false));
  }, []);

  const countLabel = String(silhouettes.length).padStart(2, "0");
  const heading = lang === "TR" ? "Siluetler" : lang === "EN" ? "Silhouettes" : "صور ظلية";

  const silhouettesPath = sitePaths.silhouettes[lang];

  return (
    <AnimatedSection>
      <section className="bg-[#F7F3EC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E]">
              {heading}
            </p>
            <p className="font-body text-sm tabular-nums text-[#1C1C1E]/40">
              {silhouettesLoading ? "00" : countLabel}
            </p>
          </div>

          <div className="mt-6">
            {silhouettesLoading ? (
              <>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`silhouette-skeleton-row grid grid-cols-[40px_1fr_24px] gap-x-4 items-center border-t border-[#1C1C1E]/10 py-5 lg:py-6 ${i === 2 ? "border-b border-[#1C1C1E]/10" : ""}`}
                  >
                    <div className="h-4 w-7 rounded bg-[#1C1C1E]/10" />
                    <div className="min-w-0">
                      <div className="h-8 max-w-[220px] rounded bg-[#1C1C1E]/10" />
                    </div>
                    <div className="h-4 w-4 rounded bg-[#1C1C1E]/10" />
                  </div>
                ))}
              </>
            ) : (
              silhouettes.map((sil, index) => {
                const num = String(index + 1).padStart(2, "0");
                const name =
                  lang === "EN" ? sil.nameEN :
                  lang === "AR" ? sil.nameAR :
                  sil.nameTR;
                return (
                  <AnimatedSection key={sil.id} delay={index * 60}>
                    <Link
                      href={`${silhouettesPath}?silhouette=${sil.slug}`}
                      className={`group grid grid-cols-[40px_1fr_24px] gap-x-4 items-start border-t border-[#1C1C1E]/10 py-5 lg:py-6 transition-colors duration-300 ${index === silhouettes.length - 1 ? "border-b border-[#1C1C1E]/10" : ""}`}
                    >
                      <span className="font-body text-sm text-[#1C1C1E]/30 transition-colors duration-300 group-hover:text-[#C9A96E] pt-0.5">
                        {num}
                      </span>
                      <div className="min-w-0 leading-tight">
                        <span className="font-display text-2xl lg:text-3xl text-[#1C1C1E] align-baseline">{name}</span>
                      </div>
                      <span className="flex justify-end pt-1 text-[#1C1C1E]/30 transition-colors duration-300 group-hover:text-[#C9A96E]">
                        <ArrowRight size={16} aria-hidden />
                      </span>
                    </Link>
                  </AnimatedSection>
                );
              })
            )}
          </div>

          <div className="pt-6 flex justify-end">
            <Link
              href={sitePaths.silhouettes[lang]}
              className="font-body text-xs tracking-[0.15em] uppercase text-[#1C1C1E]/60 hover:text-[#1C1C1E] border-b border-[#1C1C1E]/20 hover:border-[#1C1C1E] pb-0.5 transition-colors duration-300"
            >
              {getText("Tümünü keşfet", "Explore all", "استكشف الكل")}
            </Link>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}

export default function Home() {
  const { lang } = useLanguage();
  const { data: heroSlides = [], isLoading: heroLoading } = trpc.heroSlides.list.useQuery();

  const mappedHeroSlides = heroSlides.length
    ? heroSlides.map(slide => ({
      imgUrl: slide.imgUrl,
      imgUrlMobile: slide.imgUrlMobile ?? "",
      duration: slide.duration ?? 6000,
      linkUrl: slide.linkUrl ?? "",
      tagTR: slide.tagTR,
      tagEN: slide.tagEN,
      tagAR: slide.tagAR,
      titleTR: slide.titleTR,
      titleEN: slide.titleEN,
      titleAR: slide.titleAR,
      subtitleTR: slide.subtitleTR,
      subtitleEN: slide.subtitleEN,
      subtitleAR: slide.subtitleAR,
      collection: slide.titleTR || "VOILÉE",
      ctaLabelTR: slide.ctaLabelTR,
      ctaLabelEN: slide.ctaLabelEN,
      ctaLabelAR: slide.ctaLabelAR,
      ctaHrefTR: normalizeHeroHref(slide.ctaHrefTR),
      ctaHrefEN: normalizeHeroHref(slide.ctaHrefEN),
      ctaHrefAR: normalizeHeroHref(slide.ctaHrefAR),
      ctaVisible: slide.ctaVisible,
      secLabelTR: slide.secLabelTR,
      secLabelEN: slide.secLabelEN,
      secLabelAR: slide.secLabelAR,
      secHrefTR: normalizeHeroHref(slide.secHrefTR),
      secHrefEN: normalizeHeroHref(slide.secHrefEN),
      secHrefAR: normalizeHeroHref(slide.secHrefAR),
      secVisible: slide.secVisible,
    }))
    : fallbackHeroSlides;
  
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroTransition, setHeroTransition] = useState(true);

  useEffect(() => {
    if (mappedHeroSlides.length > 0 && heroIndex >= mappedHeroSlides.length) {
      setHeroIndex(0);
    }
  }, [mappedHeroSlides.length, heroIndex]);

  // Auto-advance hero
  useEffect(() => {
    if (mappedHeroSlides.length === 0) return;
    const currentDuration = mappedHeroSlides[heroIndex]?.duration ?? 6000;
    const timer = setTimeout(() => {
      setHeroTransition(false);
      setTimeout(() => {
        setHeroIndex((i) => (i + 1) % mappedHeroSlides.length);
        setHeroTransition(true);
      }, 300);
    }, currentDuration);
    return () => clearTimeout(timer);
  }, [heroIndex, mappedHeroSlides]);

  const goHero = (dir: number) => {
    setHeroTransition(false);
    setTimeout(() => {
      setHeroIndex((i) => (i + dir + mappedHeroSlides.length) % mappedHeroSlides.length);
      setHeroTransition(true);
    }, 300);
  };

  const slide = mappedHeroSlides[heroIndex];

  if (heroLoading || !slide) {
    return (
      <section className="relative h-screen min-h-[600px] bg-[#1C1C1E] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  const bgContent = (
    <>
      <picture className="block w-full h-full">
        {slide.imgUrlMobile && (
          <source media="(max-width: 768px)" srcSet={slide.imgUrlMobile} />
        )}
        <img
          src={slide.imgUrl}
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
    </>
  );

  
  const getText = (tr: string, en: string, ar: string) => {
    if (lang === "TR") return tr;
    if (lang === "EN") return en;
    return ar;
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${heroTransition ? "opacity-100" : "opacity-0"}`}
        >
          {slide.linkUrl ? (
            <Link href={slide.linkUrl} className="absolute inset-0 block">
              {bgContent}
            </Link>
          ) : (
            <div className="absolute inset-0">
              {bgContent}
            </div>
          )}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <p
                className={`font-body text-xs tracking-[0.25em] uppercase text-[#C9A96E] mb-4 transition-all duration-700 ${heroTransition ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "100ms" }}
              >
                {getText(slide.tagTR, slide.tagEN, slide.tagAR)}
              </p>
              <h1
                className={`font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.1] mb-6 transition-all duration-700 ${heroTransition ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "200ms" }}
              >
                {getText(slide.titleTR, slide.titleEN, slide.titleAR).split("\n").map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </h1>
              <p
                className={`font-body text-base text-white/70 mb-8 transition-all duration-700 ${heroTransition ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "300ms" }}
              >
                {getText(slide.subtitleTR, slide.subtitleEN, slide.subtitleAR)}
              </p>
              <div
                className={`flex items-center gap-4 transition-all duration-700 ${heroTransition ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "400ms" }}
              >
                {slide.ctaVisible && slide.ctaHrefTR && (
                  <Link href={getText(slide.ctaHrefTR, slide.ctaHrefEN, slide.ctaHrefAR)}>
                    <button className="btn-luxury btn-luxury-filled text-sm">
                      {getText(slide.ctaLabelTR, slide.ctaLabelEN, slide.ctaLabelAR)}
                      <ArrowRight size={14} />
                    </button>
                  </Link>
                )}
                {slide.secVisible && slide.secHrefTR && (
                  <Link href={getText(slide.secHrefTR, slide.secHrefEN, slide.secHrefAR)}>
                    <button className="font-body text-xs tracking-[0.15em] uppercase text-white/80 hover:text-white border-b border-white/40 hover:border-white pb-0.5 transition-all duration-300">
                      {getText(slide.secLabelTR, slide.secLabelEN, slide.secLabelAR)}
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Navigation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-6">
          <button onClick={() => goHero(-1)} className="text-white/60 hover:text-white transition-colors p-2">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            {mappedHeroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setHeroTransition(false); setTimeout(() => { setHeroIndex(i); setHeroTransition(true); }, 300); }}
                className={`transition-all duration-300 ${i === heroIndex ? "w-8 h-0.5 bg-[#C9A96E]" : "w-2 h-0.5 bg-white/40"}`}
              />
            ))}
          </div>
          <button onClick={() => goHero(1)} className="text-white/60 hover:text-white transition-colors p-2">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 z-10 hidden lg:flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-white/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full bg-white/80 animate-[scroll_2s_ease-in-out_infinite]" style={{ height: "40%", animation: "scrollDown 2s ease-in-out infinite" }} />
          </div>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-white/40 rotate-90 origin-center mt-4">Scroll</p>
        </div>

        {heroLoading && (
          <div className="absolute top-6 right-6 z-20">
            <div className="h-5 w-5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </section>

      {/* ===== MANIFESTO SECTION ===== */}
      <AnimatedSection>
        <section className="py-20 lg:py-32 bg-[#1C1C1E] relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <img src={IMGS.about} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <blockquote className="font-display text-3xl lg:text-5xl text-[#F7F3EC] leading-[1.3] mb-8">
                {lang === "TR"
                  ? "Biz koleksiyon yapmıyoruz. Siluet kuruyoruz."
                  : "We don't make collections. We build silhouettes."}
              </blockquote>
              <div className="w-16 h-px bg-[#C9A96E] mx-auto mb-8" />
              <p className="font-body text-base text-[#F7F3EC]/60 leading-relaxed max-w-xl mx-auto">
                {lang === "TR"
                  ? "Farklı kadınlar için değil, aynı kadının gün ve zaman içindeki hâlleri için tasarlıyoruz. Fazlalık olmadığında geriye duruş kalır."
                  : "We design not for different women, but for the same woman in her different states throughout the day and time. When there is no excess, only posture remains."}
              </p>
              <div className="mt-10">
                <Link href={sitePaths.about[lang]}>
                  <button className="btn-luxury text-white border-white/40 hover:bg-white hover:text-[#1C1C1E]">
                    {getText("Hakkımızda", "About Us", "من نحن")}
                    <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <SilhouetteIndex getText={getText} lang={lang} />

      {/* Journal Teaser - gerçek yazılar eklendiğinde buraya eklenecek */}

      {/* WhatsApp butonu buraya eklenecek */}

      <Footer />

      <style>{`
        @keyframes scrollDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
        @keyframes opacity-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.85; }
        }
        .silhouette-skeleton-row {
          animation: opacity-pulse 1.6s ease-in-out infinite;
        }
        .silhouette-skeleton-row:nth-child(2) { animation-delay: 0.15s; }
        .silhouette-skeleton-row:nth-child(3) { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}
