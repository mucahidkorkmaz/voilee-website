import { Link } from "wouter";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import AccountLayout, { hesapUrls } from "../layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

// ─── Translations ───────────────────────────────────────────────────────────────

const t = {
  TR: {
    overline: "Listem",
    title: "Favori Parçalarım",
    subtitle: "Beğendiğiniz ürünler burada sizi bekliyor.",
    empty: "Henüz listeye ürün eklemediniz.",
    emptyDesc:
      "Beğendiğiniz parçaları kalp simgesine dokunarak buraya ekleyebilirsiniz.",
    explore: "Koleksiyonları Keşfet",
    addToCart: "Sepete Ekle",
    remove: "Listeden Kaldır",
    removed: "Listeden kaldırıldı.",
    addedToCart: "Sepete eklendi.",
    countOne: "ürün",
    countMany: "ürün",
  },
  EN: {
    overline: "Wishlist",
    title: "My Favorite Pieces",
    subtitle: "The items you loved are waiting for you here.",
    empty: "You haven't added any items yet.",
    emptyDesc: "Tap the heart icon on any piece you love to save it here.",
    explore: "Explore Collections",
    addToCart: "Add to Cart",
    remove: "Remove",
    removed: "Removed from wishlist.",
    addedToCart: "Added to cart.",
    countOne: "item",
    countMany: "items",
  },
  AR: {
    overline: "قائمتي",
    title: "قطعي المفضلة",
    subtitle: "العناصر التي أعجبتك تنتظرك هنا.",
    empty: "لم تقم بإضافة أي عنصر بعد.",
    emptyDesc: "اضغط على رمز القلب على أي قطعة تحبها لحفظها هنا.",
    explore: "استكشف المجموعات",
    addToCart: "أضف إلى السلة",
    remove: "إزالة",
    removed: "تمت الإزالة من القائمة.",
    addedToCart: "أضيف إلى السلة.",
    countOne: "منتج",
    countMany: "منتجات",
  },
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function ListePage() {
  const { lang, isRTL } = useLanguage();
  const { favorites, removeFavorite } = useFavorites();
  const { addToCart, openCart } = useCart();
  const tx = t[lang];
  const u = hesapUrls[lang];

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
    <AccountLayout>
      {/* Header */}
      <div className="mb-8 lg:mb-10 flex items-end justify-between gap-6 flex-wrap">
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
            {favorites.length}{" "}
            {favorites.length === 1 ? tx.countOne : tx.countMany}
          </span>
        )}
      </div>

      {/* Empty state */}
      {favorites.length === 0 ? (
        <div className="bg-white border border-[#C9A96E]/15 py-20 px-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#F7F3EC] border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] mb-6">
            <Heart size={22} strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-2xl text-[#1C1C1E] mb-3">
            {tx.empty}
          </h2>
          <p className="font-body text-sm text-[#1C1C1E]/55 max-w-md mb-8">
            {tx.emptyDesc}
          </p>
          <Link
            href={u.koleksiyonlar}
            className="font-body text-[11px] tracking-[0.25em] uppercase bg-[#1C1C1E] text-[#F7F3EC] px-8 py-3.5 hover:bg-[#C9A96E] transition-colors duration-300"
          >
            {tx.explore}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
          {favorites.map((item) => {
            const detailHref = u.urun(item.slug);
            const price = parseFloat(item.price);
            return (
              <div key={item.id} className="group">
                <div className="relative overflow-hidden mb-3">
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
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    aria-label={tx.remove}
                    title={tx.remove}
                    className={`absolute top-2.5 w-8 h-8 flex items-center justify-center bg-white/95 text-[#1C1C1E]/50 hover:text-red-500 transition-colors ${
                      isRTL ? "left-2.5" : "right-2.5"
                    }`}
                  >
                    <Trash2 size={13} />
                  </button>

                  {/* Add to cart on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
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
                  <h3 className="font-body text-sm text-[#1C1C1E] mb-1 hover:text-[#C9A96E] transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="font-display text-base text-[#1C1C1E]">
                    ₺
                    {price.toLocaleString("tr-TR", {
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
    </AccountLayout>
  );
}
