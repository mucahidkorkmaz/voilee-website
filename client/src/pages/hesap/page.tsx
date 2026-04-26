import { Link } from "wouter";
import {
  Package,
  Heart,
  MapPin,
  RotateCcw,
  Settings,
  ChevronRight,
  LogOut,
  MessageCircle,
} from "lucide-react";
import AccountLayout, { hesapUrls } from "./layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useLocation } from "wouter";
import { toast } from "sonner";

// ─── Translations ───────────────────────────────────────────────────────────────

const t = {
  TR: {
    overline: "Hesabım",
    welcome: "Hoşgeldiniz",
    subtitle:
      "Profilinizi, listelerinizi ve siparişlerinizi tek bir yerden yönetin.",
    member: "Voilée Üyesi",
    verified: "Doğrulanmış",
    quickAccess: "Kısayollar",
    logout: "Çıkış",
    loggedOut: "Çıkış yapıldı.",
    cards: {
      orders: {
        title: "Siparişlerim",
        mobileTitle: "Siparişlerim",
        desc: "Sipariş geçmişinizi görüntüleyin ve teslimat durumunu takip edin.",
        countOne: "sipariş",
        countMany: "sipariş",
      },
      returns: {
        title: "İadelerim",
        mobileTitle: "İade & Değişim",
        desc: "İade taleplerini başlatın ve mevcut iadelerinizi takip edin.",
      },
      addresses: {
        title: "Adreslerim",
        mobileTitle: "Adreslerim",
        desc: "Kayıtlı teslimat adreslerinizi yönetin.",
      },
      wishlist: {
        title: "Listem",
        mobileTitle: "Listem",
        desc: "Beğendiğiniz ürünleri listeleyin ve daha sonra sipariş edin.",
        countOne: "ürün",
        countMany: "ürün",
      },
      settings: {
        title: "Bilgilerim",
        mobileTitle: "Bilgilerim",
        desc: "Kişisel bilgilerinizi, KVKK tercihlerinizi ve şifrenizi yönetin.",
      },
    },
    styliste: {
      overline: "Özel Stiliste",
      question: "Bir parça için fikir ister misiniz?",
      cta: "WhatsApp",
      phone: "0850 000 00 00",
    },
  },
  EN: {
    overline: "My Account",
    welcome: "Welcome",
    subtitle: "Manage your profile, lists and orders from one place.",
    member: "Voilée Member",
    verified: "Verified",
    quickAccess: "Shortcuts",
    logout: "Sign Out",
    loggedOut: "Signed out.",
    cards: {
      orders: {
        title: "My Orders",
        mobileTitle: "My Orders",
        desc: "View your order history and track delivery status.",
        countOne: "order",
        countMany: "orders",
      },
      returns: {
        title: "My Returns",
        mobileTitle: "Returns & Exchange",
        desc: "Initiate return requests and track existing returns.",
      },
      addresses: {
        title: "My Addresses",
        mobileTitle: "My Addresses",
        desc: "Manage your saved delivery addresses.",
      },
      wishlist: {
        title: "My Wishlist",
        mobileTitle: "My Wishlist",
        desc: "Save the pieces you love and order them later.",
        countOne: "item",
        countMany: "items",
      },
      settings: {
        title: "My Details",
        mobileTitle: "My Details",
        desc: "Manage your personal info, privacy preferences and password.",
      },
    },
    styliste: {
      overline: "Personal Stylist",
      question: "Would you like advice on a piece?",
      cta: "WhatsApp",
      phone: "0850 000 00 00",
    },
  },
  AR: {
    overline: "حسابي",
    welcome: "أهلاً بك",
    subtitle: "أدر ملفك الشخصي وقوائمك وطلباتك من مكان واحد.",
    member: "عضو فوالييه",
    verified: "موثّق",
    quickAccess: "اختصارات",
    logout: "خروج",
    loggedOut: "تم تسجيل الخروج.",
    cards: {
      orders: {
        title: "طلباتي",
        mobileTitle: "طلباتي",
        desc: "اعرض سجل طلباتك وتابع حالة التوصيل.",
        countOne: "طلب",
        countMany: "طلبات",
      },
      returns: {
        title: "مرتجعاتي",
        mobileTitle: "الإرجاع والتبادل",
        desc: "ابدأ طلبات الإرجاع وتابع المرتجعات الحالية.",
      },
      addresses: {
        title: "عناويني",
        mobileTitle: "عناويني",
        desc: "أدر عناوين التوصيل المحفوظة.",
      },
      wishlist: {
        title: "قائمتي",
        mobileTitle: "قائمتي",
        desc: "احفظ القطع التي تحبها واطلبها لاحقاً.",
        countOne: "منتج",
        countMany: "منتجات",
      },
      settings: {
        title: "معلوماتي",
        mobileTitle: "معلوماتي",
        desc: "أدر بياناتك الشخصية وتفضيلات الخصوصية وكلمة المرور.",
      },
    },
    styliste: {
      overline: "المصمم الخاص",
      question: "هل تريد نصيحة حول قطعة ما؟",
      cta: "واتساب",
      phone: "0850 000 00 00",
    },
  },
};

