import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  User,
  Package,
  RotateCcw,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

// ─── Translations ───────────────────────────────────────────────────────────────

const t = {
  TR: {
    logout: "Çıkış Yap",
    loggedOut: "Çıkış yapıldı.",
    loginRequired: "Bu sayfayı görüntülemek için giriş yapmanız gerekir.",
    member: "Voilée Üyesi",
    nav: {
      hesap: "Hesabım",
      siparisler: "Siparişlerim",
      iade: "İadelerim",
      adresler: "Adreslerim",
      liste: "Listem",
      bilgiler: "Bilgilerim",
    },
    styliste: {
      overline: "Özel Stiliste",
      question: "Bir parça için fikir ister misiniz?",
      cta: "WhatsApp",
      phone: "0850 000 00 00",
    },
  },
  EN: {
    logout: "Sign Out",
    loggedOut: "Signed out.",
    loginRequired: "Please sign in to view this page.",
    member: "Voilée Member",
    nav: {
      hesap: "My Account",
      siparisler: "Orders",
      iade: "Returns",
      adresler: "Addresses",
      liste: "Wishlist",
      bilgiler: "Settings",
    },
    styliste: {
      overline: "Personal Stylist",
      question: "Would you like advice on a piece?",
      cta: "WhatsApp",
      phone: "0850 000 00 00",
    },
  },
  AR: {
    logout: "تسجيل الخروج",
    loggedOut: "تم تسجيل الخروج.",
    loginRequired: "يرجى تسجيل الدخول لعرض هذه الصفحة.",
    member: "عضو فوالييه",
    nav: {
      hesap: "حسابي",
      siparisler: "طلباتي",
      iade: "مرتجعاتي",
      adresler: "عناويني",
      liste: "قائمتي",
      bilgiler: "معلوماتي",
    },
    styliste: {
      overline: "المصمم الخاص",
      question: "هل تريد نصيحة حول قطعة ما؟",
      cta: "واتساب",
      phone: "0850 000 00 00",
    },
  },
};

// ─── URL Map ────────────────────────────────────────────────────────────────────

export const hesapUrls = {
  TR: {
    giris: "/giris",
    home: "/",
    hesap: "/hesap",
    siparisler: "/hesap/siparisler",
    siparis: (id: string) => `/hesap/siparisler/${id}`,
    iade: "/hesap/iade",
    iadeDetay: (id: string) => `/hesap/iade/${id}`,
    adresler: "/hesap/adresler",
    liste: "/hesap/liste",
    bilgiler: "/hesap/bilgiler",
    koleksiyonlar: "/koleksiyonlar",
    urun: (slug: string) => `/urun/${slug}`,
  },
  EN: {
    giris: "/en/login",
    home: "/en",
    hesap: "/en/hesap",
    siparisler: "/en/hesap/siparisler",
    siparis: (id: string) => `/en/hesap/siparisler/${id}`,
    iade: "/en/hesap/iade",
    iadeDetay: (id: string) => `/en/hesap/iade/${id}`,
    adresler: "/en/hesap/adresler",
    liste: "/en/hesap/liste",
    bilgiler: "/en/hesap/bilgiler",
    koleksiyonlar: "/en/collections",
    urun: (slug: string) => `/en/product/${slug}`,
  },
  AR: {
    giris: "/ar/login",
    home: "/ar",
    hesap: "/ar/hesap",
    siparisler: "/ar/hesap/siparisler",
    siparis: (id: string) => `/ar/hesap/siparisler/${id}`,
    iade: "/ar/hesap/iade",
    iadeDetay: (id: string) => `/ar/hesap/iade/${id}`,
    adresler: "/ar/hesap/adresler",
    liste: "/ar/hesap/liste",
    bilgiler: "/ar/hesap/bilgiler",
    koleksiyonlar: "/ar/collections",
    urun: (slug: string) => `/ar/product/${slug}`,
  },
};

// ─── Nav Items ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: "hesap" as const, Icon: User },
  { key: "siparisler" as const, Icon: Package },
  { key: "iade" as const, Icon: RotateCcw },
  { key: "adresler" as const, Icon: MapPin },
  { key: "liste" as const, Icon: Heart },
  { key: "bilgiler" as const, Icon: Settings },
];

