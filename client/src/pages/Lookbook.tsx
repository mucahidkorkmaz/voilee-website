import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { sitePaths } from "@/lib/sitePaths";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LOOKBOOK_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_lookbook-NdUh3UyfmAcub83uXdTERo.webp";

const COLLECTION_IMGS = [
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_origine_57e73407.webp",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_noir_68a8f8b6.webp",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_epure_2d5aaf15.webp",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_heritage_1a6b4b02.webp",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_mouvement_7b7c4f3e.webp",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_atelier_d60dabd2.webp",
];

const content = {
  TR: {
    tag: "Lookbook 2025",
    title: "Bir Duruşun\nHikayesi",
    divider: true,
    body: "Her koleksiyon, bir kadının farklı hâllerini anlatır. Sabahın sessizliğinden gecenin gücüne, her an için bir siluet.",
    cta: "Koleksiyonu Keşfet",
    ctaHref: sitePaths.collections.TR,
    galleryTag: "Koleksiyonlar",
    galleryTitle: "2025 Sezonu",
    galleryBody: "VOILÉE'nin 2025 koleksiyonu; zarafetin, özgünlüğün ve zamansızlığın bir yansımasıdır. Her parça, kadının farklı hâllerini anlatan bir siluet sunuyor.",
  },
  EN: {
    tag: "Lookbook 2025",
    title: "The Story of\na Posture",
    divider: true,
    body: "Each collection tells the different states of a woman. From the silence of morning to the power of night, a silhouette for every moment.",
    cta: "Explore Collection",
    ctaHref: sitePaths.collections.EN,
    galleryTag: "Collections",
    galleryTitle: "2025 Season",
    galleryBody: "VOILÉE's 2025 collection is a reflection of elegance, authenticity, and timelessness. Each piece offers a silhouette that captures the many states of a woman.",
  },
  AR: {
    tag: "كتاب المظهر 2025",
    title: "قصة\nموقف",
    divider: true,
    body: "كل مجموعة تروي الحالات المختلفة للمرأة. من هدوء الصباح إلى قوة الليل، صورة ظلية لكل لحظة.",
    cta: "استكشف المجموعة",
    ctaHref: sitePaths.collections.AR,
    galleryTag: "المجموعات",
    galleryTitle: "موسم 2025",
    galleryBody: "مجموعة VOILÉE لعام 2025 هي انعكاس للأناقة والأصالة وديمومة الزمن. كل قطعة تقدم صورة ظلية تجسّد الحالات المتعددة للمرأة.",
  },
};

export default function Lookbook() {
  const { lang, isRTL } = useLanguage();
  const c = content[lang];

  return (
    <div className="min-h-screen bg-[#F7F3EC]" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      {/* ===== HERO SPLIT SECTION ===== */}
      <section className="pt-0">
        <div className="grid lg:grid-cols-2 min-h-[600px]">
          <div className="relative overflow-hidden">
            <img
              src={LOOKBOOK_IMG}
              alt="Lookbook"
              className="w-full h-full object-cover min-h-[400px] lg:min-h-[600px]"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="bg-[#1C1C1E] flex items-center justify-center p-12 lg:p-20">
            <div className="max-w-md">
              <h1 className="font-display text-4xl lg:text-5xl text-[#F7F3EC] leading-[1.2] mb-6 whitespace-pre-line">
                {c.title}
              </h1>
              <div className="w-12 h-px bg-[#C9A96E] mb-6" />
              <p className="font-body text-sm text-[#F7F3EC]/60 leading-relaxed">
                {c.body}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GALLERY GRID ===== */}
      <section className="py-20 lg:py-28 bg-[#F7F3EC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="font-body text-xs tracking-[0.25em] uppercase text-[#C9A96E] mb-3">
              {c.galleryTag}
            </p>
            <h2 className="font-display text-4xl lg:text-5xl text-[#1C1C1E] mb-6">
              {c.galleryTitle}
            </h2>
            <p className="font-body text-sm text-[#1C1C1E]/60 leading-relaxed max-w-xl mx-auto">
              {c.galleryBody}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {COLLECTION_IMGS.map((src, i) => (
              <div
                key={i}
                className="relative overflow-hidden group aspect-[3/4]"
              >
                <img
                  src={src}
                  alt={`Lookbook ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href={c.ctaHref}>
              <button className="btn-luxury btn-luxury-filled text-sm">
                {c.cta}
                <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
