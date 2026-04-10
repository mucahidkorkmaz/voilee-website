import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronLeft, ChevronRight, Star, Leaf, Package, Clock, Globe, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
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

const products = [
  { id: 1, nameTR: "ORIGINE Çanta", nameEN: "ORIGINE Bag", collection: "ORIGINE", price: "₺4.850", img: IMGS.productCanta, tag: "Yeni" },
  { id: 2, nameTR: "Heritage Eşarp", nameEN: "Heritage Scarf", collection: "HÉRITAGE", price: "₺1.250", img: IMGS.productEsarp, tag: "" },
  { id: 3, nameTR: "Héritage Abaya", nameEN: "Héritage Abaya", collection: "HÉRITAGE", price: "₺6.950", img: IMGS.productAbaya, tag: "Çok Satan" },
  { id: 4, nameTR: "Origine Parfüm", nameEN: "Origine Perfume", collection: "ORIGINE", price: "₺2.400", img: IMGS.productParfum, tag: "" },
];

const reviews = [
  {
    name: "Zeynep A.",
    city: "İstanbul",
    rating: 5,
    textTR: "Héritage Abaya'yı aldığımda kalitesine şaşırdım. Kumaş gerçekten nefes alıyor, kesim mükemmel. Artık her özel günümde bu markayı tercih ediyorum.",
    textEN: "When I received the Héritage Abaya, I was amazed by the quality. The fabric truly breathes, the cut is perfect. I now choose this brand for every special occasion.",
  },
  {
    name: "Fatima K.",
    city: "Dubai",
    rating: 5,
    textTR: "Uluslararası kargo çok hızlıydı. Ürün beklentilerimin çok üzerinde çıktı. Sessiz lüks tam olarak tarif ettikleri gibi.",
    textEN: "International shipping was very fast. The product exceeded my expectations. Quiet luxury is exactly as they describe.",
  },
  {
    name: "Merve S.",
    city: "Ankara",
    rating: 5,
    textTR: "ORIGINE Çanta'yı 6 aydır kullanıyorum, hiç yıpranmadı. Etik üretim konusundaki hassasiyetleri de çok değerli.",
    textEN: "I've been using the ORIGINE Bag for 6 months and it hasn't worn at all. Their sensitivity to ethical production is also very valuable.",
  },
];

