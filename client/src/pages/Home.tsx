import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { sitePaths } from "@/lib/sitePaths";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// CDN URLs
const IMGS = {
  heroMain: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_hero_main-Z5A8u2f2u9H3JoSTeyVYih.webp",
  heroNoir: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_hero_noir-hQu4cXB47EThQiYwkHnE3F.webp",
  heroOrigine: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_hero_origine-gGGQSDVPAKHHXiL3dcqJVR.webp",
  lookbook: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_lookbook-NdUh3UyfmAcub83uXdTERo.webp",
  about: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_about-koUYMmwRdG337Rztgx3iuQ.webp",
  cdnOrigine: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_origine_57e73407.webp",
  cdnNoir: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_noir_68a8f8b6.webp",
  cdnEpure: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_epure_2d5aaf15.webp",
  cdnHeritage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_heritage_1a6b4b02.webp",
  cdnMouvement: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_mouvement_7b7c4f3e.webp",
  cdnAtelier: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_atelier_d60dabd2.webp",
  productCanta: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_product_canta_cf6f1d7f.webp",
  productEsarp: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_product_esarp_119045e5.webp",
  productAbaya: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_product_abaya_ed7dff4a.webp",
  productParfum: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_product_parfum_f4067dbd.webp",
};

const heroSlides = [
  {
    img: IMGS.heroMain,
    tagTR: "Yeni Koleksiyon",
    tagEN: "New Collection",
    tagAR: "مجموعة جديدة",
    titleTR: "Sessiz Lüks,\nKalıcı Zarafet",
    titleEN: "Quiet Luxury,\nTimeless Grace",
    titleAR: "الفخامة الهادئة،\nالأناقة الدائمة",
    subtitleTR: "VOILÉE ile her gün bir duruş.",
    subtitleEN: "Every day, a statement with VOILÉE.",
    subtitleAR: "مع VOILÉE، موقف كل يوم.",
    collection: "ORIGINE",
  },
  {
    img: IMGS.heroNoir,
    tagTR: "NOIR Koleksiyonu",
    tagEN: "NOIR Collection",
    tagAR: "مجموعة NOIR",
    titleTR: "Sessiz Bir Güç,\nKaranlıkta Varlık",
    titleEN: "Silent Power,\nPresence in Darkness",
    titleAR: "قوة صامتة،\nالوجود في الظلام",
    subtitleTR: "Çaba gerekmez. Varlık zaten hissedilir.",
    subtitleEN: "No effort needed. Presence is already felt.",
    subtitleAR: "لا تحتاج إلى جهد. الوجود يُشعر به بالفعل.",
    collection: "NOIR",
  },
  {
    img: IMGS.heroOrigine,
    tagTR: "ORIGINE Koleksiyonu",
    tagEN: "ORIGINE Collection",
    tagAR: "مجموعة ORIGINE",
    titleTR: "Sade Bir Başlangıç,\nDoğadan Gelen Denge",
    titleEN: "A Simple Beginning,\nBalance from Nature",
    titleAR: "بداية بسيطة،\nتوازن من الطبيعة",
    subtitleTR: "Fazlalık yok. Sadece sade bir denge.",
    subtitleEN: "No excess. Just simple balance.",
    subtitleAR: "لا إفراط. فقط توازن بسيط.",
    collection: "ORIGINE",
  },
];

const collections = [
  { name: "ORIGINE", subtitleTR: "Sade Bir Başlangıç", subtitleEN: "A Simple Beginning", img: IMGS.cdnOrigine },
  { name: "MOUVEMENT", subtitleTR: "Akışta Bir Hâl", subtitleEN: "A State of Flow", img: IMGS.cdnMouvement },
  { name: "ÉPURE", subtitleTR: "Net Bir Duruş", subtitleEN: "A Clear Stance", img: IMGS.cdnEpure },
  { name: "NOIR", subtitleTR: "Sessiz Bir Güç", subtitleEN: "Silent Power", img: IMGS.cdnNoir },
  { name: "HÉRITAGE", subtitleTR: "Anlam Taşıyan Anlar", subtitleEN: "Moments of Meaning", img: IMGS.cdnHeritage },
  { name: "ATELIER", subtitleTR: "Tek Parça. Tek İfade.", subtitleEN: "One Piece. One Expression.", img: IMGS.cdnAtelier },
];

const reviews: { name: string; city: string; rating: number; textTR: string; textEN: string }[] = [];


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

