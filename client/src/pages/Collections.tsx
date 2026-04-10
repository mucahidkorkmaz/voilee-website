import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const IMGS = {
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
  heroMain: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_hero_main-Z5A8u2f2u9H3JoSTeyVYih.webp",
};

const allProducts = [
  { id: 1, nameTR: "ORIGINE Çanta", nameEN: "ORIGINE Bag", collection: "ORIGINE", category: "canta", price: 4850, img: IMGS.productCanta, tag: "Yeni", colors: ["#C9A96E", "#1C1C1E"] },
  { id: 2, nameTR: "Heritage Eşarp", nameEN: "Heritage Scarf", collection: "HÉRITAGE", category: "esarp", price: 1250, img: IMGS.productEsarp, tag: "", colors: ["#F7F3EC", "#C9A96E"] },
  { id: 3, nameTR: "Héritage Abaya", nameEN: "Héritage Abaya", collection: "HÉRITAGE", category: "abaya", price: 6950, img: IMGS.productAbaya, tag: "Çok Satan", colors: ["#1C1C1E", "#2D4A2D"] },
  { id: 4, nameTR: "Origine Parfüm", nameEN: "Origine Perfume", collection: "ORIGINE", category: "parfum", price: 2400, img: IMGS.productParfum, tag: "", colors: ["#F7F3EC"] },
  { id: 5, nameTR: "ÉPURE Abaya", nameEN: "ÉPURE Abaya", collection: "ÉPURE", category: "abaya", price: 5850, img: IMGS.cdnEpure, tag: "", colors: ["#4A5568", "#F7F3EC"] },
  { id: 6, nameTR: "NOIR Abaya", nameEN: "NOIR Abaya", collection: "NOIR", category: "abaya", price: 7200, img: IMGS.cdnNoir, tag: "Özel", colors: ["#1C1C1E"] },
  { id: 7, nameTR: "MOUVEMENT Elbise", nameEN: "MOUVEMENT Dress", collection: "MOUVEMENT", category: "abaya", price: 4200, img: IMGS.cdnMouvement, tag: "", colors: ["#C9A96E", "#F7F3EC"] },
  { id: 8, nameTR: "ATELIER Parça", nameEN: "ATELIER Piece", collection: "ATELIER", category: "abaya", price: 9800, img: IMGS.cdnAtelier, tag: "Sınırlı", colors: ["#F7F3EC", "#C9A96E"] },
];

const collections = ["Tümü", "ORIGINE", "MOUVEMENT", "ÉPURE", "NOIR", "HÉRITAGE", "ATELIER"];
const categories = [
  { keyTR: "Tümü", keyEN: "All", value: "all" },
  { keyTR: "Abaya", keyEN: "Abaya", value: "abaya" },
  { keyTR: "Çanta", keyEN: "Bag", value: "canta" },
  { keyTR: "Eşarp", keyEN: "Scarf", value: "esarp" },
  { keyTR: "Parfüm", keyEN: "Perfume", value: "parfum" },
];

