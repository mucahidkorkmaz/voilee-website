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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  PanelLeft,
  ShoppingBag,
  Users,
} from "lucide-react";
import { CSSProperties, FormEvent, useEffect, useRef, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import MCDashboard from "./MCDashboard";
import MCNewsletter from "./MCNewsletter";
import MCOrders from "./MCOrders";
import MCProducts from "./MCProducts";
import MCUsers from "./MCUsers";

const MC_BASE = "/management-console";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: MC_BASE },
  { icon: Package, label: "Ürünler", path: `${MC_BASE}/products` },
  { icon: ShoppingBag, label: "Siparişler", path: `${MC_BASE}/orders` },
  { icon: Users, label: "Kullanıcılar", path: `${MC_BASE}/users` },
  { icon: Mail, label: "Bülten", path: `${MC_BASE}/newsletter` },
];

const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
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
          <p className="text-sm text-muted-foreground">
            Bu panele yalnızca yöneticiler erişebilir.
            <br />
            Hesabınız: <span className="font-medium">{user.email || user.name}</span>
          </p>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/")}>
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${DEFAULT_WIDTH}px` } as CSSProperties}
    >
      <MCLayoutContent />
    </SidebarProvider>
  );
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
      if (!res.ok) {
        setError(data.error || "Hata oluştu.");
      } else {
        onSuccess();
      }
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 p-8"
      >
        <div className="space-y-1 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-light">
            VOILÉE
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide">
            Management Console
          </h1>
          <p className="text-xs text-muted-foreground pt-1">
            Yönetici şifrenizi girin
          </p>
        </div>

        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            required
          />
          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Şifre <code className="bg-muted px-1 rounded">ADMIN_PASSWORD</code> env değişkeninde.
        </p>
      </form>
    </div>
  );
}

function MCLayoutContent() {
  const { user, logout, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

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

  const activeItem = menuItems.find(item => item.path === location);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-border/40"
          style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b border-border/40">
            <div className="flex items-center gap-3 px-2">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent/30 rounded transition-colors focus:outline-none shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-light leading-none">
                    VOILÉE
                  </p>
                  <p className="text-sm font-light tracking-wide truncate mt-0.5">
                    Management Console
                  </p>
                </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 pt-3">
            <SidebarMenu className="px-2 space-y-0.5">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className="h-9 font-normal tracking-wide text-sm"
                    >
                      <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-border/40">
            {loading ? (
              <div className="h-10 bg-muted animate-pulse rounded" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 rounded px-1 py-1 hover:bg-accent/30 transition-colors w-full text-left focus:outline-none group-data-[collapsible=icon]:justify-center">
                    <Avatar className="h-8 w-8 border border-border shrink-0">
                      <AvatarFallback className="text-xs font-medium bg-primary/5">
                        {user.name?.charAt(0).toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                      <p className="text-sm font-normal truncate leading-none">{user.name || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate mt-1">{user.email || "—"}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => (window.location.href = "/")} className="cursor-pointer">
                    Siteye Dön
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="group-data-[collapsible=icon]:hidden px-1 py-1">
                <p className="text-xs text-muted-foreground truncate">Giriş yapılmadı</p>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => !isCollapsed && setIsResizing(true)}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b border-border/40 h-14 items-center px-4 bg-background/95 backdrop-blur sticky top-0 z-40 gap-3">
            <SidebarTrigger className="h-9 w-9 rounded" />
            <span className="text-sm tracking-wide">{activeItem?.label ?? "Management Console"}</span>
          </div>
        )}
        <main className="flex-1 min-h-screen">
          <Switch>
            <Route path={MC_BASE} component={MCDashboard} />
            <Route path={`${MC_BASE}/products`} component={MCProducts} />
            <Route path={`${MC_BASE}/orders`} component={MCOrders} />
            <Route path={`${MC_BASE}/users`} component={MCUsers} />
            <Route path={`${MC_BASE}/newsletter`} component={MCNewsletter} />
          </Switch>
        </main>
      </SidebarInset>
    </>
  );
}
