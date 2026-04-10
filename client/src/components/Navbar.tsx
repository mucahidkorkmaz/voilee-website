import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ShoppingBag, Search, Globe, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_logo_2e68b438.webp";

const getNavLinks = (lang: "TR" | "EN" | "AR") => {
  const baseLinks = {
    TR: [
      { href: "/koleksiyonlar", label: "Koleksiyonlar" },
      { href: "/hakkimizda", label: "Hakkımızda" },
      { href: "/hikayemiz", label: "Hikayemiz" },
      { href: "/surdurulebilirlik", label: "Sürdürülebilirlik" },
      { href: "/journal", label: "Journal" },
      { href: "/iletisim", label: "İletişim" },
    ],
    EN: [
      { href: "/en/collections", label: "Collections" },
      { href: "/en/about", label: "About" },
      { href: "/en/story", label: "Our Story" },
      { href: "/en/sustainability", label: "Sustainability" },
      { href: "/en/journal", label: "Journal" },
      { href: "/en/contact", label: "Contact" },
    ],
    AR: [
      { href: "/ar/collections", label: "المجموعات" },
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
                <button className={`transition-colors duration-300 ${isTransparent ? "text-white/80 hover:text-white" : "text-[#1C1C1E]/60 hover:text-[#1C1C1E]"}`}>
                  <Heart size={16} />
                </button>
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
