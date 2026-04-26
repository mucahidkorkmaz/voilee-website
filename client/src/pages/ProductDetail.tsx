import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  Truck,
  RefreshCcw,
  Lock,
  Plus,
  Minus,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, type Combination, type CombinationDetail, type Product, type ProductVariant } from "@/lib/api";
import { sitePaths, productPath } from "@/lib/sitePaths";

const t = {
  TR: {
    home: "Ana Sayfa",
    collections: "Silüetler",
    loading: "Yükleniyor...",
    notFound: "İçerik bulunamadı.",
    backToCollections: "Silüetlere Dön",
    color: "Renk",
    quantity: "Adet",
    addToCart: "Sepete Ekle",
    added: "Sepete Eklendi",
    addToWishlist: "Favorilere Ekle",
    inWishlist: "Favorilerde",
    outOfStock: "Stokta Yok",
    free: "Türkiye'ye ücretsiz kargo",
    returns: "14 gün içinde ücretsiz iade",
    secure: "Güvenli ödeme garantisi",
    tabs: { details: "Detaylar", fabric: "Kumaş & Bakım", size: "Beden & Form", shipping: "Kargo & İade" },
    relatedTitle: "Bunlar da ilginizi çekebilir",
    fabricDefault: "Bilgi yakında.",
    careDefault: "30°C'de hassas yıkama. Ütülemeyiniz. Kuru temizleme önerilir.",
    sizeDefault: "Model 1.78 m boyundadır ve S beden giyer.",
    shippingDefault: "Türkiye içi 2-4 iş günü içinde teslim edilir. Detaylı bilgi için kargo ve iade sayfasını inceleyiniz.",
    comboIncludes: "Bu kombinde",
  },
  EN: {
    home: "Home",
    collections: "Silhouettes",
    loading: "Loading...",
    notFound: "Not found.",
    backToCollections: "Back to Silhouettes",
    color: "Color",
    quantity: "Quantity",
    addToCart: "Add to Cart",
    added: "Added to Cart",
    addToWishlist: "Add to Wishlist",
    inWishlist: "In Wishlist",
    outOfStock: "Out of Stock",
    free: "Free shipping in Türkiye",
    returns: "Free returns within 14 days",
    secure: "Secure checkout guarantee",
    tabs: { details: "Details", fabric: "Fabric & Care", size: "Size & Fit", shipping: "Shipping & Returns" },
    relatedTitle: "You may also like",
    fabricDefault: "Details coming soon.",
    careDefault: "Delicate wash at 30°C. Do not iron. Dry cleaning recommended.",
    sizeDefault: "Model is 1.78 m tall and wears size S.",
    shippingDefault: "Delivered within 2-4 business days in Türkiye. Please see our shipping & returns page for details.",
    comboIncludes: "This look includes",
  },
  AR: {
    home: "الرئيسية",
    collections: "الصور الظلية",
    loading: "جارٍ التحميل...",
    notFound: "غير موجود.",
    backToCollections: "العودة إلى الصور الظلية",
    color: "اللون",
    quantity: "الكمية",
    addToCart: "أضف إلى السلة",
    added: "تمت الإضافة",
    addToWishlist: "أضف إلى المفضلة",
    inWishlist: "في المفضلة",
    outOfStock: "غير متوفر",
    free: "شحن مجاني داخل تركيا",
    returns: "إرجاع مجاني خلال 14 يومًا",
    secure: "ضمان الدفع الآمن",
    tabs: { details: "التفاصيل", fabric: "القماش والعناية", size: "المقاس والملاءمة", shipping: "الشحن والإرجاع" },
    relatedTitle: "قد يعجبك أيضًا",
    fabricDefault: "التفاصيل قريبًا.",
    careDefault: "غسيل ناعم على 30°م. لا يُكوى. يُنصح بالتنظيف الجاف.",
    sizeDefault: "طول العارضة 1.78 م وترتدي مقاس S.",
    shippingDefault: "يتم التسليم خلال 2-4 أيام عمل داخل تركيا. يرجى الاطلاع على صفحة الشحن والإرجاع للمزيد.",
    comboIncludes: "يتضمن هذا اللوك",
  },
};

