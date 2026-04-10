import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { X, Check, ArrowRight, ShoppingBag, RotateCcw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  nameTR: string;
  nameEN: string;
  price: number;
  image: string;
}

interface Silhouette {
  id: string;
  name: string;
  tagline: string;
  coverImage: string;
  categories: {
    id: string;
    labelTR: string;
    labelEN: string;
    products: Product[];
  }[];
  completedImages: string[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PLACEHOLDER = "https://placehold.co/400x560/E8E0D5/8B7D6B?text=VOIL%C3%89E";
const PLACEHOLDER_COMBO = "https://placehold.co/600x800/E8E0D5/8B7D6B?text=Look";

const silhouettes: Silhouette[] = [
  {
    id: "origine",
    name: "Origine",
    tagline: "Köklere dönüş",
    coverImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_origine_57e73407.webp",
    categories: [
      {
        id: "abaya",
        labelTR: "Abaya",
        labelEN: "Abaya",
        products: [
          { id: "or-a1", nameTR: "Origine Classic Abaya", nameEN: "Origine Classic Abaya", price: 2490, image: PLACEHOLDER },
          { id: "or-a2", nameTR: "Origine Saten Abaya", nameEN: "Origine Satin Abaya", price: 2890, image: PLACEHOLDER },
          { id: "or-a3", nameTR: "Origine İpek Abaya", nameEN: "Origine Silk Abaya", price: 3290, image: PLACEHOLDER },
        ],
      },
      {
        id: "esarp",
        labelTR: "Eşarp",
        labelEN: "Scarf",
        products: [
          { id: "or-s1", nameTR: "Origine İpek Eşarp", nameEN: "Origine Silk Scarf", price: 890, image: PLACEHOLDER },
          { id: "or-s2", nameTR: "Origine Pamuklu Eşarp", nameEN: "Origine Cotton Scarf", price: 590, image: PLACEHOLDER },
        ],
      },
      {
        id: "ferace",
        labelTR: "Ferace",
        labelEN: "Ferace",
        products: [
          { id: "or-f1", nameTR: "Origine Krep Ferace", nameEN: "Origine Crepe Ferace", price: 1890, image: PLACEHOLDER },
          { id: "or-f2", nameTR: "Origine Saten Ferace", nameEN: "Origine Satin Ferace", price: 2190, image: PLACEHOLDER },
        ],
      },
      {
        id: "aksesuar",
        labelTR: "Aksesuar",
        labelEN: "Accessory",
        products: [
          { id: "or-ak1", nameTR: "Origine Broş", nameEN: "Origine Brooch", price: 490, image: PLACEHOLDER },
          { id: "or-ak2", nameTR: "Origine Kemer", nameEN: "Origine Belt", price: 690, image: PLACEHOLDER },
        ],
      },
    ],
    completedImages: [PLACEHOLDER_COMBO, PLACEHOLDER_COMBO],
  },
  {
    id: "epure",
    name: "Épure",
    tagline: "Saf zarafet",
    coverImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_epure_2d5aaf15.webp",
    categories: [
      {
        id: "abaya",
        labelTR: "Abaya",
        labelEN: "Abaya",
        products: [
          { id: "ep-a1", nameTR: "Épure Minimal Abaya", nameEN: "Épure Minimal Abaya", price: 2990, image: PLACEHOLDER },
          { id: "ep-a2", nameTR: "Épure Asimetrik Abaya", nameEN: "Épure Asymmetric Abaya", price: 3490, image: PLACEHOLDER },
        ],
      },
      {
        id: "esarp",
        labelTR: "Eşarp",
        labelEN: "Scarf",
        products: [
          { id: "ep-s1", nameTR: "Épure Modal Eşarp", nameEN: "Épure Modal Scarf", price: 750, image: PLACEHOLDER },
          { id: "ep-s2", nameTR: "Épure Şifon Eşarp", nameEN: "Épure Chiffon Scarf", price: 650, image: PLACEHOLDER },
        ],
      },
      {
        id: "ferace",
        labelTR: "Ferace",
        labelEN: "Ferace",
        products: [
          { id: "ep-f1", nameTR: "Épure Geometrik Ferace", nameEN: "Épure Geometric Ferace", price: 2290, image: PLACEHOLDER },
        ],
      },
      {
        id: "aksesuar",
        labelTR: "Aksesuar",
        labelEN: "Accessory",
        products: [
          { id: "ep-ak1", nameTR: "Épure Minimal Broş", nameEN: "Épure Minimal Brooch", price: 390, image: PLACEHOLDER },
        ],
      },
    ],
    completedImages: [PLACEHOLDER_COMBO, PLACEHOLDER_COMBO],
  },
  {
    id: "elegance",
    name: "Élégance",
    tagline: "Zamansız incelik",
    coverImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_heritage_1a6b4b02.webp",
    categories: [
      {
        id: "abaya",
        labelTR: "Abaya",
        labelEN: "Abaya",
        products: [
          { id: "el-a1", nameTR: "Élégance Kadife Abaya", nameEN: "Élégance Velvet Abaya", price: 4290, image: PLACEHOLDER },
          { id: "el-a2", nameTR: "Élégance Dantel Abaya", nameEN: "Élégance Lace Abaya", price: 3890, image: PLACEHOLDER },
          { id: "el-a3", nameTR: "Élégance Organze Abaya", nameEN: "Élégance Organza Abaya", price: 4690, image: PLACEHOLDER },
        ],
      },
      {
        id: "esarp",
        labelTR: "Eşarp",
        labelEN: "Scarf",
        products: [
          { id: "el-s1", nameTR: "Élégance Kadife Eşarp", nameEN: "Élégance Velvet Scarf", price: 1190, image: PLACEHOLDER },
          { id: "el-s2", nameTR: "Élégance İpek Eşarp", nameEN: "Élégance Silk Scarf", price: 990, image: PLACEHOLDER },
        ],
      },
      {
        id: "ferace",
        labelTR: "Ferace",
        labelEN: "Ferace",
        products: [
          { id: "el-f1", nameTR: "Élégance Organze Ferace", nameEN: "Élégance Organza Ferace", price: 2890, image: PLACEHOLDER },
          { id: "el-f2", nameTR: "Élégance Kadife Ferace", nameEN: "Élégance Velvet Ferace", price: 3190, image: PLACEHOLDER },
        ],
      },
      {
        id: "aksesuar",
        labelTR: "Aksesuar",
        labelEN: "Accessory",
        products: [
          { id: "el-ak1", nameTR: "Élégance Mücevher Broş", nameEN: "Élégance Jewel Brooch", price: 890, image: PLACEHOLDER },
          { id: "el-ak2", nameTR: "Élégance Altın Kemer", nameEN: "Élégance Gold Belt", price: 990, image: PLACEHOLDER },
        ],
      },
    ],
    completedImages: [PLACEHOLDER_COMBO, PLACEHOLDER_COMBO],
  },
  {
    id: "lumiere",
    name: "Lumière",
    tagline: "Işığın dansı",
    coverImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_mouvement_7b7c4f3e.webp",
    categories: [
      {
        id: "abaya",
        labelTR: "Abaya",
        labelEN: "Abaya",
        products: [
          { id: "lu-a1", nameTR: "Lumière Şifon Abaya", nameEN: "Lumière Chiffon Abaya", price: 3190, image: PLACEHOLDER },
          { id: "lu-a2", nameTR: "Lumière Işıltılı Abaya", nameEN: "Lumière Shimmer Abaya", price: 3690, image: PLACEHOLDER },
        ],
      },
      {
        id: "esarp",
        labelTR: "Eşarp",
        labelEN: "Scarf",
        products: [
          { id: "lu-s1", nameTR: "Lumière Kristal Eşarp", nameEN: "Lumière Crystal Scarf", price: 1390, image: PLACEHOLDER },
          { id: "lu-s2", nameTR: "Lumière Şifon Eşarp", nameEN: "Lumière Chiffon Scarf", price: 890, image: PLACEHOLDER },
        ],
      },
      {
        id: "ferace",
        labelTR: "Ferace",
        labelEN: "Ferace",
        products: [
          { id: "lu-f1", nameTR: "Lumière Şifon Ferace", nameEN: "Lumière Chiffon Ferace", price: 2490, image: PLACEHOLDER },
        ],
      },
      {
        id: "aksesuar",
        labelTR: "Aksesuar",
        labelEN: "Accessory",
        products: [
          { id: "lu-ak1", nameTR: "Lumière Kristal Toka", nameEN: "Lumière Crystal Clasp", price: 590, image: PLACEHOLDER },
          { id: "lu-ak2", nameTR: "Lumière İnci Broş", nameEN: "Lumière Pearl Brooch", price: 790, image: PLACEHOLDER },
        ],
      },
    ],
    completedImages: [PLACEHOLDER_COMBO, PLACEHOLDER_COMBO],
  },
];

// ─── Mannequin SVG ─────────────────────────────────────────────────────────────

function MannequinSVG({ hasSelections }: { hasSelections: boolean }) {
  const color = hasSelections ? "#C9A96E" : "#C4B9A8";
  return (
    <svg
      viewBox="0 0 200 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="Manken silueti"
    >
      <ellipse cx="100" cy="42" rx="26" ry="30" fill={color} opacity="0.6" />
      <rect x="91" y="68" width="18" height="20" rx="4" fill={color} opacity="0.5" />
      <path d="M38 100 Q100 82 162 100" stroke={color} strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M55 100 L42 210 Q100 225 158 210 L145 100 Q100 112 55 100Z" fill={color} opacity="0.25" />
      <path d="M55 100 L42 210 Q100 225 158 210 L145 100 Q100 112 55 100Z" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M55 102 Q30 140 34 210" stroke={color} strokeWidth="14" strokeLinecap="round" opacity="0.25" />
      <path d="M145 102 Q170 140 166 210" stroke={color} strokeWidth="14" strokeLinecap="round" opacity="0.25" />
      <ellipse cx="100" cy="215" rx="38" ry="10" fill={color} opacity="0.3" />
      <path d="M62 215 Q48 320 44 420 Q100 432 156 420 Q152 320 138 215 Q100 228 62 215Z" fill={color} opacity="0.2" />
      <path d="M62 215 Q48 320 44 420 Q100 432 156 420 Q152 320 138 215 Q100 228 62 215Z" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
      <rect x="78" y="420" width="44" height="6" rx="3" fill={color} opacity="0.4" />
      <rect x="88" y="426" width="24" height="20" rx="2" fill={color} opacity="0.3" />
      <rect x="94" y="446" width="12" height="24" rx="2" fill={color} opacity="0.3" />
      <rect x="70" y="468" width="60" height="6" rx="3" fill={color} opacity="0.4" />
    </svg>
  );
}

// ─── Silhouette Picker Modal ────────────────────────────────────────────────────

interface SilhouettePickerProps {
  current: Silhouette | null;
  onSelect: (s: Silhouette) => void;
  onClose: () => void;
  lang: string;
}

function SilhouettePicker({ current, onSelect, onClose, lang }: SilhouettePickerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [current, onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={lang === "TR" ? "Siluet Seçin" : "Choose Silhouette"}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1C1C1E]/70 backdrop-blur-sm" style={{ animation: "fadeIn 0.25s ease forwards" }} />

      {/* Panel */}
      <div
        className="relative bg-[#F7F3EC] w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
        style={{ animation: "modalIn 0.3s ease forwards" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-7 border-b border-[#C9A96E]/20">
          <div>
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] mb-1">
              {lang === "TR" ? "Koleksiyonlar" : "Collections"}
            </p>
            <h2 className="font-display text-3xl text-[#1C1C1E]">
              {lang === "TR" ? "Siluet Seçin" : "Choose Silhouette"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-[#1C1C1E]/40 hover:text-[#1C1C1E] transition-colors border border-[#1C1C1E]/15 hover:border-[#1C1C1E]/40"
            aria-label="Kapat"
          >
            <X size={17} />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {silhouettes.map((s) => {
              const isActive = current?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onSelect(s)}
                  className={`group relative overflow-hidden border-2 transition-all duration-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] ${
                    isActive ? "border-[#C9A96E]" : "border-transparent hover:border-[#C9A96E]/40"
                  }`}
                  aria-pressed={isActive}
                  aria-label={`${s.name} — ${s.tagline}`}
                >
                  {/* Image */}
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={s.coverImage}
                      alt={s.name}
                      className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
                    />
                  </div>
                  {/* Overlay */}
                  <div
                    className={`absolute inset-0 flex flex-col justify-end p-4 transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-t from-[#1C1C1E]/85 via-[#1C1C1E]/20 to-transparent"
                        : "bg-gradient-to-t from-[#1C1C1E]/60 via-transparent to-transparent"
                    }`}
                  >
                    <p className="font-display text-white text-xl leading-tight">{s.name}</p>
                    <p className="font-body text-white/60 text-[9px] tracking-[0.12em] uppercase mt-0.5">
                      {s.tagline}
                    </p>
                  </div>
                  {/* Active check */}
                  {isActive && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#C9A96E] flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#C9A96E]/20 flex items-center justify-between gap-4">
          <p className="font-body text-[10px] tracking-[0.15em] uppercase text-[#1C1C1E]/30">
            {lang === "TR"
              ? "Siluet seçerek kombinizi oluşturun"
              : "Select a silhouette to build your look"}
          </p>
          <Link
            href={lang === "TR" ? "/koleksiyonlar" : lang === "EN" ? "/en/collections" : "/ar/collections"}
            className="flex-shrink-0 flex items-center gap-1.5 font-body text-[10px] tracking-[0.15em] uppercase text-[#1C1C1E]/50 hover:text-[#C9A96E] transition-colors duration-300 group"
          >
            {lang === "TR" ? "Tüm Koleksiyonu Görüntüle" : "View Full Collection"}
            <ArrowRight size={11} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Product Modal ─────────────────────────────────────────────────────────────

interface ProductModalProps {
  silhouette: Silhouette;
  categoryId: string;
  selected: string | undefined;
  onSelect: (product: Product) => void;
  onClose: () => void;
  lang: string;
}

function ProductModal({ silhouette, categoryId, selected, onSelect, onClose, lang }: ProductModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const category = silhouette.categories.find((c) => c.id === categoryId);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  if (!category) return null;

  const categoryLabel = lang === "TR" ? category.labelTR : category.labelEN;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${silhouette.name} — ${categoryLabel}`}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-[#1C1C1E]/60 backdrop-blur-sm" style={{ animation: "fadeIn 0.25s ease forwards" }} />

      <div
        className="relative bg-[#F7F3EC] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ animation: "modalIn 0.3s ease forwards" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#C9A96E]/20">
          <div>
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-[#C9A96E] mb-1">
              {silhouette.name}
            </p>
            <h2 className="font-display text-2xl text-[#1C1C1E]">{categoryLabel}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#1C1C1E]/40 hover:text-[#1C1C1E] transition-colors"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Grid */}
        <div className="overflow-y-auto p-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {category.products.map((product) => {
              const isSelected = selected === product.id;
              const name = lang === "TR" ? product.nameTR : product.nameEN;
              return (
                <button
                  key={product.id}
                  onClick={() => onSelect(product)}
                  className={`group relative text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] ${
                    isSelected ? "ring-2 ring-[#C9A96E]" : ""
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`${name} — ₺${product.price.toLocaleString()}`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#E8E0D5] mb-3">
                    <img
                      src={product.image}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#C9A96E]/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#C9A96E] flex items-center justify-center">
                          <Check size={16} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="font-body text-xs text-[#1C1C1E] leading-snug mb-1">{name}</p>
                  <p className="font-display text-base text-[#1C1C1E]">₺{product.price.toLocaleString()}</p>
                  <div
                    className={`mt-2 w-full py-2 text-center font-body text-[10px] tracking-[0.15em] uppercase border transition-all duration-300 ${
                      isSelected
                        ? "bg-[#C9A96E] text-white border-[#C9A96E]"
                        : "bg-transparent text-[#1C1C1E]/60 border-[#1C1C1E]/20 group-hover:border-[#1C1C1E]"
                    }`}
                  >
                    {isSelected ? (lang === "TR" ? "Seçildi" : "Selected") : (lang === "TR" ? "Seç" : "Select")}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#C9A96E]/20 flex justify-end">
          <button
            onClick={onClose}
            className="font-body text-xs tracking-[0.15em] uppercase px-8 py-3 bg-[#1C1C1E] text-[#F7F3EC] hover:bg-[#C9A96E] transition-colors duration-300"
          >
            {lang === "TR" ? "Tamam" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SilhouetteBuilder() {
  const { lang } = useLanguage();
  const { addToCart, openCart } = useCart();

  const [selectedSilhouette, setSelectedSilhouette] = useState<Silhouette | null>(null);
  const [showSilhouettePicker, setShowSilhouettePicker] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, Product>>({});
  const [phase, setPhase] = useState<"builder" | "result">("builder");

  const hasSelections = Object.keys(selections).length > 0;
  const canComplete = hasSelections;
  const totalPrice = Object.values(selections).reduce((sum, p) => sum + p.price, 0);
  const selectedCount = Object.keys(selections).length;

  function handleSelectSilhouette(s: Silhouette) {
    if (selectedSilhouette?.id !== s.id) {
      setSelections({});
      setPhase("builder");
      setActiveCategoryId(null);
    }
    setSelectedSilhouette(s);
    setShowSilhouettePicker(false);
  }

  function handleChangeSilhouette() {
    setShowSilhouettePicker(true);
  }

  function handleSelectProduct(categoryId: string, product: Product) {
    setSelections((prev) => ({ ...prev, [categoryId]: product }));
  }

  function handleComplete() {
    setPhase("result");
  }

  function handleReset() {
    setSelections({});
    setPhase("builder");
    setShowSilhouettePicker(true);
    setSelectedSilhouette(null);
  }

  function handleAddToCart() {
    if (!selectedSilhouette) return;
    Object.entries(selections).forEach(([, product]) => {
      addToCart({
        id: parseInt(product.id.replace(/\D/g, ""), 10) || Math.floor(Math.random() * 10000),
        nameTR: product.nameTR,
        nameEN: product.nameEN,
        nameAR: product.nameEN,
        price: product.price,
        quantity: 1,
        collection: selectedSilhouette.name.toUpperCase(),
        imageUrl: product.image,
      });
    });
    toast.success(
      lang === "TR"
        ? `${selectedCount} ürün sepete eklendi — ₺${totalPrice.toLocaleString()}`
        : `${selectedCount} item(s) added to cart — ₺${totalPrice.toLocaleString()}`,
      { duration: 4000 }
    );
    openCart();
  }

  const t = {
    title: lang === "TR" ? "Siluet Oluşturucu" : "Silhouette Builder",
    subtitle:
      lang === "TR"
        ? "Koleksiyonunuzu seçin, kategorileri tamamlayın ve tüm kombini tek seferde sepete ekleyin."
        : "Choose your collection, complete the categories and add the whole look to your cart.",
    changeSilhouette: lang === "TR" ? "Siluet Değiştir" : "Change Silhouette",
    complete: lang === "TR" ? "Silüeti Tamamla" : "Complete Silhouette",
    reset: lang === "TR" ? "Yeniden Oluştur" : "Create New",
    addToCart: lang === "TR" ? "Sepete Ekle" : "Add to Cart",
    viewAll: lang === "TR" ? "Tüm Ürünleri Görüntüle" : "View All Products",
    yourLook: lang === "TR" ? "Kombiniz" : "Your Look",
    lookReady: lang === "TR" ? "Kombiniz hazır" : "Your look is ready",
    total: lang === "TR" ? "Toplam" : "Total",
    selectCategory: lang === "TR" ? "Kategori seçin" : "Select a category",
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Navbar />

      {/* Hero */}
      <div className="pt-20 lg:pt-28 pb-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto text-center">
        <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
          {lang === "TR" ? "Koleksiyonlar" : "Collections"}
        </p>
        <h1 className="font-display text-5xl lg:text-6xl text-[#1C1C1E] mb-4">{t.title}</h1>
        <p className="font-body text-sm text-[#1C1C1E]/50 max-w-lg mx-auto leading-relaxed">
          {t.subtitle}
        </p>
        <div className="gold-line mx-auto mt-6" />
      </div>

      {/* Builder Area */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {selectedSilhouette && phase === "builder" && (
          <>
            {/* Selected silhouette label + change button */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-[#C9A96E]" />
                <span className="font-display text-2xl text-[#1C1C1E]">{selectedSilhouette.name}</span>
                <span className="font-body text-xs text-[#1C1C1E]/40 tracking-[0.1em]">
                  — {selectedSilhouette.tagline}
                </span>
              </div>
              <button
                onClick={handleChangeSilhouette}
                className="flex items-center gap-1.5 font-body text-[10px] tracking-[0.15em] uppercase text-[#C9A96E] hover:text-[#1C1C1E] transition-colors border border-[#C9A96E]/30 hover:border-[#1C1C1E]/30 px-3 py-1.5"
              >
                <ChevronDown size={11} />
                {t.changeSilhouette}
              </button>
            </div>

            {/* ── Category Buttons (horizontal, above mannequin) ── */}
            <div className="flex items-center justify-center gap-2 flex-wrap mb-8" role="group" aria-label={t.selectCategory}>
              {selectedSilhouette.categories.map((cat) => {
                const label = lang === "TR" ? cat.labelTR : cat.labelEN;
                const isSelected = !!selections[cat.id];
                const selectedProduct = selections[cat.id];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`group flex items-center gap-2 px-5 py-2.5 border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] ${
                      isSelected
                        ? "border-[#C9A96E] bg-[#C9A96E]/8 text-[#C9A96E]"
                        : "border-[#1C1C1E]/15 bg-transparent text-[#1C1C1E]/55 hover:border-[#1C1C1E]/35 hover:text-[#1C1C1E]"
                    }`}
                    aria-label={`${label}${isSelected ? ` — ${lang === "TR" ? selectedProduct.nameTR : selectedProduct.nameEN}` : ""}`}
                  >
                    {isSelected ? (
                      <Check size={11} className="flex-shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full border border-current flex-shrink-0 opacity-50" />
                    )}
                    <span className="font-body text-xs tracking-[0.12em] uppercase">{label}</span>
                    {isSelected && (
                      <span className="font-body text-[9px] text-[#1C1C1E]/50 border-l border-[#C9A96E]/30 pl-2 max-w-[80px] truncate">
                        ₺{selectedProduct.price.toLocaleString()}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Mannequin Center Area ── */}
        {phase === "builder" ? (
          <div className="flex flex-col items-center">
            {/* Mannequin */}
            <div
              className={`transition-all duration-700 ${
                selectedSilhouette ? "opacity-100" : "opacity-40"
              }`}
              style={{ width: "min(260px, 55vw)" }}
            >
              <MannequinSVG hasSelections={hasSelections} />
            </div>

            {/* Total */}
            {hasSelections && (
              <div className="mt-6 text-center">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/40 mb-1">
                  {t.total}
                </p>
                <p className="font-display text-3xl text-[#1C1C1E]">
                  ₺{totalPrice.toLocaleString()}
                </p>
              </div>
            )}

            {/* No silhouette hint */}
            {!selectedSilhouette && (
              <p className="mt-6 font-body text-xs tracking-[0.2em] uppercase text-[#1C1C1E]/30">
                {lang === "TR" ? "Bir siluet seçerek başlayın" : "Select a silhouette to begin"}
              </p>
            )}

            {/* Complete button */}
            <button
              onClick={handleComplete}
              disabled={!canComplete}
              className={`mt-8 px-12 py-3.5 font-body text-xs tracking-[0.2em] uppercase transition-all duration-400 ${
                canComplete
                  ? "bg-[#1C1C1E] text-[#F7F3EC] hover:bg-[#C9A96E] cursor-pointer"
                  : "bg-[#1C1C1E]/8 text-[#1C1C1E]/25 cursor-not-allowed"
              }`}
              aria-disabled={!canComplete}
            >
              {t.complete}
            </button>
          </div>
        ) : (
          /* ── Result Phase ── */
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-[#C9A96E] mb-2">
                {t.yourLook}
              </p>
              <h2 className="font-display text-3xl text-[#1C1C1E]">{t.lookReady}</h2>
            </div>

            {/* Combo images */}
            <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
              {selectedSilhouette?.completedImages.map((img, i) => (
                <div key={i} className="aspect-[3/4] overflow-hidden bg-[#E8E0D5]">
                  <img src={img} alt={`Look ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Selected items summary */}
            <div className="border border-[#C9A96E]/20 p-6 mb-6 max-w-sm mx-auto">
              {Object.entries(selections).map(([catId, product]) => {
                const cat = selectedSilhouette?.categories.find((c) => c.id === catId);
                const label = lang === "TR" ? cat?.labelTR : cat?.labelEN;
                const name = lang === "TR" ? product.nameTR : product.nameEN;
                return (
                  <div
                    key={catId}
                    className="flex items-center justify-between py-2.5 border-b border-[#C9A96E]/10 last:border-0"
                  >
                    <div>
                      <p className="font-body text-[9px] tracking-[0.2em] uppercase text-[#C9A96E] mb-0.5">{label}</p>
                      <p className="font-body text-xs text-[#1C1C1E]">{name}</p>
                    </div>
                    <p className="font-display text-base text-[#1C1C1E]">₺{product.price.toLocaleString()}</p>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-3">
                <p className="font-body text-xs tracking-[0.15em] uppercase text-[#1C1C1E]/60">{t.total}</p>
                <p className="font-display text-xl text-[#1C1C1E]">₺{totalPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border border-[#1C1C1E]/25 font-body text-xs tracking-[0.15em] uppercase text-[#1C1C1E]/60 hover:border-[#1C1C1E] hover:text-[#1C1C1E] transition-all duration-300"
              >
                <RotateCcw size={13} />
                {t.reset}
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1C1C1E] text-[#F7F3EC] font-body text-xs tracking-[0.15em] uppercase hover:bg-[#C9A96E] transition-all duration-300"
              >
                <ShoppingBag size={13} />
                {t.addToCart}
              </button>
            </div>
          </div>
        )}

        {/* View All Products Banner */}
        <div className="mt-20 border-t border-[#C9A96E]/20 pt-12">
          <Link href="/koleksiyonlar">
            <div className="group flex items-center justify-between px-8 py-6 bg-[#1C1C1E] hover:bg-[#C9A96E] transition-colors duration-500 cursor-pointer">
              <div>
                <p className="font-body text-[10px] tracking-[0.25em] uppercase text-white/50 mb-1">
                  {lang === "TR" ? "Tüm Koleksiyon" : "Full Collection"}
                </p>
                <p className="font-display text-2xl text-white">{t.viewAll}</p>
              </div>
              <ArrowRight size={24} className="text-white transition-transform duration-300 group-hover:translate-x-2" />
            </div>
          </Link>
        </div>
      </div>

      <Footer />

      {/* Silhouette Picker Modal */}
      {showSilhouettePicker && (
        <SilhouettePicker
          current={selectedSilhouette}
          onSelect={handleSelectSilhouette}
          onClose={() => setShowSilhouettePicker(false)}
          lang={lang}
        />
      )}

      {/* Product Modal */}
      {activeCategoryId && selectedSilhouette && (
        <ProductModal
          silhouette={selectedSilhouette}
          categoryId={activeCategoryId}
          selected={selections[activeCategoryId]?.id}
          onSelect={(product) => {
            handleSelectProduct(activeCategoryId, product);
            setActiveCategoryId(null);
          }}
          onClose={() => setActiveCategoryId(null)}
          lang={lang}
        />
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);  }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
