import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/useMobile";
import {
  ArrowDownRight,
  Bell,
  CreditCard,
  FileText,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  PanelLeft,
  RotateCcw,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  TrendingUp,
  Truck,
  Users,
  Webhook,
  Shapes,
  FolderOpen,
  ShieldCheck,
  GalleryHorizontal,
  BookImage,
} from "lucide-react";
import { CSSProperties, FormEvent, useEffect, useRef, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import MCDashboard from "./MCDashboard";
import MCProducts from "./MCProducts";
import MCCategories from "./MCCategories";
import MCCollections from "./MCCollections";
import MCSilhouettes from "./MCSilhouettes";
import MCMedia from "./MCMedia";
import MCOrders from "./MCOrders";
import MCAbandonedCarts from "./MCAbandonedCarts";
import MCUsers from "./MCUsers";
import MCPayments from "./MCPayments";
import MCDiscounts from "./MCDiscounts";
import MCRevenue from "./MCRevenue";
import MCShipping from "./MCShipping";
import MCMarketplace from "./MCMarketplace";
import MCWebhooks from "./MCWebhooks";
import MCCMS from "./MCCMS";
import MCNewsletter from "./MCNewsletter";
import MCEmailTemplates from "./MCEmailTemplates";
import MCSettings from "./MCSettings";
import MCReturns from "./MCReturns";
import MCExpenses from "./MCExpenses";
import MCVerifications from "./MCVerifications";
import MCHeroSlides from "./MCHeroSlides";

const MC_BASE = "/management-console";

type MenuItem = { icon: React.ElementType; label: string; path: string };
type MenuSection = { title: string; items: MenuItem[] };

const menuSections: MenuSection[] = [
  {
    title: "",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: MC_BASE },
    ],
  },
  {
    title: "KATALOG",
    items: [
      { icon: Package, label: "Ürünler", path: `${MC_BASE}/products` },
      { icon: Shapes, label: "Silüetler", path: `${MC_BASE}/silhouettes` },
      { icon: FolderOpen, label: "Kategoriler", path: `${MC_BASE}/categories` },
      { icon: BookImage, label: "Lookbook Görselleri", path: `${MC_BASE}/collections` },
      { icon: GalleryHorizontal, label: "Hero Slaytlar", path: `${MC_BASE}/hero-slides` },
      { icon: Image, label: "Medya", path: `${MC_BASE}/media` },
      { icon: ShieldCheck, label: "Doğrulama", path: `${MC_BASE}/verifications` },
    ],
  },
  {
    title: "SATIŞ",
    items: [
      { icon: ShoppingBag, label: "Siparişler", path: `${MC_BASE}/orders` },
      { icon: RotateCcw, label: "İade Talepleri", path: `${MC_BASE}/returns` },
      { icon: ShoppingCart, label: "Terk Sepetler", path: `${MC_BASE}/abandoned-carts` },
      { icon: Users, label: "Müşteriler", path: `${MC_BASE}/users` },
    ],
  },
  {
    title: "FİNANS",
    items: [
      { icon: CreditCard, label: "Finansal Özet", path: `${MC_BASE}/payments` },
      { icon: ArrowDownRight, label: "Giderler", path: `${MC_BASE}/expenses` },
      { icon: Tag, label: "İndirimler", path: `${MC_BASE}/discounts` },
      { icon: TrendingUp, label: "Raporlar", path: `${MC_BASE}/revenue` },
    ],
  },
  {
    title: "PAZARLAMA",
    items: [
      { icon: Truck, label: "Kargo", path: `${MC_BASE}/shipping` },
      { icon: Store, label: "Marketplace", path: `${MC_BASE}/marketplace` },
      { icon: Webhook, label: "Webhooks", path: `${MC_BASE}/webhooks` },
    ],
  },
  {
    title: "İÇERİK",
    items: [
      { icon: FileText, label: "İçerik (CMS)", path: `${MC_BASE}/cms` },
      { icon: Mail, label: "Bülten", path: `${MC_BASE}/newsletter` },
      { icon: Bell, label: "E-posta Şablonları", path: `${MC_BASE}/email-templates` },
    ],
  },
  {
    title: "YAPILANDIRMA",
    items: [{ icon: Settings, label: "Mağaza Ayarları", path: `${MC_BASE}/settings` }],
  },
];