function formatTRY(value: number) {
  return `₺${value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function comboItemLabel(lang: "TR" | "EN" | "AR", it: CombinationDetail["items"][number]): string {
  const base = it.productName ?? "—";
  if (!it.variantName) return base;
  if (lang === "EN") return `${base} — ${it.variantName}`;
  if (lang === "AR") return `${base} — ${it.variantName}`;
  return `${base} — ${it.variantName}`;
}

export default function ProductDetail() {
  const { lang, isRTL } = useLanguage();
  const { addToCart } = useCart();

  const [, paramsTR] = useRoute("/tr/product/:slug");
  const [, paramsEN] = useRoute("/en/product/:slug");
  const [, paramsAR] = useRoute("/ar/product/:slug");
  const slug = paramsTR?.slug || paramsEN?.slug || paramsAR?.slug || "";

  const tx = t[lang];

  const [product, setProduct] = useState<Product | null>(null);
  const [combination, setCombination] = useState<CombinationDetail | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [relatedCombo, setRelatedCombo] = useState<Combination[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setProduct(null);
    setCombination(null);
    setActiveImageIdx(0);
    setQuantity(1);
    setSelectedVariantId(null);

    const langParam = lang as "TR" | "EN" | "AR";

    (async () => {
      try {
        const res = await api.getProduct(slug, langParam);
        if (cancelled) return;
        const p = res.data;
        setProduct(p);
        setCombination(null);
        const vars = p.variants ?? [];
        setSelectedVariantId(vars.length > 0 ? vars[0].id : null);
        try {
          if (p.categoryId) {
            const r = await api.getProducts({ categoryId: p.categoryId, limit: 8 });
            if (!cancelled) setRelated(r.data.filter(x => x.id !== p.id).slice(0, 4));
          } else {
            const r = await api.getProducts({ limit: 5 });
            if (!cancelled) setRelated(r.data.filter(x => x.id !== p.id).slice(0, 4));
          }
        } catch {
          if (!cancelled) setRelated([]);
        }
        if (!cancelled) setRelatedCombo([]);
      } catch {
        try {
          const res = await api.getCombination(slug, langParam);
          if (cancelled) return;
          setCombination(res.data);
          setProduct(null);
          setRelated([]);
          try {
            const r = await api.getCombinations({ silhouetteId: res.data.silhouetteId });
            if (!cancelled) setRelatedCombo(r.data.filter(c => c.id !== res.data.id).slice(0, 4));
          } catch {
            if (!cancelled) setRelatedCombo([]);
          }
        } catch {
          if (!cancelled) setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, lang]);

  const variants: ProductVariant[] = product?.variants ?? [];
  const hasVariants = variants.length > 0;
  const activeVariant = variants.find(v => v.id === selectedVariantId) ?? null;

  const images = useMemo(() => {
    if (combination) {
      const g = combination.galleryUrls ?? [];
      const main = combination.imageUrl ? [combination.imageUrl] : [];
      const merged = [...main, ...g.filter(u => !main.includes(u))];
      return merged.length ? merged : [];
    }
    if (!product) return [];
    const base = product.imageUrls?.filter(Boolean) ?? [];
    if (activeVariant?.imageUrl) {
      const u = activeVariant.imageUrl;
      return [u, ...base.filter(b => b !== u)];
    }
    return base;
  }, [product, combination, activeVariant]);

  const price = product ? parseFloat(product.price) : 0;
  const effectivePrice =
    product && activeVariant?.price != null && String(activeVariant.price).trim() !== ""
      ? parseFloat(String(activeVariant.price))
      : price;

  const compareAt = product?.compareAtPrice ? parseFloat(product.compareAtPrice) : null;
  const hasDiscount = compareAt != null && compareAt > effectivePrice;
  const discountPct = hasDiscount ? Math.round(((compareAt! - effectivePrice) / compareAt!) * 100) : 0;

  const metaStock =
    product?.metadata && typeof (product.metadata as { stock?: unknown }).stock === "number"
      ? ((product.metadata as { stock: number }).stock as number)
      : null;

  const effectiveStockProduct =
    hasVariants && activeVariant
      ? activeVariant.stock
      : product?.effectiveStock != null
        ? product.effectiveStock
        : metaStock ?? 0;

  const outOfStockProduct = effectiveStockProduct <= 0;

  const comboPrice = combination ? parseFloat(combination.price) : 0;
  const outOfStockCombo = combination ? !combination.inStock : false;

  const handlePrevImage = () => {
    if (images.length === 0) return;
    setActiveImageIdx(i => (i - 1 + images.length) % images.length);
  };
  const handleNextImage = () => {
    if (images.length === 0) return;
    setActiveImageIdx(i => (i + 1) % images.length);
  };

  const handleAddToCart = () => {
    if (combination) {
      addToCart({
        id: combination.id,
        nameTR: combination.nameTR,
        nameEN: combination.nameEN,
        nameAR: combination.nameAR,
        price: comboPrice,
        quantity,
        collection: "",
        imageUrl: combination.imageUrl ?? images[0],
        combinationId: combination.id,
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      return;
    }
    if (!product) return;
    addToCart({
      id: product.id,
      nameTR: product.name,
      nameEN: product.name,
      nameAR: product.name,
      price: effectivePrice,
      quantity,
      collection: "",
      imageUrl: images[0],
      variantId: activeVariant ? activeVariant.id : undefined,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-[#1C1C1E]/40">
            <Loader2 size={18} className="animate-spin" />
            <span className="font-body text-sm tracking-widest uppercase">{tx.loading}</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || (!product && !combination)) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-6 pt-24">
          <h2 className="font-display text-3xl text-[#1C1C1E]">{tx.notFound}</h2>
          <Link
            href={sitePaths.silhouettes[lang]}
            className="font-body text-xs tracking-[0.2em] uppercase bg-[#1C1C1E] text-white px-8 py-3 hover:bg-[#C9A96E] transition-colors duration-300"
          >
            {tx.backToCollections}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = combination ? combination.name : product!.name;
  const outOfStock = combination ? outOfStockCombo : outOfStockProduct;
  const linePrice = combination ? comboPrice : effectivePrice;

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <main className="flex-1 pt-20 lg:pt-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <nav className="flex items-center gap-2 font-body text-[10px] tracking-[0.15em] uppercase text-[#1C1C1E]/40">
            <Link href={sitePaths.home[lang]} className="hover:text-[#C9A96E] transition-colors">
              {tx.home}
            </Link>
            <ChevronRight size={11} className={isRTL ? "rotate-180" : ""} />
            <Link href={sitePaths.silhouettes[lang]} className="hover:text-[#C9A96E] transition-colors">
              {tx.collections}
            </Link>
            <ChevronRight size={11} className={isRTL ? "rotate-180" : ""} />
            <span className="text-[#1C1C1E]/70 truncate max-w-[200px]">{displayName}</span>
          </nav>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="flex gap-4">
              {images.length > 1 && (
                <div className="hidden lg:flex flex-col gap-3 w-20 flex-shrink-0">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative aspect-[3/4] overflow-hidden border transition-all ${
                        activeImageIdx === idx ? "border-[#C9A96E]" : "border-transparent hover:border-[#1C1C1E]/20"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 relative">
                <div className="aspect-[3/4] bg-[#E8E0D5] overflow-hidden group">
                  {images[activeImageIdx] ? (
                    <img
                      src={images[activeImageIdx]}
                      alt={displayName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-body text-[10px] uppercase tracking-wider text-[#1C1C1E]/25">
                      {combination ? "—" : ""}
                    </div>
                  )}
                  {!combination && hasDiscount && (
                    <span className="absolute top-4 left-4 bg-[#1C1C1E] text-[#F7F3EC] font-body text-[10px] tracking-[0.2em] uppercase px-3 py-1.5">
                      −{discountPct}%
                    </span>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="lg:hidden absolute inset-y-0 inset-x-0 flex items-center justify-between px-2 pointer-events-none">
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="pointer-events-auto w-9 h-9 bg-[#F7F3EC]/90 backdrop-blur-sm flex items-center justify-center text-[#1C1C1E]"
                      aria-label="prev"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="pointer-events-auto w-9 h-9 bg-[#F7F3EC]/90 backdrop-blur-sm flex items-center justify-center text-[#1C1C1E]"
                      aria-label="next"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                {images.length > 1 && (
                  <div className="lg:hidden flex justify-center gap-1.5 mt-3">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIdx(idx)}
                        className={`h-1 transition-all ${
                          activeImageIdx === idx ? "w-8 bg-[#1C1C1E]" : "w-4 bg-[#1C1C1E]/20"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-[#C9A96E] mb-3">Voilée</p>
              <h1 className="font-display text-3xl lg:text-4xl text-[#1C1C1E] mb-5 leading-tight">{displayName}</h1>

              <div className="flex items-baseline gap-3 mb-8">
                <span className="font-display text-2xl text-[#1C1C1E]">{formatTRY(linePrice)}</span>
                {!combination && hasDiscount && compareAt != null && (
                  <span className="font-body text-sm text-[#1C1C1E]/40 line-through">{formatTRY(compareAt)}</span>
                )}
              </div>

              <span className="block w-12 h-px bg-[#C9A96E] mb-8" />

              {combination && (
                <div className="mb-8">
                  <p className="font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 mb-3">
                    {tx.comboIncludes}
                  </p>
                  <ul className="space-y-2 text-sm text-[#1C1C1E]/80">
                    {combination.items.map(it => (
                      <li key={`${it.productId}-${it.categoryId}-${it.variantId ?? "x"}`} className="flex flex-wrap gap-2">
                        <span className="font-body text-[10px] uppercase tracking-wider text-[#1C1C1E]/40 bg-[#1C1C1E]/5 px-2 py-0.5">
                          {it.categoryName}
                        </span>
                        <span>{comboItemLabel(lang as "TR" | "EN" | "AR", it)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!combination && hasVariants && (
                <div className="mb-7">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/60">{tx.color}</p>
                    <p className="font-body text-xs text-[#1C1C1E]/70">{activeVariant?.name ?? ""}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {variants.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`relative w-8 h-8 rounded-full transition-all ${
                          selectedVariantId === v.id
                            ? "ring-1 ring-[#C9A96E] ring-offset-2 ring-offset-[#F7F3EC]"
                            : "hover:scale-110"
                        }`}
                        aria-label={v.name}
                      >
                        <span
                          className="absolute inset-0 rounded-full border border-[#1C1C1E]/10"
                          style={{ backgroundColor: v.colorHex || "#ccc" }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <p className="font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 mb-3">{tx.quantity}</p>
                <div className="inline-flex items-center border border-[#1C1C1E]/20">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-11 h-11 flex items-center justify-center text-[#1C1C1E]/70 hover:text-[#C9A96E] transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-body text-sm text-[#1C1C1E]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-11 h-11 flex items-center justify-center text-[#1C1C1E]/70 hover:text-[#C9A96E] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className={`w-full inline-flex items-center justify-center gap-2 font-body text-xs tracking-[0.25em] uppercase py-4 transition-colors duration-300 ${
                    outOfStock
                      ? "bg-[#1C1C1E]/20 text-[#1C1C1E]/40 cursor-not-allowed"
                      : justAdded
                        ? "bg-[#C9A96E] text-white"
                        : "bg-[#1C1C1E] text-[#F7F3EC] hover:bg-[#C9A96E]"
                  }`}
                >
                  {outOfStock
                    ? tx.outOfStock
                    : justAdded
                      ? `✓ ${tx.added}`
                      : `${tx.addToCart} — ${formatTRY(linePrice * quantity)}`}
                </button>

                {!combination && (
                  <button
                    type="button"
                    onClick={() => setIsWishlisted(v => !v)}
                    className={`w-full inline-flex items-center justify-center gap-2 font-body text-xs tracking-[0.25em] uppercase py-4 border transition-colors duration-300 ${
                      isWishlisted
                        ? "border-[#C9A96E] text-[#C9A96E]"
                        : "border-[#1C1C1E]/30 text-[#1C1C1E] hover:border-[#C9A96E] hover:text-[#C9A96E]"
                    }`}
                  >
                    <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
                    {isWishlisted ? tx.inWishlist : tx.addToWishlist}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 py-5 border-t border-b border-[#C9A96E]/20 mb-8">
                {[
                  { icon: Truck, label: tx.free },
                  { icon: RefreshCcw, label: tx.returns },
                  { icon: Lock, label: tx.secure },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-2">
                    <item.icon size={16} className="text-[#C9A96E]" strokeWidth={1.5} />
                    <p className="font-body text-[10px] text-[#1C1C1E]/60 leading-snug">{item.label}</p>
                  </div>
                ))}
              </div>

              {product?.description && !combination && (
                <p className="font-body text-sm text-[#1C1C1E]/70 leading-relaxed">{product.description}</p>
              )}
              {combination?.description && (
                <p className="font-body text-sm text-[#1C1C1E]/70 leading-relaxed">{combination.description}</p>
              )}
            </div>
          </div>

          {product && !combination && <ProductTabs product={product} tx={tx} />}
        </div>

        {related.length > 0 && !combination && (
          <section className="bg-[#F7F3EC] border-t border-[#C9A96E]/15">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
              <h2 className="font-display text-2xl lg:text-3xl text-[#1C1C1E] text-center mb-10">{tx.relatedTitle}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {related.map(p => {
                  const img = p.imageUrls?.[0];
                  const pPrice = parseFloat(p.price);
                  return (
                    <Link key={p.id} href={productPath(lang, p.slug)} className="group block">
                      <div className="aspect-[3/4] bg-[#E8E0D5] overflow-hidden mb-3">
                        {img && (
                          <img
                            src={img}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <h3 className="font-body text-sm text-[#1C1C1E] mb-1">{p.name}</h3>
                      <p className="font-display text-base text-[#1C1C1E]">{formatTRY(pPrice)}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {relatedCombo.length > 0 && combination && (
          <section className="bg-[#F7F3EC] border-t border-[#C9A96E]/15">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
              <h2 className="font-display text-2xl lg:text-3xl text-[#1C1C1E] text-center mb-10">{tx.relatedTitle}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {relatedCombo.map(c => {
                  const img = c.imageUrl ?? undefined;
                  const pPrice = parseFloat(c.price);
                  const cn = lang === "EN" ? c.nameEN : lang === "AR" ? c.nameAR : c.nameTR;
                  return (
                    <Link key={c.id} href={productPath(lang, c.slug)} className="group block">
                      <div className="aspect-[3/4] bg-[#E8E0D5] overflow-hidden mb-3 relative">
                        {img ? (
                          <img
                            src={img}
                            alt={cn}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : null}
                        {!c.inStock && (
                          <span className="absolute top-2 left-2 bg-[#1C1C1E] text-[#F7F3EC] font-body text-[9px] tracking-wider uppercase px-2 py-0.5">
                            {tx.outOfStock}
                          </span>
                        )}
                      </div>
                      <h3 className="font-body text-sm text-[#1C1C1E] mb-1">{cn}</h3>
                      <p className="font-display text-base text-[#1C1C1E]">{formatTRY(pPrice)}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ProductTabs({ product, tx }: { product: Product; tx: typeof t.TR }) {
  const [active, setActive] = useState<keyof typeof tx.tabs>("details");
  const meta = (product.metadata ?? {}) as Record<string, unknown>;

  const content: Record<keyof typeof tx.tabs, string> = {
    details: product.description ?? "—",
    fabric:
      typeof meta.fabric === "string"
        ? meta.fabric
        : `${tx.fabricDefault}\n\n${tx.careDefault}`,
    size: typeof meta.size === "string" ? meta.size : tx.sizeDefault,
    shipping: tx.shippingDefault,
  };

  return (
    <div className="mt-20 lg:mt-28 max-w-3xl mx-auto">
      <div className="flex items-center justify-center gap-2 lg:gap-8 border-b border-[#C9A96E]/20 mb-8 overflow-x-auto">
        {(Object.keys(tx.tabs) as (keyof typeof tx.tabs)[]).map(key => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={`relative font-body text-[11px] lg:text-xs tracking-[0.2em] uppercase py-4 px-1 lg:px-3 whitespace-nowrap transition-colors ${
              active === key ? "text-[#1C1C1E]" : "text-[#1C1C1E]/40 hover:text-[#1C1C1E]/70"
            }`}
          >
            {tx.tabs[key]}
            {active === key && <span className="absolute bottom-0 left-0 right-0 h-px bg-[#C9A96E]" />}
          </button>
        ))}
      </div>

      <div className="font-body text-sm text-[#1C1C1E]/70 leading-relaxed text-center max-w-2xl mx-auto whitespace-pre-line min-h-[100px]">
        {content[active]}
      </div>
    </div>
  );
}
