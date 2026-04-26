import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { SlidersHorizontal, X, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, type Combination, type Silhouette } from "@/lib/api";
import { productPath, sitePaths } from "@/lib/sitePaths";

const heroMain = "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_hero_main-Z5A8u2f2u9H3JoSTeyVYih.webp";

export default function Collections() {
  const { lang } = useLanguage();
  const { addToCart } = useCart();

  const [silhouettes, setSilhouettes] = useState<Silhouette[]>([]);
  const [activeSilhouetteId, setActiveSilhouetteId] = useState<number | null>(null);
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const search = useSearch();

  useEffect(() => {
    api
      .getSilhouettes()
      .then(res => {
        setSilhouettes(res.data);
        if (res.data.length === 0) return;

        const params = new URLSearchParams(search);
        const slugParam = params.get("silhouette");

        if (slugParam) {
          const match = res.data.find(s => s.slug === slugParam);
          setActiveSilhouetteId(match ? match.id : res.data[0].id);
        } else {
          setActiveSilhouetteId(res.data[0].id);
        }
      })
      .catch(console.error);
  }, [search]);

  useEffect(() => {
    if (activeSilhouetteId === null) return;
    setLoading(true);
    api
      .getCombinations({ silhouetteId: activeSilhouetteId })
      .then(res => setCombinations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSilhouetteId]);

  const getText = (tr: string, en: string, ar: string) => {
    if (lang === "TR") return tr;
    if (lang === "EN") return en;
    return ar;
  };

  const comboName = (c: Combination) => getText(c.nameTR, c.nameEN, c.nameAR);

  const filtered = combinations
    .filter(c => {
      if (!searchQuery) return true;
      const n = comboName(c).toLowerCase();
      return n.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "price-desc") return parseFloat(b.price) - parseFloat(a.price);
      return 0;
    });

  const activeSilhouette = silhouettes.find(s => s.id === activeSilhouetteId);

  const handleAddToCart = (combo: Combination) => {
    addToCart({
      id: combo.id,
      nameTR: combo.nameTR,
      nameEN: combo.nameEN,
      nameAR: combo.nameAR,
      price: parseFloat(combo.price),
      quantity: 1,
      collection: activeSilhouette ? getText(activeSilhouette.nameTR, activeSilhouette.nameEN, activeSilhouette.nameAR) : "",
      imageUrl: combo.imageUrl ?? "",
      combinationId: combo.id,
    });
    setAddedToCart(combo.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const sortLabel = {
    default: getText("Varsayılan", "Default", "Default"),
    "price-asc": getText("Fiyat ↑", "Price ↑", "Price ↑"),
    "price-desc": getText("Fiyat ↓", "Price ↓", "Price ↓"),
  }[sortBy];

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Navbar />

      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img src={heroMain} alt="Silhouettes" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="font-body text-xs tracking-[0.25em] uppercase text-[#C9A96E] mb-3">
              {getText("Tüm Silüetler", "All Silhouettes", "جميع الصور الظلية")}
            </p>
            <h1 className="font-display text-5xl lg:text-6xl text-white">
              {getText("Siluetler", "Silhouettes", "Silhouettes")}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {silhouettes.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {silhouettes.map(sil => (
              <button
                key={sil.id}
                onClick={() => setActiveSilhouetteId(sil.id)}
                className={`font-body text-xs tracking-[0.1em] uppercase px-4 py-2 border transition-all duration-300 ${
                  activeSilhouetteId === sil.id
                    ? "bg-[#1C1C1E] text-[#F7F3EC] border-[#1C1C1E]"
                    : "bg-transparent text-[#1C1C1E]/60 border-[#1C1C1E]/20 hover:border-[#1C1C1E]/60"
                }`}
              >
                {getText(sil.nameTR, sil.nameEN, sil.nameAR)}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={getText("Kombin ara...", "Search looks...", "بحث...")}
            className="font-body text-xs border border-[#1C1C1E]/20 px-4 py-2 bg-transparent placeholder:text-[#1C1C1E]/40 focus:outline-none focus:border-[#C9A96E] w-64"
          />

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setSortOpen(v => !v)}
                className="flex items-center gap-2 font-body text-xs tracking-[0.1em] uppercase text-[#1C1C1E]/60 hover:text-[#1C1C1E] transition-colors"
              >
                <SlidersHorizontal size={14} />
                {sortLabel}
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-7 z-20 bg-white border border-[#C9A96E]/20 shadow-sm min-w-[160px]">
                  {[
                    { label: getText("Varsayılan", "Default", "Default"), value: "default" },
                    { label: getText("Fiyat: Düşük → Yüksek", "Price: Low → High", "السعر: منخفض → مرتفع"), value: "price-asc" },
                    { label: getText("Fiyat: Yüksek → Düşük", "Price: High → Low", "السعر: مرتفع → منخفض"), value: "price-desc" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 font-body text-xs transition-colors ${
                        sortBy === opt.value ? "bg-[#1C1C1E] text-white" : "text-[#1C1C1E]/70 hover:bg-[#F7F3EC]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setSortOpen(false)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-[#1C1C1E]/10 rounded-full flex items-center justify-center text-[#1C1C1E]/40 hover:text-[#1C1C1E]"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>
            <span className="font-body text-xs text-[#1C1C1E]/40">
              {filtered.length} {getText("kombin", "looks", "تنسيق")}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="font-body text-sm text-[#1C1C1E]/40 tracking-widest animate-pulse">
              {getText("Kombinler yükleniyor...", "Loading looks...", "جارٍ التحميل...")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {filtered.map(combo => {
              const price = parseFloat(combo.price);
              const detailHref = productPath(lang, combo.slug);
              const name = comboName(combo);
              return (
                <div key={combo.id} className="group">
                  <div className="relative overflow-hidden mb-4">
                    <Link href={detailHref} className="block">
                      <div className="aspect-[3/4] bg-[#E8E0D5] relative">
                        {combo.imageUrl ? (
                          <img
                            src={combo.imageUrl}
                            alt={name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-body text-[10px] tracking-wider uppercase text-[#1C1C1E]/25 px-4 text-center">
                            {getText("Görsel bekleniyor", "Image coming soon", "صورة قريبًا")}
                          </div>
                        )}
                        {!combo.inStock && (
                          <span className="absolute top-3 left-3 bg-[#1C1C1E] text-[#F7F3EC] font-body text-[10px] tracking-wider uppercase px-2 py-1">
                            {getText("Tükendi", "Sold out", "نفد")}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <button
                        onClick={() => combo.inStock && handleAddToCart(combo)}
                        disabled={!combo.inStock}
                        className={`w-full py-2.5 font-body text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${
                          !combo.inStock
                            ? "bg-[#1C1C1E]/20 text-[#1C1C1E]/40 cursor-not-allowed"
                            : addedToCart === combo.id
                              ? "bg-[#C9A96E] text-white"
                              : "bg-[#1C1C1E] text-[#F7F3EC] hover:bg-[#C9A96E]"
                        }`}
                      >
                        {!combo.inStock
                          ? getText("Tükendi", "Sold out", "نفد")
                          : addedToCart === combo.id
                            ? getText("✓ Eklendi", "✓ Added", "✓ أضيف")
                            : getText("Sepete Ekle", "Add to Cart", "أضف إلى السلة")}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {combo.items.map((item, i) => (
                      <span
                        key={`${combo.id}-chip-${i}`}
                        className="font-body text-[9px] tracking-wider uppercase text-[#1C1C1E]/40 bg-[#1C1C1E]/5 px-2 py-0.5"
                      >
                        {item.categoryName ?? "—"}
                      </span>
                    ))}
                  </div>
                  <Link href={detailHref} className="block">
                    {activeSilhouette && (
                      <p className="font-body text-[10px] tracking-[0.15em] uppercase text-[#C9A96E] mb-1">
                        {getText(activeSilhouette.nameTR, activeSilhouette.nameEN, activeSilhouette.nameAR)}
                      </p>
                    )}
                    <h3 className="font-body text-sm text-[#1C1C1E] mb-1 hover:text-[#C9A96E] transition-colors">{name}</h3>
                    <p className="font-display text-lg text-[#1C1C1E]">
                      ₺{price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-[#1C1C1E]/30">
              {getText("Kombin bulunamadı.", "No looks found.", "لا توجد تنسيقات.")}
            </p>
          </div>
        )}

        {!loading && (
          <div className="mt-16 sm:mt-20 flex justify-center">
            <Link
              href={`${sitePaths.builder[lang]}${activeSilhouetteId ? `?silhouette=${activeSilhouetteId}` : ""}`}
              className="group inline-flex flex-col items-center"
            >
              <div className="w-12 h-px bg-[#1C1C1E]/20 mb-5 group-hover:bg-[#C9A96E] group-hover:w-16 transition-all duration-500" />
              <h3 className="font-display text-xl sm:text-2xl text-[#1C1C1E] mb-5 group-hover:text-[#C9A96E] transition-colors duration-500">
                {getText("Kendi Silüetini Oluştur", "Create Your Silhouette", "أنشئ صورتك الظلية")}
              </h3>
              <span className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.25em] uppercase text-[#1C1C1E]/60 group-hover:text-[#1C1C1E] transition-colors duration-300">
                {getText("Başla", "Begin", "ابدأ")}
                <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