export default function Home() {
  const { lang } = useLanguage();
  
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroTransition, setHeroTransition] = useState(true);

  // Auto-advance hero
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroTransition(false);
      setTimeout(() => {
        setHeroIndex((i) => (i + 1) % heroSlides.length);
        setHeroTransition(true);
      }, 300);
    }, 6000);
    
  const getText = (tr: string, en: string, ar: string) => {
    if (lang === "TR") return tr;
    if (lang === "EN") return en;
    return ar;
  };

  return () => clearInterval(timer);
  }, []);

  const goHero = (dir: number) => {
    setHeroTransition(false);
    setTimeout(() => {
      setHeroIndex((i) => (i + dir + heroSlides.length) % heroSlides.length);
      setHeroTransition(true);
    }, 300);
  };

  const slide = heroSlides[heroIndex];

  
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
          <img
            src={slide.img}
            alt={slide.collection}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
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
                <Link href={sitePaths.collections[lang]}>
                  <button className="btn-luxury btn-luxury-filled text-sm">
                    {getText("Koleksiyonu Keşfet", "Explore Collection", "استكشف المجموعة")}
                    <ArrowRight size={14} />
                  </button>
                </Link>
                <Link href={sitePaths.about[lang]}>
                  <button className="font-body text-xs tracking-[0.15em] uppercase text-white/80 hover:text-white border-b border-white/40 hover:border-white pb-0.5 transition-all duration-300">
                    {getText("Hikayemiz", "Our Story", "Our Story")}
                  </button>
                </Link>
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
            {heroSlides.map((_, i) => (
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
      </section>

      {/* ===== COLLECTIONS GRID ===== */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-3">
                  {getText("Koleksiyonlarımız", "Our Collections", "مجموعاتنا")}
                </p>
                <h2 className="font-display text-4xl lg:text-5xl text-[#1C1C1E]">
                  {getText("Altı Siluet,\nBir Kadın", "Six Silhouettes,\nOne Woman", "Six Silhouettes,\nOne Woman")}
                </h2>
              </div>
              <Link href={sitePaths.collections[lang]} className="hidden lg:flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-[#1C1C1E]/60 hover:text-[#1C1C1E] transition-colors border-b border-[#1C1C1E]/20 hover:border-[#1C1C1E] pb-0.5">
                {getText("Tümünü Gör", "View All", "عرض الكل")}
                <ArrowRight size={12} />
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {collections.map((col, i) => (
              <AnimatedSection key={col.name} delay={i * 80}>
                <Link href={sitePaths.collections[lang]}>
                  <div className="group relative overflow-hidden cursor-pointer">
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={col.img}
                        alt={col.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#C9A96E] mb-1">
                        {lang === "TR" ? col.subtitleTR : col.subtitleEN}
                      </p>
                      <h3 className="font-display text-xl lg:text-2xl text-white">{col.name}</h3>
                    </div>
                    <div className="absolute inset-0 border border-[#C9A96E]/0 group-hover:border-[#C9A96E]/40 transition-all duration-500" />
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
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



      {/* ===== CUSTOMER REVIEWS ===== */}
      {reviews.length > 0 && (
        <AnimatedSection>
          <section className="py-20 lg:py-28">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-3">
                  {getText("Müşteri Yorumları", "Customer Reviews", "تقييمات العملاء")}
                </p>
                <h2 className="font-display text-4xl lg:text-5xl text-[#1C1C1E]">
                  {getText("Onlar Ne Diyor?", "What They Say", "ماذا يقولون؟")}
                </h2>
              </div>
              <div className="grid lg:grid-cols-3 gap-6">
                {reviews.map((review, i) => (
                  <AnimatedSection key={i} delay={i * 100}>
                    <div className="bg-white p-8 border border-[#C9A96E]/10 hover:border-[#C9A96E]/30 transition-colors duration-300">
                      <div className="flex items-center gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className="text-[#C9A96E] fill-[#C9A96E]" />
                        ))}
                      </div>
                      <p className="font-body text-sm text-[#1C1C1E]/70 leading-relaxed mb-6 italic">
                        "{lang === "TR" ? review.textTR : review.textEN}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#C9A96E]/20 rounded-full flex items-center justify-center">
                          <span className="font-display text-sm text-[#C9A96E]">{review.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-body text-sm font-medium text-[#1C1C1E]">{review.name}</p>
                          <p className="font-body text-xs text-[#1C1C1E]/40">{review.city}</p>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Journal Teaser - gerçek yazılar eklendiğinde buraya eklenecek */}

      {/* WhatsApp butonu buraya eklenecek */}

      <Footer />

      <style>{`
        @keyframes scrollDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
      `}</style>
    </div>
  );
}
