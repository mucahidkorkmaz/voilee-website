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
import { api, type Product } from "@/lib/api";
import { sitePaths, productPath } from "@/lib/sitePaths";

const t = {
  TR: {
    home: "Ana Sayfa",
    collections: "Koleksiyonlar",
    loading: "Ürün yükleniyor...",
    notFound: "Ürün bulunamadı.",
    backToCollections: "Koleksiyonlara Dön",
    color: "Renk",
    size: "Beden",
    sizeGuide: "Beden Rehberi",
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
  },
  EN: {
    home: "Home",
    collections: "Collections",
    loading: "Loading product...",
    notFound: "Product not found.",
    backToCollections: "Back to Collections",
    color: "Color",
    size: "Size",
    sizeGuide: "Size Guide",
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
  },
  AR: {
    home: "الرئيسية",
    collections: "المجموعات",
    loading: "جارٍ تحميل المنتج...",
    notFound: "المنتج غير موجود.",
    backToCollections: "العودة إلى المجموعات",
    color: "اللون",
    size: "المقاس",
    sizeGuide: "دليل المقاسات",
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
  },
};

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"];
const DEFAULT_COLORS = [
  { id: "champagne", label: { TR: "Şampanya", EN: "Champagne", AR: "شمبانيا" }, hex: "#C9A96E" },
  { id: "ivory", label: { TR: "Fildişi", EN: "Ivory", AR: "عاجي" }, hex: "#F7F3EC" },
  { id: "charcoal", label: { TR: "Antrasit", EN: "Charcoal", AR: "فحمي" }, hex: "#1C1C1E" },
];

