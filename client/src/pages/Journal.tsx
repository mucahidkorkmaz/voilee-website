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

const posts = [
  { id: 1, catTR: "Stil Rehberi", catEN: "Style Guide", titleTR: "Abaya'yı Günlük Hayata Taşımak", titleEN: "Bringing Abaya into Everyday Life", excerptTR: "Modern kadının günlük rutininde abaya nasıl yer bulur? Sabah kahvesinden akşam yemeğine, her an için bir siluet.", excerptEN: "How does abaya find its place in the modern woman's daily routine? A silhouette for every moment, from morning coffee to dinner.", img: IMGS.cdnOrigine, dateTR: "8 Nisan 2025", dateEN: "April 8, 2025", readTimeTR: "5 dk", readTimeEN: "5 min" },
  { id: 2, catTR: "Koleksiyon", catEN: "Collection", titleTR: "NOIR: Sessizliğin Gücü Üzerine", titleEN: "NOIR: On the Power of Silence", excerptTR: "Siyah, bir renk değil bir duruştur. NOIR koleksiyonunun arkasındaki tasarım felsefesi.", excerptEN: "Black is not a color, it's a posture. The design philosophy behind the NOIR collection.", img: IMGS.cdnNoir, dateTR: "2 Nisan 2025", dateEN: "April 2, 2025", readTimeTR: "4 dk", readTimeEN: "4 min" },
  { id: 3, catTR: "Sürdürülebilirlik", catEN: "Sustainability", titleTR: "Doğal Kumaşların Sırları", titleEN: "Secrets of Natural Fabrics", excerptTR: "Organik pamuk, keten, ipek — her kumaşın kendine özgü bir hikayesi ve cilde faydası var.", excerptEN: "Organic cotton, linen, silk — each fabric has its own story and skin benefits.", img: IMGS.lookbook, dateTR: "25 Mart 2025", dateEN: "March 25, 2025", readTimeTR: "6 dk", readTimeEN: "6 min" },
  { id: 4, catTR: "Tasarım", catEN: "Design", titleTR: "Sessiz Lüks Nedir?", titleEN: "What is Quiet Luxury?", excerptTR: "Gürültü olmadan var olmak. Dikkat çekmeden fark edilmek. Sessiz lüksün anatomisi.", excerptEN: "Existing without noise. Being noticed without drawing attention. The anatomy of quiet luxury.", img: IMGS.heroMain, dateTR: "18 Mart 2025", dateEN: "March 18, 2025", readTimeTR: "7 dk", readTimeEN: "7 min" },
  { id: 5, catTR: "Bakım Rehberi", catEN: "Care Guide", titleTR: "Doğal Kumaşları Nasıl Bakmalısınız?", titleEN: "How to Care for Natural Fabrics?", excerptTR: "Doğru bakım, parçanızın ömrünü uzatır. Koleksiyonunuzu korumak için bilmeniz gerekenler.", excerptEN: "Proper care extends the life of your piece. What you need to know to protect your collection.", img: IMGS.about, dateTR: "10 Mart 2025", dateEN: "March 10, 2025", readTimeTR: "3 dk", readTimeEN: "3 min" },
  { id: 6, catTR: "Atölye", catEN: "Atelier", titleTR: "Bir Parçanın Yolculuğu", titleEN: "The Journey of a Piece", excerptTR: "Kumaş seçiminden son dikişe, bir VOILÉE parçasının atölyedeki yolculuğu.", excerptEN: "From fabric selection to the final stitch, the journey of a VOILÉE piece in the atelier.", img: IMGS.cdnAtelier, dateTR: "3 Mart 2025", dateEN: "March 3, 2025", readTimeTR: "8 dk", readTimeEN: "8 min" },
];

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
      </div>

      <Footer />
    </div>
  );
}
