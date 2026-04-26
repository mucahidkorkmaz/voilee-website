import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ShoppingBag, Heart, User as UserIcon, LogOut, Package, ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { sitePaths } from "@/lib/sitePaths";

type StoreSettingsPublic = { siteLogoUrl?: string | null; logoUrl?: string | null };

const getNavLinks = (lang: "TR" | "EN" | "AR") => {
  const c = sitePaths.silhouettes[lang];
  const lb = sitePaths.lookbook[lang];
  const j = sitePaths.journal[lang];
  const ct = sitePaths.contact[lang];
  const baseLinks = {
    TR: [
      { href: c, label: "Silüet" },
      { href: lb, label: "Lookbook" },
      { href: j, label: "Journal" },
      { href: ct, label: "İletişim" },
    ],
    EN: [
      { href: c, label: "Silhouette" },
      { href: lb, label: "Lookbook" },
      { href: j, label: "Journal" },
      { href: ct, label: "Contact" },
    ],
    AR: [
      { href: c, label: "الصورة الظلية" },
      { href: lb, label: "Lookbook" },
      { href: j, label: "مجلة" },
      { href: ct, label: "اتصل بنا" },
    ],
  };
  return baseLinks[lang];
};

// Desktop sol: ilk 3 link (Silüet, Lookbook, Journal)
// Desktop sağ: son 1 link (İletişim) + Hesabım + Sepet + Dil
const LEFT_LINK_COUNT = 3;