// ─── Layout ─────────────────────────────────────────────────────────────────────

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lang, isRTL } = useLanguage();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const tx = t[lang];
  const u = hesapUrls[lang];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation(`${u.giris}?redirect=${encodeURIComponent(location)}`);
    }
  }, [isLoading, isAuthenticated, location, setLocation, u.giris]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div
        className="min-h-screen bg-[#F7F3EC] flex flex-col"
        dir={isRTL ? "rtl" : "ltr"}
      >
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

  const handleLogout = async () => {
    await logout();
    toast.success(tx.loggedOut);
    setLocation(u.home);
  };

  const displayName = user.name || user.email || tx.member;

  const isActive = (key: keyof (typeof hesapUrls)["TR"]) => {
    if (typeof u[key] !== "string") return false;
    const href = u[key] as string;
    if (key === "hesap") return location === href;
    return location === href || location.startsWith(href + "/");
  };

  return (
    <div
      className="min-h-screen bg-[#F7F3EC] flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Navbar />

      {/* Spacer for fixed Navbar (h-16 mobile / h-20 desktop) */}
      <div className="h-16 lg:h-20 flex-shrink-0" />

      {/* Mobile horizontal tab bar — hidden on the main /hesap page (it's its own nav) */}
      {!isActive("hesap") && (
        <div className="lg:hidden border-b border-[#C9A96E]/15 bg-[#F7F3EC]">
          <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV_ITEMS.map(({ key, Icon }) => {
              const active = isActive(key);
              return (
                <Link
                  key={key}
                  href={u[key] as string}
                  className={`flex-shrink-0 inline-flex flex-col items-center gap-1 px-4 py-3 font-body text-[9px] tracking-[0.15em] uppercase transition-colors border-b-2 ${
                    active
                      ? "border-[#C9A96E] text-[#C9A96E]"
                      : "border-transparent text-[#1C1C1E]/50 hover:text-[#1C1C1E]"
                  }`}
                >
                  <Icon size={14} strokeWidth={1.6} />
                  {tx.nav[key]}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <main className="flex-1 pt-8 pb-20 lg:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex gap-8 lg:gap-14 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            {/* Sidebar — desktop only */}
            <aside className="hidden lg:flex flex-col w-52 xl:w-60 flex-shrink-0">
              {/* User card */}
              <div className="mb-7 pb-6 border-b border-[#C9A96E]/15">
                <div className="min-w-0">
                  <p
                    className={`font-body text-sm text-[#1C1C1E] truncate font-medium ${
                      isRTL ? "text-right" : ""
                    }`}
                  >
                    {displayName}
                  </p>
                  {user.email && user.name && (
                    <p
                      className={`font-body text-[11px] text-[#1C1C1E]/45 truncate ${
                        isRTL ? "text-right" : ""
                      }`}
                    >
                      {user.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Nav links */}
              <nav className="flex-1 space-y-0.5">
                {NAV_ITEMS.map(({ key, Icon }) => {
                  const active = isActive(key);
                  return (
                    <Link
                      key={key}
                      href={u[key] as string}
                      className={`flex items-center gap-3 px-3 py-2.5 font-body text-[11px] tracking-[0.15em] uppercase transition-all duration-200 ${
                        isRTL ? "flex-row-reverse text-right" : ""
                      } ${
                        active
                          ? "text-[#C9A96E] bg-[#C9A96E]/8"
                          : "text-[#1C1C1E]/55 hover:text-[#1C1C1E] hover:bg-[#1C1C1E]/4"
                      }`}
                    >
                      <Icon
                        size={15}
                        strokeWidth={active ? 2 : 1.6}
                        className="flex-shrink-0"
                      />
                      {tx.nav[key]}
                    </Link>
                  );
                })}
              </nav>

              {/* Styliste card */}
              <div className="mt-8">
                <a
                  href="https://wa.me/905000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block border-l-2 border-[#C9A96E] bg-[#F7F3EC] p-4 group hover:bg-[#F0EBE1] transition-colors duration-300 ${
                    isRTL ? "border-l-0 border-r-2" : ""
                  }`}
                >
                  <p className="font-body text-[9px] tracking-[0.25em] uppercase text-[#C9A96E] mb-1.5">
                    {tx.styliste.overline}
                  </p>
                  <p className="font-display text-[15px] text-[#1C1C1E] italic leading-snug mb-3">
                    {tx.styliste.question}
                  </p>
                  <div
                    className={`flex items-center justify-between ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span className="font-body text-[9px] tracking-[0.15em] uppercase text-[#1C1C1E]/60">
                      {tx.styliste.cta} · {tx.styliste.phone}
                    </span>
                    <ChevronRight
                      size={12}
                      className={`text-[#C9A96E] group-hover:translate-x-0.5 transition-transform ${
                        isRTL
                          ? "rotate-180 group-hover:translate-x-0 group-hover:-translate-x-0.5"
                          : ""
                      }`}
                    />
                  </div>
                </a>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className={`mt-8 pt-6 border-t border-[#C9A96E]/15 flex items-center gap-3 font-body text-[11px] tracking-[0.15em] uppercase text-[#1C1C1E]/40 hover:text-red-500 transition-colors ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <LogOut size={15} strokeWidth={1.6} />
                {tx.logout}
              </button>
            </aside>

            {/* Page content */}
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
