import { useEffect, useRef } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { sitePaths } from "@/lib/sitePaths";

const t = {
  TR: {
    title: "Sepetim",
    empty: "Sepetiniz boş",
    emptyDesc: "Beğendiğiniz ürünleri sepete ekleyin.",
    continueShopping: "Alışverişe Devam Et",
    subtotal: "Ara Toplam",
    shipping: "Kargo",
    shippingFree: "Ücretsiz",
    shippingNote: "150₺ üzeri siparişlerde ücretsiz kargo",
    total: "Toplam",
    checkout: "Ödemeye Git",
    remove: "Kaldır",
    items: "ürün",
  },
  EN: {
    title: "My Cart",
    empty: "Your cart is empty",
    emptyDesc: "Add items you love to your cart.",
    continueShopping: "Continue Shopping",
    subtotal: "Subtotal",
    shipping: "Shipping",
    shippingFree: "Free",
    shippingNote: "Free shipping on orders over ₺150",
    total: "Total",
    checkout: "Proceed to Checkout",
    remove: "Remove",
    items: "items",
  },
  AR: {
    title: "سلة التسوق",
    empty: "سلتك فارغة",
    emptyDesc: "أضف العناصر التي تحبها إلى سلتك.",
    continueShopping: "مواصلة التسوق",
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    shippingFree: "مجاني",
    shippingNote: "شحن مجاني للطلبات فوق ₺150",
    total: "المجموع",
    checkout: "الانتقال للدفع",
    remove: "إزالة",
    items: "عناصر",
  },
};

const checkoutPath = sitePaths.checkout;

export default function CartDrawer() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, isCartOpen, closeCart } = useCart();
  const { lang, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const tx = t[lang];

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const handleCheckout = () => {
    closeCart();
    setLocation(checkoutPath[lang]);
  };

  const isFreeShipping = cartTotal >= 150;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={closeCart}
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={`fixed top-0 bottom-0 z-[70] w-full sm:w-[420px] bg-[#F7F3EC] shadow-2xl flex flex-col transition-transform duration-500 ease-in-out ${
          isRTL ? "left-0" : "right-0"
        } ${
          isCartOpen
            ? "translate-x-0"
            : isRTL
            ? "-translate-x-full"
            : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#C9A96E]/20">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-[#C9A96E]" />
            <h2 className="font-display text-xl text-[#1C1C1E]">{tx.title}</h2>
            {cartItems.length > 0 && (
              <span className="font-body text-xs text-[#1C1C1E]/50">
                ({cartItems.length} {tx.items})
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#C9A96E]/10 text-[#1C1C1E]/60 hover:text-[#1C1C1E] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
              <ShoppingBag size={28} className="text-[#C9A96E]/60" />
            </div>
            <div>
              <p className="font-display text-xl text-[#1C1C1E] mb-2">{tx.empty}</p>
              <p className="font-body text-sm text-[#1C1C1E]/50">{tx.emptyDesc}</p>
            </div>
            <button
              onClick={closeCart}
              className="mt-2 font-body text-xs tracking-[0.15em] uppercase text-[#C9A96E] border border-[#C9A96E] px-6 py-2.5 hover:bg-[#C9A96E] hover:text-white transition-colors duration-300"
            >
              {tx.continueShopping}
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 px-6 space-y-4">
              {cartItems.map((item) => {
                const name = lang === "TR" ? item.nameTR : lang === "EN" ? item.nameEN : item.nameAR;
                return (
                  <div
                    key={item.lineId}
                    className="flex gap-4 py-4 border-b border-[#C9A96E]/10 last:border-0"
                  >
                    {/* Image */}
                    <div className="w-20 h-24 bg-[#E8E0D5] flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={24} className="text-[#C9A96E]/30" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-[11px] tracking-[0.15em] uppercase text-[#C9A96E] mb-1">
                        {item.collection}
                      </p>
                      <p className="font-display text-sm text-[#1C1C1E] leading-snug mb-1 truncate">
                        {name}
                      </p>
                      <p className="font-body text-sm font-semibold text-[#1C1C1E] mb-3">
                        ₺{item.price.toLocaleString("tr-TR")}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                          className="w-6 h-6 border border-[#C9A96E]/30 flex items-center justify-center text-[#1C1C1E]/60 hover:border-[#C9A96E] hover:text-[#1C1C1E] transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="font-body text-sm text-[#1C1C1E] w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                          className="w-6 h-6 border border-[#C9A96E]/30 flex items-center justify-center text-[#1C1C1E]/60 hover:border-[#C9A96E] hover:text-[#1C1C1E] transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.lineId)}
                          className="ml-auto text-[#1C1C1E]/30 hover:text-red-400 transition-colors"
                          aria-label={tx.remove}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-[#C9A96E]/20 px-6 py-6 space-y-3 bg-[#F7F3EC]">
              <div className="flex items-center justify-between font-body text-sm text-[#1C1C1E]/70">
                <span>{tx.subtotal}</span>
                <span>₺{cartTotal.toLocaleString("tr-TR")}</span>
              </div>
              <div className="flex items-center justify-between font-body text-sm text-[#1C1C1E]/70">
                <span>{tx.shipping}</span>
                <span className={isFreeShipping ? "text-emerald-600 font-medium" : ""}>
                  {isFreeShipping ? tx.shippingFree : "₺29,90"}
                </span>
              </div>
              {!isFreeShipping && (
                <p className="font-body text-[10px] text-[#C9A96E] tracking-wide">
                  {tx.shippingNote}
                </p>
              )}
              <div className="flex items-center justify-between font-display text-base text-[#1C1C1E] pt-2 border-t border-[#C9A96E]/20">
                <span>{tx.total}</span>
                <span>
                  ₺{(cartTotal + (isFreeShipping ? 0 : 29.9)).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-2 bg-[#1C1C1E] text-white font-body text-xs tracking-[0.2em] uppercase py-4 flex items-center justify-center gap-3 hover:bg-[#C9A96E] transition-colors duration-300 group"
              >
                {tx.checkout}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