export default function Navbar() {
  const { lang, setLang, isRTL } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const [siteSettings, setSiteSettings] = useState<StoreSettingsPublic | null>(null);
  const [location] = useLocation();
  const isHome =
    location === "/tr" || location === "/en" || location === "/ar";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/v1/store-settings")
      .then(r => r.json())
      .then(setSiteSettings)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    if (langDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langDropdownOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    if (isLangSwitch.current) {
      isLangSwitch.current = false;
      return;
    }
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);

  const isTransparent = isHome && !isScrolled && !mobileOpen;
  const navLinks = getNavLinks(lang);
  const logoSrc =
    siteSettings?.siteLogoUrl || siteSettings?.logoUrl || "/fallback-logo.png";

  const [, setLocationNav] = useLocation();
  const isLangSwitch = useRef(false);

  const handleLanguageChange = (newLang: "TR" | "EN" | "AR") => {
    isLangSwitch.current = true;
    setLang(newLang);
    const prefix = newLang === "TR" ? "tr" : newLang === "EN" ? "en" : "ar";
    const withoutPrefix = location.replace(/^\/(tr|en|ar)(?=\/|$)/, "");
    const dest =
      withoutPrefix === "" ? `/${prefix}` : `/${prefix}${withoutPrefix}`;
    setLocationNav(dest);
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
          {/* Desktop: 3-column grid — left and right are equal 1fr so logo is always truly centered */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] items-center h-20">
            {/* Col 1: Left Nav Links */}
            <div className="flex items-center gap-8">
              {navLinks.slice(0, LEFT_LINK_COUNT).map((link) => (
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

            {/* Col 2: Logo (auto width, centered by grid) */}
            <div className="flex justify-center">
              <Link href={sitePaths.home[lang]}>
                <img
                  src={logoSrc}
                  alt="VOILÉE"
                  className={`h-8 lg:h-10 w-auto object-contain transition-all duration-300 ${
                    isTransparent ? "brightness-0 invert" : ""
                  }`}
                />
              </Link>
            </div>

            {/* Col 3: Right Nav Links + Icons */}
            <div className="flex items-center justify-end gap-8">
              {navLinks.slice(LEFT_LINK_COUNT).map((link) => (
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
              <UserMenu isTransparent={isTransparent} />
              <CartBadge isTransparent={isTransparent} />
              {/* Pipe | Dil */}
              <div className="flex items-center gap-4 ms-4 ps-4 border-s border-current/20">
                <div ref={langDropdownRef} className="relative">
                  <button
                    onClick={() => setLangDropdownOpen((v) => !v)}
                    className={`flex items-center gap-1 font-body text-xs tracking-[0.1em] uppercase transition-colors duration-300 ${
                      isTransparent
                        ? "text-white/90 hover:text-white"
                        : "text-[#1C1C1E]/70 hover:text-[#1C1C1E]"
                    }`}
                  >
                    {lang}
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${langDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {langDropdownOpen && (
                    <div className={`absolute z-50 mt-2 py-1 min-w-[60px] bg-[#F7F3EC] border border-[#C9A96E]/20 shadow-lg ${isRTL ? "left-0" : "right-0"}`}>
                      {(["TR", "EN", "AR"] as const).filter((l) => l !== lang).map((l) => (
                        <button
                          key={l}
                          onClick={() => {
                            setLangDropdownOpen(false);
                            handleLanguageChange(l);
                          }}
                          className="w-full text-left px-3 py-2 font-body text-xs tracking-[0.1em] uppercase text-[#1C1C1E]/60 hover:text-[#1C1C1E] hover:bg-[#E8E0D5]/40 transition-colors"
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Hamburger | Logo | Cart */}
          <div className="flex lg:hidden items-center justify-between w-full h-16">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-1 ${isTransparent ? "text-white" : "text-[#1C1C1E]"}`}
              aria-label="Menü"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link href={sitePaths.home[lang]}>
              <img
                src={logoSrc}
                alt="VOILÉE"
                className={`h-7 w-auto object-contain transition-all duration-300 ${
                  isTransparent ? "brightness-0 invert" : ""
                }`}
              />
            </Link>

            <CartBadge isTransparent={isTransparent} mobile />
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
          {/* Nav links */}
          <nav className="flex flex-col gap-1">
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

          {/* Bottom: Account (left) + Language (right) */}
          <div className="mt-auto flex items-end justify-between gap-4">
            <MobileAccountRow lang={lang} onClose={() => setMobileOpen(false)} />
            <MobileLangRow lang={lang} onSelect={handleLanguageChange} />
          </div>
        </div>
      </div>
    </>
  );
}

function CartBadge({ isTransparent, mobile = false }: { isTransparent: boolean; mobile?: boolean }) {
  const { cartCount, openCart } = useCart();
  const { lang } = useLanguage();
  const cartLabel = lang === "TR" ? "Sepet" : lang === "EN" ? "Cart" : "السلة";

  if (mobile) {
    return (
      <button
        onClick={openCart}
        className={`relative transition-colors duration-300 ${isTransparent ? "text-white/80 hover:text-white" : "text-[#1C1C1E]/60 hover:text-[#1C1C1E]"}`}
      >
        <ShoppingBag size={18} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#C9A96E] rounded-full text-[9px] flex items-center justify-center text-white font-medium">
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={openCart}
      className={`relative font-body text-xs tracking-[0.12em] uppercase transition-colors duration-300 ${isTransparent ? "text-white/90 hover:text-white" : "text-[#1C1C1E]/70 hover:text-[#1C1C1E]"}`}
    >
      {cartLabel}
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-3 w-3.5 h-3.5 bg-[#C9A96E] rounded-full text-[9px] flex items-center justify-center text-white font-medium">
          {cartCount > 9 ? '9+' : cartCount}
        </span>
      )}
    </button>
  );
}

function MobileAccountRow({ lang, onClose }: { lang: "TR" | "EN" | "AR"; onClose: () => void }) {
  const { user, isAuthenticated } = useAuth();
  const loginHref = sitePaths.login[lang];
  const accountHref = sitePaths.account[lang];
  const label = lang === "TR" ? "Hesabım" : lang === "EN" ? "My Account" : "حسابي";
  const loginLabel = lang === "TR" ? "Giriş Yap" : lang === "EN" ? "Sign In" : "دخول";
  const href = isAuthenticated ? accountHref : loginHref;

  const handleClick = () => {
    onClose();
    document.body.style.overflow = "";
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, behavior: "instant" });
    window.location.href = href;
  };

  return (
    <button
      onClick={handleClick}
      className="font-display text-2xl text-[#1C1C1E]/60 pb-2 border-t border-[#C9A96E]/20 pt-4 hover:text-[#C9A96E] transition-colors duration-300 text-left"
    >
      {isAuthenticated ? (user?.name || label) : loginLabel}
    </button>
  );
}

function MobileLangRow({ lang, onSelect }: { lang: "TR" | "EN" | "AR"; onSelect: (l: "TR" | "EN" | "AR") => void }) {
  return (
    <div className="border-t border-[#C9A96E]/20 pt-4 pb-2 flex items-center gap-2 justify-end">
      <Globe size={16} className="text-[#C9A96E]" />
      <div className="inline-flex items-center bg-[#F0E9DD] rounded-full p-1">
        {(["TR", "EN", "AR"] as const).map((l) => {
          const active = lang === l;
          return (
            <button
              key={l}
              onClick={() => { if (!active) onSelect(l); }}
              className={`font-body text-xs tracking-[0.1em] uppercase px-3 py-1.5 rounded-full transition-all duration-300 ${
                active
                  ? "bg-[#1C1C1E] text-[#F7F3EC] shadow-sm"
                  : "text-[#1C1C1E]/50 hover:text-[#1C1C1E]"
              }`}
              aria-pressed={active}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FavoritesIcon({ isTransparent, mobile = false }: { isTransparent: boolean; mobile?: boolean }) {
  const { lang } = useLanguage();
  const { favoritesCount } = useFavorites();
  const href = sitePaths.wishlist[lang];
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

  const loginHref = sitePaths.login[lang];
  const accountHref = sitePaths.account[lang];
  const favoritesHref = sitePaths.wishlist[lang];
  const ordersHref = sitePaths.orders[lang];

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
        className={`font-body text-xs tracking-[0.12em] uppercase transition-colors duration-300 ${
          isTransparent
            ? "text-white/90 hover:text-white"
            : "text-[#1C1C1E]/70 hover:text-[#1C1C1E]"
        }`}
      >
        {labels.signIn}
      </Link>
    );
  }

  const shortcuts = [
    { href: accountHref, label: labels.account, Icon: UserIcon },
    { href: favoritesHref, label: labels.favorites, Icon: Heart },
    { href: ordersHref, label: labels.orders, Icon: Package },
  ];

  return (
    <div ref={ref} className="relative flex items-center">
      <Link
        href={accountHref}
        onClick={() => setOpen((v) => !v)}
        className={`font-body text-xs tracking-[0.12em] uppercase transition-colors duration-300 ${
          isTransparent
            ? "text-white/90 hover:text-white"
            : "text-[#1C1C1E]/70 hover:text-[#1C1C1E]"
        }`}
      >
        {labels.account}
      </Link>

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