const allItems = menuSections.flatMap(s => s.items);

function navItemIsActive(path: string, location: string): boolean {
  return location === path;
}

const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 200;
const MAX_WIDTH = 380;
const SIDEBAR_WIDTH_KEY = "mc-sidebar-width";

export default function ManagementConsolePage() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LocalLoginForm onSuccess={() => utils.auth.me.invalidate()} />;
  }

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-3 p-8 max-w-sm">
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">VOILÉE</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light">Erişim Kısıtlı</h1>
          <p className="text-sm text-muted-foreground">Bu panele yalnızca yöneticiler erişebilir.</p>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/")}>Ana Sayfaya Dön</Button>
        </div>
      </div>
    );
  }

  return <MCLayout />;
}

function LocalLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/local-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Hata oluştu.");
      else onSuccess();
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 p-8">
        <div className="space-y-1 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-light">VOILÉE</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide">Management Console</h1>
          <p className="text-xs text-muted-foreground pt-1">Yönetici şifrenizi girin</p>
        </div>
        <div className="space-y-3">
          <Input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} autoFocus required />
          {error && <p className="text-xs text-destructive text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Giriş yapılıyor…" : "Giriş Yap"}</Button>
        </div>
      </form>
    </div>
  );
}

function MCLayout() {
  const { user, logout, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { data: settings } = trpc.admin.settings.get.useQuery(undefined, { retry: false });
  const storeName = settings?.storeName || "VOILÉE";

  useEffect(() => { localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString()); }, [sidebarWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - left;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const activeItem = allItems.find(item => navItemIsActive(item.path, location));

  const sidebar = (
    <div
      ref={sidebarRef}
      className="relative flex flex-col h-full bg-card border-r border-border/40 shrink-0"
      style={{ width: collapsed ? 56 : sidebarWidth }}
    >
      {/* Header */}
      <div className="h-14 flex items-center border-b border-border/40 px-3 gap-2 shrink-0">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="h-8 w-8 flex items-center justify-center hover:bg-accent/30 rounded transition-colors focus:outline-none shrink-0"
          aria-label="Toggle navigation"
        >
          <PanelLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate leading-none">{storeName}</p>
            <button
              className="text-[10px] text-muted-foreground/70 hover:text-primary transition-colors mt-0.5 leading-none"
              onClick={() => setLocation(`${MC_BASE}/settings`)}
            >
              Mağazayı değiştir →
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {menuSections.map((section, si) => (
          <div key={si} className={collapsed ? "px-1 py-1" : "px-2 py-1"}>
            {!collapsed && section.title && (
              <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/50 font-medium px-2 py-1.5 mt-1">
                {section.title}
              </p>
            )}
            {collapsed && section.title && si > 0 && (
              <div className="my-1 mx-1 border-t border-border/30" />
            )}
            {section.items.map(item => {
              const isActive = navItemIsActive(item.path, location);
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 rounded px-2 py-2 text-sm transition-colors mb-0.5 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:bg-accent/30 hover:text-foreground"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  {!collapsed && <span className="truncate font-light tracking-wide">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border/40 shrink-0">
        {loading ? (
          <div className="h-10 bg-muted animate-pulse rounded" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-2.5 rounded px-2 py-1.5 hover:bg-accent/30 transition-colors w-full text-left focus:outline-none ${collapsed ? "justify-center" : ""}`}>
                <Avatar className="h-7 w-7 border border-border shrink-0">
                  <AvatarFallback className="text-xs font-medium bg-primary/5">
                    {user.name?.charAt(0).toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-normal truncate leading-none">{user.name || "—"}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email || "—"}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => (window.location.href = "/")} className="cursor-pointer">Siteye Dön</DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {/* Resize handle */}
      {!collapsed && (
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors"
          onMouseDown={() => setIsResizing(true)}
          style={{ zIndex: 50 }}
        />
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      {!isMobile && sidebar}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        {isMobile && (
          <div className="flex border-b border-border/40 h-14 items-center px-4 bg-background/95 backdrop-blur sticky top-0 z-40 gap-3 shrink-0">
            <button onClick={() => setCollapsed(c => !c)} className="h-9 w-9 rounded flex items-center justify-center hover:bg-muted transition-colors">
              <PanelLeft className="h-4 w-4" />
            </button>
            <span className="text-sm tracking-wide font-light">{activeItem?.label ?? "Management Console"}</span>
          </div>
        )}

        {/* Mobile sidebar overlay */}
        {isMobile && !collapsed && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setCollapsed(true)} />
            <div className="fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-card border-r border-border/40" style={{ width: 260 }}>
              <div className="h-14 flex items-center border-b border-border/40 px-3 gap-2 shrink-0">
                <button onClick={() => setCollapsed(true)} className="h-8 w-8 flex items-center justify-center hover:bg-accent/30 rounded"><PanelLeft className="h-4 w-4 text-muted-foreground" /></button>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{storeName}</p>
                  <button className="text-[10px] text-muted-foreground/70" onClick={() => { setLocation(`${MC_BASE}/settings`); setCollapsed(true); }}>Mağazayı değiştir →</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-2 px-2">
                {menuSections.map((section, si) => (
                  <div key={si} className="py-1">
                    {section.title && <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/50 font-medium px-2 py-1.5 mt-1">{section.title}</p>}
                    {section.items.map(item => {
                      const isActive = navItemIsActive(item.path, location);
                      return (
                        <button key={item.path} onClick={() => { setLocation(item.path); setCollapsed(true); }}
                          className={`w-full flex items-center gap-2.5 rounded px-2 py-2 text-sm transition-colors mb-0.5 ${isActive ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-accent/30 hover:text-foreground"}`}>
                          <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                          <span className="truncate font-light">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <main className="flex-1 overflow-y-auto">
          <Switch>
            <Route path={MC_BASE} component={MCDashboard} />
            <Route path={`${MC_BASE}/products`} component={MCProducts} />
            <Route path={`${MC_BASE}/silhouettes`} component={MCSilhouettes} />
            <Route path={`${MC_BASE}/categories`} component={MCCategories} />
            <Route path={`${MC_BASE}/collections`} component={MCCollections} />
            <Route path={`${MC_BASE}/hero-slides`} component={MCHeroSlides} />
            <Route path={`${MC_BASE}/media`} component={MCMedia} />
            <Route path={`${MC_BASE}/verifications`} component={MCVerifications} />
            <Route path={`${MC_BASE}/orders`} component={MCOrders} />
            <Route path={`${MC_BASE}/returns`} component={MCReturns} />
            <Route path={`${MC_BASE}/abandoned-carts`} component={MCAbandonedCarts} />
            <Route path={`${MC_BASE}/users`} component={MCUsers} />
            <Route path={`${MC_BASE}/payments`} component={MCPayments} />
            <Route path={`${MC_BASE}/expenses`} component={MCExpenses} />
            <Route path={`${MC_BASE}/discounts`} component={MCDiscounts} />
            <Route path={`${MC_BASE}/revenue`} component={MCRevenue} />
            <Route path={`${MC_BASE}/shipping`} component={MCShipping} />
            <Route path={`${MC_BASE}/marketplace`} component={MCMarketplace} />
            <Route path={`${MC_BASE}/webhooks`} component={MCWebhooks} />
            <Route path={`${MC_BASE}/cms`} component={MCCMS} />
            <Route path={`${MC_BASE}/newsletter`} component={MCNewsletter} />
            <Route path={`${MC_BASE}/email-templates`} component={MCEmailTemplates} />
            <Route path={`${MC_BASE}/settings`} component={MCSettings} />
          </Switch>
        </main>
      </div>
    </div>
  );
}