const values = [
  { icon: Leaf, titleTR: "Doğal Kumaşlar", titleEN: "Natural Fabrics", descTR: "Cildinizin nefes aldığı, doğadan gelen liflerle üretiyoruz.", descEN: "We produce with fibers from nature that let your skin breathe." },
  { icon: Package, titleTR: "Etik Üretim", titleEN: "Ethical Production", descTR: "Az ve özenle üretip her parçayı değerli kılıyoruz.", descEN: "We produce little and carefully, making each piece valuable." },
  { icon: Clock, titleTR: "Zamansız Tasarım", titleEN: "Timeless Design", descTR: "Trendlerin peşinden gitmeyen, uzun ömürlü tasarımlar.", descEN: "Designs that don't chase trends, built to last." },
  { icon: Globe, titleTR: "Türkiye'den Dünyaya", titleEN: "From Turkey to the World", descTR: "Türk kalitesini uluslararası estetikle buluşturuyoruz.", descEN: "We bring Turkish quality together with international aesthetics." },
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

export default function Home() {
  const { lang } = useLanguage();
  const { addToCart } = useCart();
  
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroTransition, setHeroTransition] = useState(true);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);

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

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleAddToCart = (product: typeof products[0]) => {
    const priceNum = parseInt(product.price.replace(/[^0-9]/g, ''));
    addToCart({
      id: product.id,
      nameTR: product.nameTR,
      nameEN: product.nameEN,
      nameAR: product.nameEN, // Placeholder - should be added to products data
      price: priceNum,
      quantity: 1,
      collection: product.collection,
      imageUrl: product.img,
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
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
                <Link href="/koleksiyonlar">
                  <button className="btn-luxury btn-luxury-filled text-sm">
                    {getText("Koleksiyonu Keşfet", "Explore Collection", "استكشف المجموعة")}
                    <ArrowRight size={14} />
                  </button>
                </Link>
                <Link href="/hakkimizda">
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

      {/* ===== VALUES STRIP ===== */}
      <AnimatedSection>
        <section className="bg-[#1C1C1E] py-6">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-[#F7F3EC]/10">
              {values.map((v, i) => (
                <div key={i} className="flex items-center gap-3 lg:px-8 first:pl-0 last:pr-0">
                  <v.icon size={18} className="text-[#C9A96E] shrink-0" />
                  <div>
                    <p className="font-body text-xs tracking-[0.1em] uppercase text-[#F7F3EC]/80">
                      {lang === "TR" ? v.titleTR : v.titleEN}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

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
              <Link href="/koleksiyonlar" className="hidden lg:flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-[#1C1C1E]/60 hover:text-[#1C1C1E] transition-colors border-b border-[#1C1C1E]/20 hover:border-[#1C1C1E] pb-0.5">
                {getText("Tümünü Gör", "View All", "عرض الكل")}
                <ArrowRight size={12} />
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {collections.map((col, i) => (
              <AnimatedSection key={col.name} delay={i * 80}>
                <Link href="/koleksiyonlar">
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
              <p className="font-body text-xs tracking-[0.25em] uppercase text-[#C9A96E] mb-8">
                {getText("Manifestomuz", "Our Manifesto", "بياننا")}
              </p>
              <blockquote className="font-display text-3xl lg:text-5xl text-[#F7F3EC] leading-[1.3] mb-8">
                {lang === "TR"
                  ? "\"Biz koleksiyon yapmıyoruz. Siluet kuruyoruz.\""
                  : "\"We don't make collections. We build silhouettes.\""}
              </blockquote>
              <div className="w-16 h-px bg-[#C9A96E] mx-auto mb-8" />
              <p className="font-body text-base text-[#F7F3EC]/60 leading-relaxed max-w-xl mx-auto">
                {lang === "TR"
                  ? "Farklı kadınlar için değil, aynı kadının gün ve zaman içindeki hâlleri için tasarlıyoruz. Fazlalık olmadığında geriye duruş kalır."
                  : "We design not for different women, but for the same woman in her different states throughout the day and time. When there is no excess, only posture remains."}
              </p>
              <div className="mt-10">
                <Link href="/hakkimizda">
                  <button className="btn-luxury text-white border-white/40 hover:bg-white hover:text-[#1C1C1E]">
                    {getText("Hikayemizi Okuyun", "Read Our Story", "اقرأ قصتنا")}
                    <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-3">
                  {getText("Öne Çıkan Ürünler", "Featured Products", "المنتجات المميزة")}
                </p>
                <h2 className="font-display text-4xl lg:text-5xl text-[#1C1C1E]">
                  {getText("Seçkin Parçalar", "Selected Pieces", "القطع المختارة")}
                </h2>
              </div>
              <Link href="/koleksiyonlar" className="hidden lg:flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-[#1C1C1E]/60 hover:text-[#1C1C1E] transition-colors border-b border-[#1C1C1E]/20 hover:border-[#1C1C1E] pb-0.5">
                {getText("Tüm Ürünler", "All Products", "جميع المنتجات")}
                <ArrowRight size={12} />
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product, i) => (
              <AnimatedSection key={product.id} delay={i * 100}>
                <div className="group">
                  <div className="relative overflow-hidden mb-4">
                    <div className="aspect-[3/4]">
                      <img
                        src={product.img}
                        alt={lang === "TR" ? product.nameTR : product.nameEN}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    {product.tag && (
                      <span className="absolute top-3 left-3 bg-[#C9A96E] text-white font-body text-[10px] tracking-[0.1em] uppercase px-2 py-1">
                        {product.tag}
                      </span>
                    )}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 transition-all duration-300 ${wishlist.includes(product.id) ? "text-red-500" : "text-[#1C1C1E]/40 hover:text-[#1C1C1E]"}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlist.includes(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`w-full py-2.5 font-body text-xs tracking-[0.15em] uppercase transition-all duration-300 ${
                          addedToCart === product.id
                            ? "bg-[#C9A96E] text-white"
                            : "bg-[#1C1C1E] text-[#F7F3EC] hover:bg-[#C9A96E]"
                        }`}
                      >
                        {addedToCart === product.id
                          ? (getText("✓ Eklendi", "✓ Added", "✓ Added"))
                          : (getText("Sepete Ekle", "Add to Cart", "Add to Cart"))}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="font-body text-[10px] tracking-[0.15em] uppercase text-[#C9A96E] mb-1">
                      {product.collection}
                    </p>
                    <h3 className="font-body text-sm text-[#1C1C1E] mb-1">
                      {lang === "TR" ? product.nameTR : product.nameEN}
                    </h3>
                    <p className="font-display text-lg text-[#1C1C1E]">{product.price}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LOOKBOOK SPLIT SECTION ===== */}
      <AnimatedSection>
        <section className="py-0 lg:py-0">
          <div className="grid lg:grid-cols-2 min-h-[500px]">
            <div className="relative overflow-hidden">
              <img src={IMGS.lookbook} alt="Lookbook" className="w-full h-full object-cover min-h-[400px]" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="bg-[#1C1C1E] flex items-center justify-center p-12 lg:p-16">
              <div className="max-w-md">
                <p className="font-body text-xs tracking-[0.25em] uppercase text-[#C9A96E] mb-6">
                  {getText("Lookbook 2025", "Lookbook 2025", "كتاب المظهر 2025")}
                </p>
                <h2 className="font-display text-4xl lg:text-5xl text-[#F7F3EC] leading-[1.2] mb-6">
                  {getText("Bir Duruşun\nHikayesi", "The Story of\na Posture", "The Story of\na Posture")}
                </h2>
                <div className="w-12 h-px bg-[#C9A96E] mb-6" />
                <p className="font-body text-sm text-[#F7F3EC]/60 leading-relaxed mb-8">
                  {lang === "TR"
                    ? "Her koleksiyon, bir kadının farklı hâllerini anlatır. Sabahın sessizliğinden gecenin gücüne, her an için bir siluet."
                    : "Each collection tells the different states of a woman. From the silence of morning to the power of night, a silhouette for every moment."}
                </p>
                <Link href="/koleksiyonlar">
                  <button className="btn-luxury text-[#F7F3EC] border-[#F7F3EC]/40 hover:bg-[#F7F3EC] hover:text-[#1C1C1E]">
                    {getText("Lookbook'u İncele", "View Lookbook", "عرض كتاب المظهر")}
                    <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ===== SUSTAINABILITY TEASER ===== */}
      <AnimatedSection>
        <section className="py-20 lg:py-28 bg-[#F0EBE1]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-4">
                  {getText("Sürdürülebilirlik", "Sustainability", "الاستدامة")}
                </p>
                <h2 className="font-display text-4xl lg:text-5xl text-[#1C1C1E] leading-[1.2] mb-6">
                  {getText("Dünyaya Karşı\nSorumluluğumuz", "Our Responsibility\nto the World", "Our Responsibility\nto the World")}
                </h2>
                <div className="w-12 h-px bg-[#C9A96E] mb-6" />
                <p className="font-body text-sm text-[#1C1C1E]/60 leading-relaxed mb-8">
                  {lang === "TR"
                    ? "Doğal ve sürdürülebilir kumaşlar kullanıyoruz. Düşük adetli üretimle israfı minimuma indiriyoruz. Her parça, hem size hem de gezegenimize saygıyla üretilir."
                    : "We use natural and sustainable fabrics. We minimize waste with low-volume production. Each piece is produced with respect for both you and our planet."}
                </p>
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {[
                    { numTR: "%100", numEN: "100%", labelTR: "Doğal Kumaş", labelEN: "Natural Fabric" },
                    { numTR: "Sınırlı", numEN: "Limited", labelTR: "Adet Üretim", labelEN: "Production" },
                    { numTR: "0", numEN: "0", labelTR: "Kimyasal Boya", labelEN: "Chemical Dye" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="font-display text-3xl text-[#C9A96E] mb-1">
                        {lang === "TR" ? stat.numTR : stat.numEN}
                      </p>
                      <p className="font-body text-xs text-[#1C1C1E]/50 tracking-wide">
                        {lang === "TR" ? stat.labelTR : stat.labelEN}
                      </p>
                    </div>
                  ))}
                </div>
                <Link href="/surdurulebilirlik">
                  <button className="btn-luxury">
                    {getText("Daha Fazla Öğren", "Learn More", "اعرف المزيد")}
                    <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
              <div className="relative">
                <img
                  src={IMGS.about}
                  alt={getText("Atölye", "Atelier", "Atelier")}
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute -bottom-4 -left-4 bg-[#C9A96E] p-6 max-w-[200px]">
                  <p className="font-display text-2xl text-white mb-1">2023</p>
                  <p className="font-body text-xs text-white/80 tracking-wide">
                    {getText("Kuruluş Yılı", "Founded", "Founded")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ===== CUSTOMER REVIEWS ===== */}
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
              <div className="flex items-center justify-center gap-1 mt-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className="text-[#C9A96E] fill-[#C9A96E]" />
                ))}
                <span className="font-body text-sm text-[#1C1C1E]/60 ml-2">4.9 / 5 (127 {getText("yorum", "reviews", "تقييم")})</span>
              </div>
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

      {/* ===== INTERNATIONAL SHIPPING BANNER ===== */}
      <AnimatedSection>
        <section className="py-12 bg-[#C9A96E]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Globe size={24} className="text-white shrink-0" />
                <div>
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-white/70 mb-1">
                    {getText("Uluslararası Kargo", "International Shipping", "الشحن الدولي")}
                  </p>
                  <p className="font-display text-xl text-white">
                    {getText("Türkiye'den Dünyaya Teslimat", "Delivery from Turkey to the World", "التسليم من تركيا إلى العالم")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8 text-center">
                {[
                  { labelTR: "Türkiye", labelEN: "Turkey", detail: "1-3 gün" },
                  { labelTR: "Avrupa", labelEN: "Europe", detail: "3-7 gün" },
                  { labelTR: "Dünya", labelEN: "Worldwide", detail: "5-14 gün" },
                ].map((dest, i) => (
                  <div key={i}>
                    <p className="font-body text-xs tracking-wide text-white/70">{lang === "TR" ? dest.labelTR : dest.labelEN}</p>
                    <p className="font-display text-lg text-white">{dest.detail}</p>
                  </div>
                ))}
              </div>
              <Link href="/kargo-iade">
                <button className="btn-luxury text-white border-white/50 hover:bg-white hover:text-[#C9A96E] whitespace-nowrap">
                  {getText("Kargo Bilgileri", "Shipping Info", "معلومات الشحن")}
                  <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ===== JOURNAL TEASER ===== */}
      <AnimatedSection>
        <section className="py-20 lg:py-28 bg-[#F0EBE1]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-3">Journal</p>
                <h2 className="font-display text-4xl lg:text-5xl text-[#1C1C1E]">
                  {getText("Stil & İlham", "Style & Inspiration", "الأسلوب والإلهام")}
                </h2>
              </div>
              <Link href="/journal" className="hidden lg:flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-[#1C1C1E]/60 hover:text-[#1C1C1E] transition-colors border-b border-[#1C1C1E]/20 hover:border-[#1C1C1E] pb-0.5">
                {getText("Tüm Yazılar", "All Articles", "جميع المقالات")}
                <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              {[
                { img: IMGS.cdnOrigine, catTR: "Stil Rehberi", catEN: "Style Guide", titleTR: "Abaya'yı Günlük Hayata Taşımak", titleEN: "Bringing Abaya into Everyday Life", dateTR: "8 Nisan 2025", dateEN: "April 8, 2025" },
                { img: IMGS.cdnNoir, catTR: "Koleksiyon", catEN: "Collection", titleTR: "NOIR: Sessizliğin Gücü Üzerine", titleEN: "NOIR: On the Power of Silence", dateTR: "2 Nisan 2025", dateEN: "April 2, 2025" },
                { img: IMGS.lookbook, catTR: "Sürdürülebilirlik", catEN: "Sustainability", titleTR: "Doğal Kumaşların Sırları", titleEN: "Secrets of Natural Fabrics", dateTR: "25 Mart 2025", dateEN: "March 25, 2025" },
              ].map((post, i) => (
                <AnimatedSection key={i} delay={i * 100}>
                  <Link href="/journal">
                    <div className="group cursor-pointer">
                      <div className="overflow-hidden mb-4">
                        <img src={post.img} alt={lang === "TR" ? post.titleTR : post.titleEN} className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#C9A96E] mb-2">
                        {lang === "TR" ? post.catTR : post.catEN}
                      </p>
                      <h3 className="font-display text-xl text-[#1C1C1E] mb-2 group-hover:text-[#C9A96E] transition-colors duration-300">
                        {lang === "TR" ? post.titleTR : post.titleEN}
                      </h3>
                      <p className="font-body text-xs text-[#1C1C1E]/40">
                        {lang === "TR" ? post.dateTR : post.dateEN}
                      </p>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ===== WHATSAPP FLOATING BUTTON ===== */}
      <a
        href="https://wa.me/905000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
        title={getText("WhatsApp ile İletişim", "Contact via WhatsApp", "Contact via WhatsApp")}
      >
        <MessageCircle size={22} className="text-white" />
      </a>

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