function formatTRY(value: number) {
  return `₺${value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0].id);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setActiveImageIdx(0);
    setSelectedSize(null);
    setQuantity(1);

    api
      .getProduct(slug)
      .then((res) => {
        setProduct(res.data);
        // Bağlı ürünler: aynı kategoriden farklı ürünler
        if (res.data?.categoryId) {
          api
            .getProducts({ categoryId: res.data.categoryId, limit: 8 })
            .then((r) => setRelated(r.data.filter((p) => p.id !== res.data.id).slice(0, 4)))
            .catch(() => setRelated([]));
        } else {
          api
            .getProducts({ limit: 5 })
            .then((r) => setRelated(r.data.filter((p) => p.id !== res.data.id).slice(0, 4)))
            .catch(() => setRelated([]));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const images = useMemo(() => product?.imageUrls?.filter(Boolean) ?? [], [product]);
  const price = product ? parseFloat(product.price) : 0;
  const compareAt = product?.compareAtPrice ? parseFloat(product.compareAtPrice) : null;
  const hasDiscount = compareAt != null && compareAt > price;
  const discountPct = hasDiscount ? Math.round(((compareAt! - price) / compareAt!) * 100) : 0;

  const handlePrevImage = () => {
    if (images.length === 0) return;
    setActiveImageIdx((i) => (i - 1 + images.length) % images.length);
  };
  const handleNextImage = () => {
    if (images.length === 0) return;
    setActiveImageIdx((i) => (i + 1) % images.length);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      nameTR: product.name,
      nameEN: product.name,
      nameAR: product.name,
      price,
      quantity,
      collection: "",
      imageUrl: images[0],
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

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-6 pt-24">
          <h2 className="font-display text-3xl text-[#1C1C1E]">{tx.notFound}</h2>
          <Link
            href={sitePaths.collections[lang]}
            className="font-body text-xs tracking-[0.2em] uppercase bg-[#1C1C1E] text-white px-8 py-3 hover:bg-[#C9A96E] transition-colors duration-300"
          >
            {tx.backToCollections}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const stock = product.metadata && typeof (product.metadata as any).stock === "number"
    ? ((product.metadata as any).stock as number)
    : null;
  const outOfStock = stock === 0;

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <main className="flex-1 pt-20 lg:pt-24">
        {/* Breadcrumb */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <nav className="flex items-center gap-2 font-body text-[10px] tracking-[0.15em] uppercase text-[#1C1C1E]/40">
            <Link href={sitePaths.home[lang]} className="hover:text-[#C9A96E] transition-colors">
              {tx.home}
            </Link>
            <ChevronRight size={11} className={isRTL ? "rotate-180" : ""} />
            <Link href={sitePaths.collections[lang]} className="hover:text-[#C9A96E] transition-colors">
              {tx.collections}
            </Link>
            <ChevronRight size={11} className={isRTL ? "rotate-180" : ""} />
            <span className="text-[#1C1C1E]/70 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* ─── Galeri ──────────────────────────────────────────────────── */}
            <div className="flex gap-4">
              {/* Thumbnails (desktop) */}
              {images.length > 1 && (
                <div className="hidden lg:flex flex-col gap-3 w-20 flex-shrink-0">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative aspect-[3/4] overflow-hidden border transition-all ${
                        activeImageIdx === idx
                          ? "border-[#C9A96E]"
                          : "border-transparent hover:border-[#1C1C1E]/20"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Ana görsel */}
              <div className="flex-1 relative">
                <div className="aspect-[3/4] bg-[#E8E0D5] overflow-hidden group">
                  {images[activeImageIdx] ? (
                    <img
                      src={images[activeImageIdx]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                  {hasDiscount && (
                    <span className="absolute top-4 left-4 bg-[#1C1C1E] text-[#F7F3EC] font-body text-[10px] tracking-[0.2em] uppercase px-3 py-1.5">
                      −{discountPct}%
                    </span>
                  )}
                </div>

                {/* Mobile prev/next */}
                {images.length > 1 && (
                  <div className="lg:hidden absolute inset-y-0 inset-x-0 flex items-center justify-between px-2 pointer-events-none">
                    <button
                      onClick={handlePrevImage}
                      className="pointer-events-auto w-9 h-9 bg-[#F7F3EC]/90 backdrop-blur-sm flex items-center justify-center text-[#1C1C1E]"
                      aria-label="prev"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="pointer-events-auto w-9 h-9 bg-[#F7F3EC]/90 backdrop-blur-sm flex items-center justify-center text-[#1C1C1E]"
                      aria-label="next"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                {/* Mobile dots */}
                {images.length > 1 && (
                  <div className="lg:hidden flex justify-center gap-1.5 mt-3">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`h-1 transition-all ${
                          activeImageIdx === idx
                            ? "w-8 bg-[#1C1C1E]"
                            : "w-4 bg-[#1C1C1E]/20"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ─── Bilgiler (sticky) ──────────────────────────────────────── */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-[#C9A96E] mb-3">
                Voilée
              </p>
              <h1 className="font-display text-3xl lg:text-4xl text-[#1C1C1E] mb-5 leading-tight">
                {product.name}
              </h1>

              {/* Fiyat */}
              <div className="flex items-baseline gap-3 mb-8">
                <span className="font-display text-2xl text-[#1C1C1E]">{formatTRY(price)}</span>
                {hasDiscount && (
                  <span className="font-body text-sm text-[#1C1C1E]/40 line-through">
                    {formatTRY(compareAt!)}
                  </span>
                )}
              </div>

              <span className="block w-12 h-px bg-[#C9A96E] mb-8" />

              {/* Renk seçici */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/60">
                    {tx.color}
                  </p>
                  <p className="font-body text-xs text-[#1C1C1E]/70">
                    {DEFAULT_COLORS.find((c) => c.id === selectedColor)?.label[lang]}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedColor(c.id)}
                      className={`relative w-8 h-8 rounded-full transition-all ${
                        selectedColor === c.id
                          ? "ring-1 ring-[#C9A96E] ring-offset-2 ring-offset-[#F7F3EC]"
                          : "hover:scale-110"
                      }`}
                      aria-label={c.label[lang]}
                    >
                      <span
                        className="absolute inset-0 rounded-full border border-[#1C1C1E]/10"
                        style={{ backgroundColor: c.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Beden seçici */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/60">
                    {tx.size}
                  </p>
                  <Link
                    href={sitePaths.sizeGuide[lang]}
                    className="font-body text-xs text-[#1C1C1E]/60 hover:text-[#C9A96E] transition-colors underline-offset-4 hover:underline"
                  >
                    {tx.sizeGuide} →
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  {DEFAULT_SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[44px] h-11 px-3 font-body text-xs tracking-[0.1em] uppercase border transition-all ${
                        selectedSize === s
                          ? "bg-[#1C1C1E] text-[#F7F3EC] border-[#1C1C1E]"
                          : "bg-transparent text-[#1C1C1E]/70 border-[#1C1C1E]/20 hover:border-[#1C1C1E]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Adet */}
              <div className="mb-8">
                <p className="font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 mb-3">
                  {tx.quantity}
                </p>
                <div className="inline-flex items-center border border-[#1C1C1E]/20">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-11 h-11 flex items-center justify-center text-[#1C1C1E]/70 hover:text-[#C9A96E] transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-body text-sm text-[#1C1C1E]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-11 h-11 flex items-center justify-center text-[#1C1C1E]/70 hover:text-[#C9A96E] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* CTA'lar */}
              <div className="space-y-3 mb-8">
                <button
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
                    : `${tx.addToCart} — ${formatTRY(price * quantity)}`}
                </button>

                <button
                  onClick={() => setIsWishlisted((v) => !v)}
                  className={`w-full inline-flex items-center justify-center gap-2 font-body text-xs tracking-[0.25em] uppercase py-4 border transition-colors duration-300 ${
                    isWishlisted
                      ? "border-[#C9A96E] text-[#C9A96E]"
                      : "border-[#1C1C1E]/30 text-[#1C1C1E] hover:border-[#C9A96E] hover:text-[#C9A96E]"
                  }`}
                >
                  <Heart
                    size={14}
                    fill={isWishlisted ? "currentColor" : "none"}
                    strokeWidth={1.5}
                  />
                  {isWishlisted ? tx.inWishlist : tx.addToWishlist}
                </button>
              </div>

              {/* Trust strip */}
              <div className="grid grid-cols-3 gap-2 py-5 border-t border-b border-[#C9A96E]/20 mb-8">
                {[
                  { icon: Truck, label: tx.free },
                  { icon: RefreshCcw, label: tx.returns },
                  { icon: Lock, label: tx.secure },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-2">
                    <item.icon size={16} className="text-[#C9A96E]" strokeWidth={1.5} />
                    <p className="font-body text-[10px] text-[#1C1C1E]/60 leading-snug">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Kısa açıklama */}
              {product.description && (
                <p className="font-body text-sm text-[#1C1C1E]/70 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {/* ─── Sekmeler ─────────────────────────────────────────────────── */}
          <ProductTabs product={product} tx={tx} />
        </div>

        {/* ─── Bağlı ürünler ──────────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="bg-[#F7F3EC] border-t border-[#C9A96E]/15">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
              <h2 className="font-display text-2xl lg:text-3xl text-[#1C1C1E] text-center mb-10">
                {tx.relatedTitle}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {related.map((p) => {
                  const img = p.imageUrls?.[0];
                  const pPrice = parseFloat(p.price);
                  return (
                    <Link
                      key={p.id}
                      href={productPath(lang, p.slug)}
                      className="group block"
                    >
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
      </main>

      <Footer />
    </div>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────
function ProductTabs({
  product,
  tx,
}: {
  product: Product;
  tx: typeof t.TR;
}) {
  const [active, setActive] = useState<keyof typeof tx.tabs>("details");
  const meta = (product.metadata ?? {}) as Record<string, any>;

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
        {(Object.keys(tx.tabs) as (keyof typeof tx.tabs)[]).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`relative font-body text-[11px] lg:text-xs tracking-[0.2em] uppercase py-4 px-1 lg:px-3 whitespace-nowrap transition-colors ${
              active === key ? "text-[#1C1C1E]" : "text-[#1C1C1E]/40 hover:text-[#1C1C1E]/70"
            }`}
          >
            {tx.tabs[key]}
            {active === key && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-[#C9A96E]" />
            )}
          </button>
        ))}
      </div>

      <div className="font-body text-sm text-[#1C1C1E]/70 leading-relaxed text-center max-w-2xl mx-auto whitespace-pre-line min-h-[100px]">
        {content[active]}
      </div>
    </div>
  );
}