// ─── Styliste Card ───────────────────────────────────────────────────────────────

function StyleisteCard({
  styliste,
  isRTL,
}: {
  styliste: (typeof t)["TR"]["styliste"];
  isRTL: boolean;
}) {
  return (
    <a
      href="https://wa.me/905000000000"
      target="_blank"
      rel="noopener noreferrer"
      className={`block border-l-2 border-[#C9A96E] bg-[#F7F3EC] p-5 group hover:bg-[#F0EBE1] transition-colors duration-300 ${
        isRTL ? "border-l-0 border-r-2" : ""
      }`}
    >
      <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">
        {styliste.overline}
      </p>
      <p className="font-display text-lg text-[#1C1C1E] italic leading-snug mb-4">
        {styliste.question}
      </p>
      <div
        className={`flex items-center justify-between ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <span className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/70">
          {styliste.cta} · {styliste.phone}
        </span>
        <ChevronRight
          size={14}
          className={`text-[#C9A96E] group-hover:translate-x-0.5 transition-transform ${
            isRTL ? "rotate-180 group-hover:-translate-x-0.5 group-hover:translate-x-0" : ""
          }`}
        />
      </div>
    </a>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function HesapPage() {
  const { lang, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const { favoritesCount } = useFavorites();
  const { ordersCount } = useOrders();
  const [, setLocation] = useLocation();
  const tx = t[lang];
  const u = hesapUrls[lang];

  if (!user) return null;

  const displayName = user.name || user.email || tx.member;
  const handleLogout = async () => {
    await logout();
    toast.success(tx.loggedOut);
    setLocation(u.home);
  };

  const mobileNavItems = [
    { key: "orders" as const, href: u.orders, Icon: Package },
    { key: "returns" as const, href: u.returns, Icon: RotateCcw },
    { key: "addresses" as const, href: u.addresses, Icon: MapPin },
    { key: "wishlist" as const, href: u.wishlist, Icon: Heart },
    { key: "settings" as const, href: u.settings, Icon: Settings },
  ];

  const cards = [
    {
      key: "orders" as const,
      href: u.orders,
      Icon: Package,
      countLabel:
        ordersCount > 0
          ? `${ordersCount} ${
              ordersCount === 1
                ? tx.cards.orders.countOne
                : tx.cards.orders.countMany
            }`
          : null,
    },
    {
      key: "returns" as const,
      href: u.returns,
      Icon: RotateCcw,
      countLabel: null,
    },
    {
      key: "addresses" as const,
      href: u.addresses,
      Icon: MapPin,
      countLabel: null,
    },
    {
      key: "wishlist" as const,
      href: u.wishlist,
      Icon: Heart,
      countLabel:
        favoritesCount > 0
          ? `${favoritesCount} ${
              favoritesCount === 1
                ? tx.cards.wishlist.countOne
                : tx.cards.wishlist.countMany
            }`
          : null,
    },
    {
      key: "settings" as const,
      href: u.settings,
      Icon: Settings,
      countLabel: null,
    },
  ];

  return (
    <AccountLayout>
      {/* ── Mobile layout (matches mockup) ── */}
      <div className="lg:hidden">
        {/* Header */}
        <div className="mb-6">
          <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-3">
            {tx.overline}
          </p>
          <h1 className="font-display text-[2rem] text-[#1C1C1E] italic leading-tight">
            {tx.welcome}, {displayName}.
          </h1>
        </div>

        {/* Nav list */}
        <div className="border-t border-[#1C1C1E]/10">
          {mobileNavItems.map(({ key, href }) => (
            <Link key={key} href={href}>
              <div
                className={`flex items-center justify-between py-4 border-b border-[#1C1C1E]/10 group ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <span className="font-body text-[11px] tracking-[0.25em] uppercase text-[#1C1C1E]">
                  {tx.cards[key].mobileTitle}
                </span>
                <ChevronRight
                  size={14}
                  className={`text-[#C9A96E] transition-transform group-hover:translate-x-0.5 ${
                    isRTL
                      ? "rotate-180 group-hover:translate-x-0 group-hover:-translate-x-0.5"
                      : ""
                  }`}
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Styliste section */}
        <div className="mt-6 mb-2">
          <StyleisteCard styliste={tx.styliste} isRTL={isRTL} />
        </div>

        {/* Logout */}
        <div className="border-t border-[#1C1C1E]/10 mt-4">
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center justify-between py-4 group ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <span className="font-body text-[11px] tracking-[0.25em] uppercase text-[#1C1C1E]/50 group-hover:text-red-500 transition-colors">
              {tx.logout}
            </span>
            <ChevronRight
              size={14}
              className={`text-[#1C1C1E]/30 group-hover:text-red-400 transition-all group-hover:translate-x-0.5 ${
                isRTL
                  ? "rotate-180 group-hover:translate-x-0 group-hover:-translate-x-0.5"
                  : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── Desktop layout (card grid) ── */}
      <div className="hidden lg:block">
        {/* Header */}
        <div className="mb-10 xl:mb-12">
          <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
            {tx.overline}
          </p>
          <div>
            <h1 className="font-display text-3xl xl:text-4xl text-[#1C1C1E] leading-tight">
              {tx.welcome}, {displayName}
            </h1>
            <p className="font-body text-sm text-[#1C1C1E]/55 mt-1.5 max-w-lg">
              {tx.subtitle}
            </p>
          </div>
        </div>

        {/* Shortcut cards */}
        <section>
          <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/35 mb-4">
            {tx.quickAccess}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {cards.map(({ key, href, Icon, countLabel }) => (
              <Link
                key={key}
                href={href}
                className="group bg-white border border-[#C9A96E]/15 hover:border-[#C9A96E]/50 transition-all duration-300 p-6 xl:p-7 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-full bg-[#F7F3EC] border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] group-hover:bg-[#C9A96E] group-hover:text-white transition-colors duration-300">
                    <Icon size={17} strokeWidth={1.6} />
                  </div>
                  {countLabel && (
                    <span className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/40 mt-1.5">
                      {countLabel}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl text-[#1C1C1E] mb-1.5 leading-snug">
                  {tx.cards[key].title}
                </h3>
                <p className="font-body text-sm text-[#1C1C1E]/55 leading-relaxed flex-1">
                  {tx.cards[key].desc}
                </p>
                <div className="mt-5 flex items-center justify-end">
                  <ChevronRight
                    size={15}
                    className={`text-[#1C1C1E]/35 group-hover:text-[#C9A96E] transition-all duration-300 ${
                      isRTL
                        ? "rotate-180 group-hover:-translate-x-1"
                        : "group-hover:translate-x-1"
                    }`}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </AccountLayout>
  );
}
