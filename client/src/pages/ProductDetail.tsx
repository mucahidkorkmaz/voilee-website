import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import {
  Heart,
  Loader2,
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
    addToWishlist: "Listeme Ekle",
    inWishlist: "Listeme Eklendi",
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
    comboIncludes: "Bu silüette",
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
    addToWishlist: "Save to List",
    inWishlist: "Saved to List",
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
    addToWishlist: "أضف إلى قائمتي",
    inWishlist: "في قائمتي",
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
  return `${base} — ${it.variantName}`;
}

// ─── Accordion ─────────────────────────────────────────────────────────────────
function ProductAccordion({
  product,
  combination,
  tx,
  isCombination = false,
  combinationDescription,
}: {
  product?: Product | null;
  combination?: CombinationDetail | null;
  tx: typeof t.TR;
  isCombination?: boolean;
  combinationDescription?: string;
}) {
  const [openSection, setOpenSection] = useState<string | null>(isCombination ? "shipping" : "details");
  const meta = (product?.metadata ?? {}) as Record<string, unknown>;
  const fabricContent = combination?.items
    .filter(item => item.productFabric)
    .map(item => `${item.categoryName ?? "—"}: ${item.productFabric}`)
    .join("\n") || tx.fabricDefault;

  const sections = isCombination
    ? [
        {
          key: "details",
          label: tx.tabs.details,
          content: combinationDescription ?? "—",
        },
        {
          key: "fabric",
          label: tx.tabs.fabric,
          content: fabricContent,
        },
        {
          key: "size",
          label: tx.tabs.size,
          content: tx.sizeDefault,
        },
        {
          key: "shipping",
          label: tx.tabs.shipping,
          content: tx.shippingDefault,
        },
      ]
    : [
        {
          key: "details",
          label: tx.tabs.details,
          content: product?.description ?? "—",
        },
        {
          key: "fabric",
          label: tx.tabs.fabric,
          content:
            typeof meta.fabric === "string"
              ? meta.fabric
              : `${tx.fabricDefault}\n\n${tx.careDefault}`,
        },
        {
          key: "size",
          label: tx.tabs.size,
          content: typeof meta.size === "string" ? meta.size : tx.sizeDefault,
        },
        {
          key: "shipping",
          label: tx.tabs.shipping,
          content: tx.shippingDefault,
        },
      ];

  return (
    <div className="mt-6">
      {sections.map((section) => (
        <div key={section.key} className="border-t border-[#C9A96E]/15 last:border-b">
          <button
            type="button"
            onClick={() =>
              setOpenSection((prev) => (prev === section.key ? null : section.key))
            }
            className="w-full flex items-center justify-between py-4 font-body text-[11px] tracking-[0.12em] uppercase text-[#1C1C1E] text-left"
          >
            {section.label}
            <span
              className="text-[#1C1C1E]/30 text-base leading-none"
              style={{
                display: "inline-block",
                transition: "transform 0.3s ease",
                transform: openSection === section.key ? "rotate(45deg)" : "rotate(0deg)",
              }}
            >
              +
            </span>
          </button>
          {openSection === section.key && (
            <div className="pb-5 font-body text-xs text-[#1C1C1E]/50 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Variant Selector (paylaşımlı) ─────────────────────────────────────────────
function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
  label,
}: {
  variants: ProductVariant[];
  selectedVariantId: number | null;
  onSelect: (id: number) => void;
  label: string;
}) {
  return (
    <div className="mb-6">
      <p className="font-body text-[10px] tracking-[0.15em] uppercase text-[#1C1C1E]/50 mb-3">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v.id)}
            disabled={v.stock <= 0}
            className={`font-body text-[11px] tracking-[0.05em] px-4 py-2.5 border focus-visible:outline-none ${
              selectedVariantId === v.id
                ? "border-primary bg-primary text-primary-foreground"
                : v.stock <= 0
                  ? "border-border/50 text-foreground/25 line-through cursor-not-allowed"
                  : "border-border text-foreground hover:border-foreground/60"
            }`}
          >
            {v.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Ana Component ─────────────────────────────────────────────────────────────
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
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setProduct(null);
    setCombination(null);
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

    return () => { cancelled = true; };
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

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleWheel = (e: WheelEvent) => {
      const gallery = document.querySelector('.custom-gallery-scroll') as HTMLElement;
      if (!gallery || !gallery.contains(e.target as Node)) return;

      if (e.deltaY < 0 && window.scrollY > 0) {
        gallery.style.overflowY = 'hidden';
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          gallery.style.overflowY = 'auto';
        }, 200);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(timeout);
    };
  }, []);

  const price = product ? parseFloat(product.price) : 0;
  const effectivePrice =
    product && activeVariant?.price != null && String(activeVariant.price).trim() !== ""
      ? parseFloat(String(activeVariant.price))
      : price;

  const compareAt = product?.compareAtPrice ? parseFloat(product.compareAtPrice) : null;
  const hasDiscount = compareAt != null && compareAt > effectivePrice;

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

  // ─── Loading & Not Found ──────────────────────────────────────────────────────
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
  const productSku = (product as (Product & { sku?: string | null }) | null)?.sku ?? null;

  // ─── Combination items ────────────────────────────────────────────────────────
  const CombinationItems = () =>
    combination ? (
      <div className="mb-6">
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/50 mb-3">
          {tx.comboIncludes}
        </p>
        <ul className="space-y-2">
          {combination.items.map((item, i) => (
            <li key={i} className="flex flex-wrap gap-2 text-sm text-[#1C1C1E]/80">
              <span className="font-body text-[9px] uppercase tracking-wider text-[#1C1C1E]/40 bg-[#1C1C1E]/5 px-2 py-0.5">
                {item.categoryName ?? "—"}
              </span>
              <span>{comboItemLabel(lang, item)}</span>
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col overflow-visible" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <main className="flex-1 pt-20 min-[901px]:pt-24 overflow-visible">

        {/* ════════════════════════════════════════════════════════════════════
            MOBİL LAYOUT (lg altı)
        ════════════════════════════════════════════════════════════════════ */}

        <div className="min-[901px]:hidden">
          <div className="flex flex-row flex-nowrap overflow-x-auto snap-x snap-mandatory scrollbar-hide bg-secondary">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-screen shrink-0 snap-center aspect-[3/4] overflow-hidden bg-secondary">
                <img
                  src={img}
                  alt={`${displayName} - ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="px-5 py-7">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="font-display text-xl text-[#1C1C1E] leading-tight">
                {displayName}
              </h1>
              <div className="text-right shrink-0">
                {hasDiscount && compareAt && (
                  <p className="font-body text-xs text-[#1C1C1E]/40 line-through">
                    {formatTRY(compareAt)}
                  </p>
                )}
                <p className="font-body text-sm text-[#1C1C1E]">{formatTRY(linePrice)}</p>
              </div>
            </div>

            {(product?.description || combination?.description) && (
              <p className="font-body text-sm text-[#1C1C1E]/70 leading-relaxed mb-6">
                {product?.description ?? combination?.description}
              </p>
            )}

            <CombinationItems />

            {!combination && hasVariants && (
              <VariantSelector
                variants={variants}
                selectedVariantId={selectedVariantId}
                onSelect={setSelectedVariantId}
                label={tx.color}
              />
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`w-full py-[18px] font-body text-[11px] tracking-[0.2em] uppercase mb-3 transition-colors duration-300 focus-visible:outline-none ${
                outOfStock
                  ? "bg-primary/20 text-foreground/40 cursor-not-allowed"
                  : justAdded
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary text-primary-foreground"
              }`}
            >
              {outOfStock ? tx.outOfStock : justAdded ? `✓ ${tx.added}` : `${tx.addToCart} — ${formatTRY(linePrice)}`}
            </button>

            {product && !combination && <ProductAccordion product={product} tx={tx} />}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            MASAÜSTÜ LAYOUT (lg ve üzeri)
            Flex kullanıyoruz — arbitrary grid değerleri Tailwind'de compile
            edilmeyebilir. Flex ile sol kolon esnek, sağ kolon sabit 420px.
        ════════════════════════════════════════════════════════════════════ */}
        <div className="hidden min-[901px]:flex items-start max-w-[1440px] mx-auto px-[5vw] overflow-visible h-[calc(100vh-120px)]">
          {/* Sol: Görseller dikey akıyor */}
          <div
            className="custom-gallery-scroll min-w-0 basis-1/2 h-full overflow-y-auto overscroll-y-auto overflow-x-hidden scrollbar-hide flex flex-col px-[5%]"
          >
            {images.map((img, idx) => (
              <div key={idx} className="relative bg-secondary overflow-hidden shrink-0 mb-1 last:mb-0 flex justify-center">
                <img
                  src={img}
                  alt={`${displayName} - ${idx + 1}`}
                  className="w-full h-[calc(100vh-120px)] block shrink-0 object-cover object-top"
                />
              </div>
            ))}
          </div>

          {/* Sağ: Sticky wrapper — overflow OLMADAN */}
          <div
            className="basis-1/2 bg-transparent pl-10 h-full overflow-y-auto self-start"
          >
              <div className="px-[40px] py-[60px]">
                <Link
                  href={sitePaths.silhouettes[lang]}
                  className="inline-block font-body text-[10px] tracking-[0.2em] uppercase text-accent mb-3 hover:text-foreground transition-colors duration-200"
                >
                  {tx.collections}
                </Link>
                <h1 className="font-display text-3xl text-foreground mb-4 leading-tight">
                  {displayName}
                </h1>

                {productSku && (
                  <p className="font-body text-[10px] tracking-[0.08em] text-foreground/30 mb-4">
                    {productSku}
                  </p>
                )}

                <div className="flex items-baseline gap-3 mb-8">
                  {hasDiscount && compareAt && (
                    <span className="font-body text-sm text-foreground/40 line-through">
                      {formatTRY(compareAt)}
                    </span>
                  )}
                  <span className="font-display text-2xl text-foreground">
                    {formatTRY(linePrice)}
                  </span>
                </div>

                {product?.description && (
                  <p className="font-body text-[13px] text-foreground/65 leading-relaxed mb-7">
                    {product.description}
                  </p>
                )}

                {combination?.description && (
                  <p className="font-body text-[13px] text-foreground/65 leading-relaxed mb-7">
                    {combination.description}
                  </p>
                )}

                <CombinationItems />

                {!combination && hasVariants && (
                  <VariantSelector
                    variants={variants}
                    selectedVariantId={selectedVariantId}
                    onSelect={setSelectedVariantId}
                    label={tx.color}
                  />
                )}

                <div className="space-y-3 mb-8">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={outOfStock}
                    className={`w-full py-[18px] font-body text-xs tracking-[0.25em] uppercase transition-colors duration-300 focus-visible:outline-none ${
                      outOfStock
                        ? "bg-primary/20 text-foreground/40 cursor-not-allowed"
                        : justAdded
                          ? "bg-accent text-accent-foreground"
                          : "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
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
                      className={`w-full inline-flex items-center justify-center gap-2 font-body text-xs tracking-[0.25em] uppercase py-[18px] border border-border transition-colors duration-300 focus-visible:outline-none ${
                        isWishlisted
                          ? "text-accent"
                          : "text-foreground hover:border-accent hover:text-accent"
                      }`}
                    >
                      <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
                      {isWishlisted ? tx.inWishlist : tx.addToWishlist}
                    </button>
                  )}
                </div>

                {product && !combination && <ProductAccordion product={product} tx={tx} />}
                {combination && (
                  <ProductAccordion
                    tx={tx}
                    combination={combination}
                    isCombination
                    combinationDescription={combination.description ?? undefined}
                  />
                )}
              </div>
          </div>
        </div>

        {/* ── İlgili ürünler ────────────────────────────────────────────────── */}
        {related.length > 0 && !combination && (
          <section className="bg-[#F7F3EC] mt-24 lg:mt-28">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
              <h2 className="font-display text-2xl lg:text-3xl text-[#1C1C1E] text-center mb-10">
                {tx.relatedTitle}
              </h2>
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
          <section className="bg-[#F7F3EC] mt-24 lg:mt-28">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
              <h2 className="font-display text-2xl lg:text-3xl text-[#1C1C1E] text-center mb-10">
                {tx.relatedTitle}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {relatedCombo.map(c => {
                  const img = c.imageUrl ?? undefined;
                  const pPrice = parseFloat(c.price);
                  const cn = lang === "EN" ? c.nameEN : lang === "AR" ? c.nameAR : c.nameTR;
                  return (
                    <Link key={c.id} href={productPath(lang, c.slug)} className="group block">
                      <div className="aspect-[3/4] bg-[#E8E0D5] overflow-hidden mb-3 relative">
                        {img && (
                          <img
                            src={img}
                            alt={cn}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
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