export default function Collections() {
  const { lang } = useLanguage();
  
  const [activeCollection, setActiveCollection] = useState("Tümü");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const filtered = allProducts
    .filter((p) => {
      const colMatch = activeCollection === "Tümü" || p.collection === activeCollection;
      const catMatch = activeCategory === "all" || p.category === activeCategory;
      return colMatch && catMatch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

  
  const getText = (tr: string, en: string, ar: string) => {
    if (lang === "TR") return tr;
    if (lang === "EN") return en;
    return ar;
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Navbar />

      {/* Page Header */}
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img src={IMGS.heroMain} alt="Collections" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="font-body text-xs tracking-[0.25em] uppercase text-[#C9A96E] mb-3">
              {getText("Tüm Koleksiyonlar", "All Collections", "All Collections")}
            </p>
            <h1 className="font-display text-5xl lg:text-6xl text-white">
              {getText("Siluetler", "Silhouettes", "Silhouettes")}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
          {/* Collection Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {collections.map((col) => (
              <button
                key={col}
                onClick={() => setActiveCollection(col)}
                className={`font-body text-xs tracking-[0.1em] uppercase px-4 py-2 border transition-all duration-300 ${
                  activeCollection === col
                    ? "bg-[#1C1C1E] text-[#F7F3EC] border-[#1C1C1E]"
                    : "bg-transparent text-[#1C1C1E]/60 border-[#1C1C1E]/20 hover:border-[#1C1C1E]/60"
                }`}
              >
                {col === "Tümü" ? (getText("Tümü", "All", "All")) : col}
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 font-body text-xs tracking-[0.1em] uppercase text-[#1C1C1E]/60 hover:text-[#1C1C1E] transition-colors"
            >
              <SlidersHorizontal size={14} />
              {getText("Filtrele", "Filter", "Filter")}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="font-body text-xs tracking-[0.1em] bg-transparent border border-[#1C1C1E]/20 px-3 py-2 text-[#1C1C1E]/60 focus:outline-none focus:border-[#C9A96E]"
            >
              <option value="default">{getText("Sırala", "Sort", "Sort")}</option>
              <option value="price-asc">{getText("Fiyat: Düşükten Yükseğe", "Price: Low to High", "Price: Low to High")}</option>
              <option value="price-desc">{getText("Fiyat: Yüksekten Düşüğe", "Price: High to Low", "Price: High to Low")}</option>
            </select>
            <span className="font-body text-xs text-[#1C1C1E]/40">
              {filtered.length} {getText("ürün", "products", "products")}
            </span>
          </div>
        </div>

        {/* Category Filter Panel */}
        {filterOpen && (
          <div className="mb-8 p-6 bg-white border border-[#C9A96E]/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-body text-xs tracking-[0.2em] uppercase text-[#1C1C1E]/60">
                {getText("Kategori", "Category", "Category")}
              </h3>
              <button onClick={() => setFilterOpen(false)} className="text-[#1C1C1E]/40 hover:text-[#1C1C1E]">
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`font-body text-xs tracking-[0.1em] uppercase px-4 py-2 border transition-all duration-300 ${
                    activeCategory === cat.value
                      ? "bg-[#C9A96E] text-white border-[#C9A96E]"
                      : "bg-transparent text-[#1C1C1E]/60 border-[#1C1C1E]/20 hover:border-[#C9A96E]/60"
                  }`}
                >
                  {lang === "TR" ? cat.keyTR : cat.keyEN}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {filtered.map((product) => (
            <div key={product.id} className="group">
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
                  onClick={() => setWishlist((prev) => prev.includes(product.id) ? prev.filter((x) => x !== product.id) : [...prev, product.id])}
                  className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 transition-all duration-300 ${wishlist.includes(product.id) ? "text-red-500" : "text-[#1C1C1E]/40 hover:text-[#1C1C1E]"}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlist.includes(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                  <button className="w-full py-2.5 bg-[#1C1C1E] text-[#F7F3EC] font-body text-xs tracking-[0.15em] uppercase hover:bg-[#C9A96E] transition-colors duration-300">
                    {getText("Sepete Ekle", "Add to Cart", "Add to Cart")}
                  </button>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {product.colors.map((color, i) => (
                    <div key={i} className="w-3 h-3 rounded-full border border-[#1C1C1E]/10" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <p className="font-body text-[10px] tracking-[0.15em] uppercase text-[#C9A96E] mb-1">{product.collection}</p>
                <h3 className="font-body text-sm text-[#1C1C1E] mb-1">{lang === "TR" ? product.nameTR : product.nameEN}</h3>
                <p className="font-display text-lg text-[#1C1C1E]">₺{product.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-[#1C1C1E]/30">
              {getText("Bu filtreye uygun ürün bulunamadı.", "No products found for this filter.", "No products found for this filter.")}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
