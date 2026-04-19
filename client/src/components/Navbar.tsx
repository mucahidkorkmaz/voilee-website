import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ShoppingBag, Search, Heart, User as UserIcon, LogOut, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_logo_2e68b438.webp";

const getNavLinks = (lang: "TR" | "EN" | "AR") => {
  const baseLinks = {
    TR: [
      { href: "/olustur", label: "Silüet Oluştur" },
      { href: "/hakkimizda", label: "Hakkımızda" },
      { href: "/hikayemiz", label: "Hikayemiz" },
      { href: "/surdurulebilirlik", label: "Sürdürülebilirlik" },
      { href: "/journal", label: "Journal" },
      { href: "/iletisim", label: "İletişim" },
    ],
    EN: [
      { href: "/en/builder", label: "Silhouette Builder" },
      { href: "/en/about", label: "About" },
      { href: "/en/story", label: "Our Story" },
      { href: "/en/sustainability", label: "Sustainability" },
      { href: "/en/journal", label: "Journal" },
      { href: "/en/contact", label: "Contact" },
    ],
    AR: [
      { href: "/ar/builder", label: "منشئ الصورة الظلية" },
      { href: "/ar/about", label: "من نحن" },
      { href: "/ar/story", label: "قصتنا" },
      { href: "/ar/sustainability", label: "الاستدامة" },
      { href: "/ar/journal", label: "مجلة" },
      { href: "/ar/contact", label: "اتصل بنا" },
    ],
  };
  return baseLinks[lang];
};

