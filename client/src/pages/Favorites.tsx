import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Heart, ChevronLeft, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const t = {
  TR: {
    overline: "Favorilerim",
    title: "Favori Parçalarım",
    subtitle: "Beğendiğiniz ürünler burada sizi bekliyor.",
    empty: "Henüz favori bir ürün eklemediniz.",
    emptyDesc: "Beğendiğiniz parçaları kalp simgesine dokunarak buraya ekleyebilirsiniz.",
    explore: "Koleksiyonları Keşfet",
    backAccount: "Hesabıma Dön",
    addToCart: "Sepete Ekle",
    remove: "Favorilerden Kaldır",
    removed: "Favorilerden kaldırıldı.",
    addedToCart: "Sepete eklendi.",
    countOne: "ürün",
    countMany: "ürün",
    loginRequired: "Bu sayfayı görüntülemek için giriş yapmanız gerekir.",
  },
  EN: {
    overline: "My Favorites",
    title: "My Favorite Pieces",
    subtitle: "The items you loved are waiting for you here.",
    empty: "You haven't added any favorites yet.",
    emptyDesc: "Tap the heart icon on any piece you love to save it here.",
    explore: "Explore Collections",
    backAccount: "Back to Account",
    addToCart: "Add to Cart",
    remove: "Remove from Favorites",
    removed: "Removed from favorites.",
    addedToCart: "Added to cart.",
    countOne: "item",
    countMany: "items",
    loginRequired: "Please sign in to view this page.",
  },
  AR: {
    overline: "مفضلاتي",
    title: "قطعي المفضلة",
    subtitle: "العناصر التي أعجبتك تنتظرك هنا.",
    empty: "لم تقم بإضافة أي مفضلة بعد.",
    emptyDesc: "اضغط على رمز القلب على أي قطعة تحبها لحفظها هنا.",
    explore: "استكشف المجموعات",
    backAccount: "العودة إلى الحساب",
    addToCart: "أضف إلى السلة",
    remove: "إزالة من المفضلة",
    removed: "تمت الإزالة من المفضلة.",
    addedToCart: "أضيف إلى السلة.",
    countOne: "منتج",
    countMany: "منتجات",
    loginRequired: "يرجى تسجيل الدخول لعرض هذه الصفحة.",
  },
};

const accountLinks = { TR: "/hesabim", EN: "/en/account", AR: "/ar/account" };
const collectionsLinks = { TR: "/koleksiyonlar", EN: "/en/collections", AR: "/ar/collections" };
const productPathPrefix = { TR: "/urun", EN: "/en/product", AR: "/ar/product" };
const loginLinks = { TR: "/giris", EN: "/en/login", AR: "/ar/login" };

export default function Favorites() {
  const { lang, isRTL } = useLanguage();
  const { isAuthenticated, isLoading } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const { addToCart, openCart } = useCart();
  const [, setLocation] = useLocation();
  const tx = t[lang];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirect = encodeURIComponent(
        lang === "TR" ? "/favorilerim" : lang === "EN" ? "/en/favorites" : "/ar/favorites"
      );
      setLocation(`${loginLinks[lang]}?redirect=${redirect}`);
    }
  }, [isLoading, isAuthenticated, lang, setLocation]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-24">
          <p className="font-body text-xs text-[#1C1C1E]/40 tracking-[0.2em] uppercase animate-pulse">
            {isLoading ? "..." : tx.loginRequired}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = (id: number) => {
    const item = favorites.find((f) => f.id === id);
    if (!item) return;
    addToCart({
      id: item.id,
      nameTR: item.name,
      nameEN: item.name,
      nameAR: item.name,
      price: parseFloat(item.price),
      quantity: 1,
      collection: item.collection ?? "",
      imageUrl: item.imageUrl ?? undefined,
    });
    toast.success(tx.addedToCart);
    openCart();
  };

  const handleRemove = (id: number) => {
    removeFavorite(id);
    toast(tx.removed);
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href={accountLinks[lang]}
            className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/50 hover:text-[#C9A96E] transition-colors mb-8"
          >
            <ChevronLeft size={14} className={isRTL ? "rotate-180" : ""} />
            {tx.backAccount}
          </Link>

          {/* Header */}
          <div className="mb-10 lg:mb-14 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-3">
                {tx.overline}
              </p>
              <h1 className="font-display text-3xl lg:text-4xl text-[#1C1C1E] leading-tight">
                {tx.title}
              </h1>
              <p className="font-body text-sm text-[#1C1C1E]/60 mt-3 max-w-xl">
                {tx.subtitle}
              </p>
            </div>
            {favorites.length > 0 && (
              <span className="font-body text-xs tracking-[0.15em] uppercase text-[#1C1C1E]/40">
                {favorites.length} {favorites.length === 1 ? tx.countOne : tx.countMany}
              </span>
            )}
          </div>

          {/* Empty state */}
          {favorites.length === 0 ? (
            <div className="bg-white border border-[#C9A96E]/15 py-20 px-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#F7F3EC] border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] mb-6">
                <Heart size={22} strokeWidth={1.5} />
              </div>
              <h2 className="font-display text-2xl text-[#1C1C1E] mb-3">{tx.empty}</h2>
              <p className="font-body text-sm text-[#1C1C1E]/55 max-w-md mb-8">{tx.emptyDesc}</p>
              <Link
                href={collectionsLinks[lang]}
                className="font-body text-[11px] tracking-[0.25em] uppercase bg-[#1C1C1E] text-[#F7F3EC] px-8 py-3.5 hover:bg-[#C9A96E] transition-colors duration-300"
              >
                {tx.explore}
              </Link>
            </div>
          ) : (
            /* Grid */
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {favorites.map((item) => {
                const detailHref = `${productPathPrefix[lang]}/${item.slug}`;
                const price = parseFloat(item.price);
                return (
                  <div key={item.id} className="group">
                    <div className="relative overflow-hidden mb-4">
                      <Link href={detailHref} className="block">
                        <div className="aspect-[3/4] bg-[#E8E0D5]">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#C9A96E]/30">
                              <ShoppingBag size={28} />
                            </div>
                          )}
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        aria-label={tx.remove}
                        title={tx.remove}
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/95 text-[#1C1C1E]/50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item.id)}
                          className="w-full py-2.5 font-body text-xs tracking-[0.15em] uppercase bg-[#1C1C1E] text-[#F7F3EC] hover:bg-[#C9A96E] transition-colors duration-300"
                        >
                          {tx.addToCart}
                        </button>
                      </div>
                    </div>
                    <Link href={detailHref} className="block">
                      {item.collection && (
                        <p className="font-body text-[10px] tracking-[0.15em] uppercase text-[#C9A96E] mb-1">
                          {item.collection}
                        </p>
                      )}
                      <h3 className="font-body text-sm text-[#1C1C1E] mb-1 hover:text-[#C9A96E] transition-colors">
                        {item.name}
                      </h3>
                      <p className="font-display text-lg text-[#1C1C1E]">
                        ₺{price.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
