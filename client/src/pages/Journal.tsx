import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const IMGS = {
  cdnOrigine: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_origine_57e73407.webp",
  cdnNoir: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_noir_68a8f8b6.webp",
  lookbook: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_lookbook-NdUh3UyfmAcub83uXdTERo.webp",
  heroMain: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_hero_main-Z5A8u2f2u9H3JoSTeyVYih.webp",
  about: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_about-koUYMmwRdG337Rztgx3iuQ.webp",
  cdnAtelier: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_atelier_d60dabd2.webp",
};

const posts: { id: number; catTR: string; catEN: string; titleTR: string; titleEN: string; excerptTR: string; excerptEN: string; img: string; dateTR: string; dateEN: string; readTimeTR: string; readTimeEN: string }[] = [];

export default function Journal() {
  const { lang } = useLanguage();
  
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { value: "all", labelTR: "Tümü", labelEN: "All" },
    { value: "stil", labelTR: "Stil", labelEN: "Style" },
    { value: "koleksiyon", labelTR: "Koleksiyon", labelEN: "Collection" },
    { value: "surdurulebilirlik", labelTR: "Sürdürülebilirlik", labelEN: "Sustainability" },
    { value: "bakim", labelTR: "Bakım", labelEN: "Care" },
  ];

  
  const getText = (tr: string, en: string, ar: string) => {
    if (lang === "TR") return tr;
    if (lang === "EN") return en;
    return ar;
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Navbar />

      {/* Header */}
      <div className="pt-28 pb-12 bg-[#1C1C1E]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-body text-xs tracking-[0.25em] uppercase text-[#C9A96E] mb-4">Journal</p>
          <h1 className="font-display text-5xl lg:text-6xl text-[#F7F3EC]">
            {getText("Stil & İlham", "Style & Inspiration", "الأسلوب والإلهام")}
          </h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex items-center gap-3 mb-12 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`font-body text-xs tracking-[0.1em] uppercase px-4 py-2 border transition-all duration-300 ${
                activeCategory === cat.value
                  ? "bg-[#1C1C1E] text-[#F7F3EC] border-[#1C1C1E]"
                  : "bg-transparent text-[#1C1C1E]/60 border-[#1C1C1E]/20 hover:border-[#1C1C1E]/60"
              }`}
            >
              {lang === "TR" ? cat.labelTR : cat.labelEN}
            </button>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-sm text-[#1C1C1E]/40">
              {getText("Henüz yazı yok.", "No posts yet.", "لا توجد مقالات بعد.")}
            </p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div className="overflow-hidden">
                <img src={posts[0].img} alt={lang === "TR" ? posts[0].titleTR : posts[0].titleEN} className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-3">
                  {lang === "TR" ? posts[0].catTR : posts[0].catEN}
                </p>
                <h2 className="font-display text-3xl lg:text-4xl text-[#1C1C1E] mb-4">
                  {lang === "TR" ? posts[0].titleTR : posts[0].titleEN}
                </h2>
                <p className="font-body text-sm text-[#1C1C1E]/60 leading-relaxed mb-6">
                  {lang === "TR" ? posts[0].excerptTR : posts[0].excerptEN}
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-body text-xs text-[#1C1C1E]/40">{lang === "TR" ? posts[0].dateTR : posts[0].dateEN}</span>
                  <span className="text-[#1C1C1E]/20">·</span>
                  <span className="font-body text-xs text-[#1C1C1E]/40">{lang === "TR" ? posts[0].readTimeTR : posts[0].readTimeEN} {getText("okuma", "read", "read")}</span>
                </div>
                <button className="btn-luxury self-start">
                  {getText("Devamını Oku", "Read More", "Read More")}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {posts.slice(1).map((post) => (
                <div key={post.id} className="group cursor-pointer">
                  <div className="overflow-hidden mb-4">
                    <img src={post.img} alt={lang === "TR" ? post.titleTR : post.titleEN} className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#C9A96E] mb-2">
                    {lang === "TR" ? post.catTR : post.catEN}
                  </p>
                  <h3 className="font-display text-xl text-[#1C1C1E] mb-2 group-hover:text-[#C9A96E] transition-colors duration-300">
                    {lang === "TR" ? post.titleTR : post.titleEN}
                  </h3>
                  <p className="font-body text-xs text-[#1C1C1E]/60 leading-relaxed mb-3 line-clamp-2">
                    {lang === "TR" ? post.excerptTR : post.excerptEN}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="font-body text-xs text-[#1C1C1E]/40">{lang === "TR" ? post.dateTR : post.dateEN}</span>
                    <span className="text-[#1C1C1E]/20">·</span>
                    <span className="font-body text-xs text-[#1C1C1E]/40">{lang === "TR" ? post.readTimeTR : post.readTimeEN} {getText("okuma", "read", "read")}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