export default function Navbar() {
  const { lang, setLang, isRTL } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/" || location === "/en" || location === "/ar";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isTransparent = isHome && !isScrolled && !mobileOpen;
  const navLinks = getNavLinks(lang);

  const handleLanguageChange = (newLang: "TR" | "EN" | "AR") => {
    setLang(newLang);
    const pathPrefix = newLang === "TR" ? "" : `/${newLang.toLowerCase()}`;
    window.location.href = pathPrefix + "/";
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent
            ? "bg-transparent"
            : "bg-[#F7F3EC]/95 backdrop-blur-sm border-b border-[#C9A96E]/20"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left: Nav Links (Desktop) */}
            <div className={`hidden lg:flex items-center ${isRTL ? "flex-row-reverse" : ""} gap-8`}>
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-body text-xs tracking-[0.12em] uppercase transition-colors duration-300 ${
                    isTransparent
                      ? "text-white/90 hover:text-white"
                      : "text-[#1C1C1E]/70 hover:text-[#1C1C1E]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Center: Logo */}
            <div className="flex-1 lg:flex-none flex justify-center lg:justify-center">
              <Link href={lang === "TR" ? "/" : `/${lang.toLowerCase()}`}>
                <img
                  src={LOGO_URL}
                  alt="VOILÉE"
                  className={`h-8 lg:h-10 w-auto object-contain transition-all duration-300 ${
                    isTransparent ? "brightness-0 invert" : ""
                  }`}
                />
              </Link>
            </div>

            {/* Right: Nav Links + Icons (Desktop) */}
            <div className={`hidden lg:flex items-center ${isRTL ? "flex-row-reverse" : ""} gap-8`}>
              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-body text-xs tracking-[0.12em] uppercase transition-colors duration-300 ${
                    isTransparent
                      ? "text-white/90 hover:text-white"
                      : "text-[#1C1C1E]/70 hover:text-[#1C1C1E]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className={`flex items-center ${isRTL ? "flex-row-reverse" : ""} gap-4 ml-4 pl-4 border-l border-current/20`}>
                <div className="flex items-center gap-2">
                  {["TR", "EN", "AR"].map((l) => (
                    <button
                      key={l}
                      onClick={() => handleLanguageChange(l as "TR" | "EN" | "AR")}
                      className={`font-body text-xs tracking-[0.1em] uppercase transition-colors duration-300 ${
                        lang === l
                          ? isTransparent
                            ? "text-white font-semibold"
                            : "text-[#C9A96E] font-semibold"
                          : isTransparent
                          ? "text-white/60 hover:text-white"
                          : "text-[#1C1C1E]/40 hover:text-[#1C1C1E]/60"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <button className={`transition-colors duration-300 ${isTransparent ? "text-white/80 hover:text-white" : "text-[#1C1C1E]/60 hover:text-[#1C1C1E]"}`}>
                  <Search size={16} />
                </button>
                <FavoritesIcon isTransparent={isTransparent} />
                <UserMenu isTransparent={isTransparent} />
                <CartBadge isTransparent={isTransparent} />
              </div>
            </div>

            {/* Mobile: Icons + Hamburger */}
            <div className={`flex lg:hidden items-center ${isRTL ? "flex-row-reverse" : ""} gap-3`}>
              <div className="flex items-center gap-1">
                {["TR", "EN", "AR"].map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLanguageChange(l as "TR" | "EN" | "AR")}
                    className={`font-body text-xs tracking-[0.1em] uppercase px-2 py-1 transition-colors duration-300 ${
                      lang === l
                        ? isTransparent
                          ? "text-white font-semibold"
                          : "text-[#C9A96E] font-semibold"
                        : isTransparent
                        ? "text-white/60"
                        : "text-[#1C1C1E]/40"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <UserMenu isTransparent={isTransparent} mobile />
              <CartBadge isTransparent={isTransparent} mobile />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`p-1 ${isTransparent ? "text-white" : "text-[#1C1C1E]"}`}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-[#F7F3EC] transition-transform duration-500 ease-in-out ${
          mobileOpen ? "translate-x-0" : isRTL ? "-translate-x-full" : "translate-x-full"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className={`flex flex-col h-full pt-20 pb-8 px-8 ${isRTL ? "text-right" : ""}`}>
          <nav className="flex flex-col gap-1 flex-1">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-display text-4xl text-[#1C1C1E] py-3 border-b border-[#C9A96E]/20 hover:text-[#C9A96E] transition-colors duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
            <p className="font-body text-xs text-[#1C1C1E]/40 tracking-[0.15em] uppercase mb-4">
              {lang === "TR" ? "Bize Ulaşın" : lang === "EN" ? "Get in Touch" : "اتصل بنا"}
            </p>
            <a href="mailto:info@voilee.com.tr" className="font-body text-sm text-[#1C1C1E]/70">
              info@voilee.com.tr
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function CartBadge({ isTransparent, mobile = false }: { isTransparent: boolean; mobile?: boolean }) {
  const { cartCount, openCart } = useCart();
  return (
    <button
      onClick={openCart}
      className={`relative transition-colors duration-300 ${isTransparent ? "text-white/80 hover:text-white" : "text-[#1C1C1E]/60 hover:text-[#1C1C1E]"}`}
    >
      <ShoppingBag size={mobile ? 18 : 16} />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#C9A96E] rounded-full text-[9px] flex items-center justify-center text-white font-medium">
          {cartCount > 9 ? '9+' : cartCount}
        </span>
      )}
    </button>
  );
}

function FavoritesIcon({ isTransparent, mobile = false }: { isTransparent: boolean; mobile?: boolean }) {
  const { lang } = useLanguage();
  const { favoritesCount } = useFavorites();
  const href = lang === "TR" ? "/favorilerim" : lang === "EN" ? "/en/favorites" : "/ar/favorites";
  const label = lang === "TR" ? "Favorilerim" : lang === "EN" ? "My Favorites" : "مفضلاتي";

  return (
    <Link
      href={href}
      aria-label={label}
      className={`relative transition-colors duration-300 ${
        isTransparent
          ? "text-white/80 hover:text-white"
          : "text-[#1C1C1E]/60 hover:text-[#1C1C1E]"
      }`}
    >
      <Heart size={mobile ? 18 : 16} />
      {favoritesCount > 0 && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#C9A96E] rounded-full text-[9px] flex items-center justify-center text-white font-medium">
          {favoritesCount > 9 ? "9+" : favoritesCount}
        </span>
      )}
    </Link>
  );
}

function UserMenu({ isTransparent, mobile = false }: { isTransparent: boolean; mobile?: boolean }) {
  const { lang, isRTL } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const loginHref = lang === "TR" ? "/giris" : lang === "EN" ? "/en/login" : "/ar/login";
  const accountHref = lang === "TR" ? "/hesabim" : lang === "EN" ? "/en/account" : "/ar/account";
  const favoritesHref = lang === "TR" ? "/favorilerim" : lang === "EN" ? "/en/favorites" : "/ar/favorites";
  const ordersHref = lang === "TR" ? "/siparislerim" : lang === "EN" ? "/en/orders" : "/ar/orders";

  const labels = {
    TR: {
      greeting: "Merhaba",
      account: "Hesabım",
      favorites: "Favorilerim",
      orders: "Siparişlerim",
      logout: "Çıkış Yap",
      signIn: "Giriş",
    },
    EN: {
      greeting: "Hi",
      account: "My Account",
      favorites: "My Favorites",
      orders: "My Orders",
      logout: "Sign Out",
      signIn: "Sign In",
    },
    AR: {
      greeting: "مرحباً",
      account: "حسابي",
      favorites: "مفضلاتي",
      orders: "طلباتي",
      logout: "تسجيل الخروج",
      signIn: "دخول",
    },
  }[lang];

  if (!isAuthenticated) {
    return (
      <Link
        href={loginHref}
        className={`transition-colors duration-300 ${
          isTransparent
            ? "text-white/80 hover:text-white"
            : "text-[#1C1C1E]/60 hover:text-[#1C1C1E]"
        }`}
        aria-label={labels.signIn}
      >
        <UserIcon size={mobile ? 18 : 16} />
      </Link>
    );
  }

  const shortcuts = [
    { href: accountHref, label: labels.account, Icon: UserIcon },
    { href: favoritesHref, label: labels.favorites, Icon: Heart },
    { href: ordersHref, label: labels.orders, Icon: Package },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative transition-colors duration-300 ${
          isTransparent
            ? "text-white/80 hover:text-white"
            : "text-[#1C1C1E]/60 hover:text-[#1C1C1E]"
        }`}
        aria-label="account menu"
      >
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#C9A96E] rounded-full" />
        <UserIcon size={mobile ? 18 : 16} />
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-3 w-60 bg-[#F7F3EC] border border-[#C9A96E]/20 shadow-lg ${
            isRTL ? "left-0" : "right-0"
          }`}
        >
          <div className="px-4 py-3 border-b border-[#C9A96E]/20">
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#C9A96E]">
              {labels.greeting}
            </p>
            <p className="font-display text-base text-[#1C1C1E] mt-0.5 truncate">
              {user?.name || user?.email}
            </p>
          </div>
          {shortcuts.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 font-body text-xs tracking-[0.1em] uppercase text-[#1C1C1E]/70 hover:text-[#1C1C1E] hover:bg-[#E8E0D5]/40 transition-colors"
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await logout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 font-body text-xs tracking-[0.1em] uppercase text-[#1C1C1E]/70 hover:text-[#1C1C1E] hover:bg-[#E8E0D5]/40 transition-colors border-t border-[#C9A96E]/15"
          >
            <LogOut size={14} />
            {labels.logout}
          </button>
        </div>
      )}
    </div>
  );
}
