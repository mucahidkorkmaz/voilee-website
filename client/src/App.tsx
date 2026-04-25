import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { Route, Switch, useLocation, useParams } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import CartDrawer from "./components/CartDrawer";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, LangPathSync } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { OrdersProvider } from "./contexts/OrdersContext";
import { AddressProvider } from "./contexts/AddressContext";

// Static pages
import Home from "./pages/Home";
import Collections from "./pages/Collections";
import SilhouetteBuilder from "./pages/SilhouetteBuilder";
import About from "./pages/About";
import Sustainability from "./pages/Sustainability";
import Contact from "./pages/Contact";
import Journal from "./pages/Journal";
import ShippingReturns from "./pages/ShippingReturns";
import SizeGuide from "./pages/SizeGuide";
import Story from "./pages/Story";
import Lookbook from "./pages/Lookbook";
import LookbookDetail from "./pages/LookbookDetail";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import Dogrulama from "./pages/Dogrulama";
import ManagementConsolePage from "./pages/management-console";

// Account pages — new architecture
import HesapPage from "./pages/hesap/page";
import SiparislerPage from "./pages/hesap/siparisler/page";
import SiparisDetayPage from "./pages/hesap/siparisler/[id]/page";
import IadePage from "./pages/hesap/iade/page";
import IadeDetayPage from "./pages/hesap/iade/[id]/page";
import AdreslerPage from "./pages/hesap/adresler/page";
import ListePage from "./pages/hesap/liste/page";
import BilgilerPage from "./pages/hesap/bilgiler/page";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function RootLangRedirect() {
  useEffect(() => {
    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    if (browserLang === "ar") window.location.replace("/ar");
    else if (browserLang === "en") window.location.replace("/en");
    else window.location.replace("/tr");
  }, []);
  return null;
}

function replaceWith(href: string) {
  return () => {
    window.location.replace(href);
    return null;
  };
}

function replaceWithSearch(base: string) {
  return () => {
    window.location.replace(`${base}${window.location.search}`);
    return null;
  };
}

function LegacyUrunRedirect() {
  const { slug } = useParams<{ slug: string }>();
  useEffect(() => {
    if (slug) window.location.replace(`/tr/product/${encodeURIComponent(slug)}`);
  }, [slug]);
  return null;
}

function LegacyEnProductRedirect() {
  const { slug } = useParams<{ slug: string }>();
  useEffect(() => {
    if (slug) window.location.replace(`/en/product/${encodeURIComponent(slug)}`);
  }, [slug]);
  return null;
}

function LegacyArProductRedirect() {
  const { slug } = useParams<{ slug: string }>();
  useEffect(() => {
    if (slug) window.location.replace(`/ar/product/${encodeURIComponent(slug)}`);
  }, [slug]);
  return null;
}

function LegacyHesapSiparisId({ prefix }: { prefix: "tr" | "en" | "ar" }) {
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    if (id) window.location.replace(`/${prefix}/account/orders/${encodeURIComponent(id)}`);
  }, [id, prefix]);
  return null;
}

function LegacyHesapIadeId({ prefix }: { prefix: "tr" | "en" | "ar" }) {
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    if (id) window.location.replace(`/${prefix}/account/returns/${encodeURIComponent(id)}`);
  }, [id, prefix]);
  return null;
}

function LegacyDogtrulamaSerial() {
  const { serial } = useParams<{ serial: string }>();
  useEffect(() => {
    if (serial) window.location.replace(`/tr/verify/${encodeURIComponent(serial)}`);
  }, [serial]);
  return null;
}

function LegacyEnDogtrulamaSerial() {
  const { serial } = useParams<{ serial: string }>();
  useEffect(() => {
    if (serial) window.location.replace(`/en/verify/${encodeURIComponent(serial)}`);
  }, [serial]);
  return null;
}

function LegacyArDogtrulamaSerial() {
  const { serial } = useParams<{ serial: string }>();
  useEffect(() => {
    if (serial) window.location.replace(`/ar/verify/${encodeURIComponent(serial)}`);
  }, [serial]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <LangPathSync />
      <Switch>
        {/* Management Console */}
        <Route path="/management-console" component={ManagementConsolePage} />
        <Route path="/management-console/:rest*" component={ManagementConsolePage} />

        <Route path="/" component={RootLangRedirect} />

        {/* ── Turkish (/tr) ── */}
        <Route path="/tr" component={Home} />
        <Route path="/tr/collections" component={Collections} />
        <Route path="/tr/product/:slug" component={ProductDetail} />
        <Route path="/tr/builder" component={SilhouetteBuilder} />
        <Route path="/tr/about" component={About} />
        <Route path="/tr/story" component={Story} />
        <Route path="/tr/lookbook" component={Lookbook} />
        <Route path="/tr/lookbook/:slug" component={LookbookDetail} />
        <Route path="/tr/sustainability" component={Sustainability} />
        <Route path="/tr/contact" component={Contact} />
        <Route path="/tr/journal" component={Journal} />
        <Route path="/tr/shipping-returns" component={ShippingReturns} />
        <Route path="/tr/size-guide" component={SizeGuide} />
        <Route path="/tr/checkout" component={Checkout} />
        <Route path="/tr/login" component={Login} />
        <Route path="/tr/forgot-password" component={ForgotPassword} />
        <Route path="/tr/reset-password" component={ResetPassword} />
        <Route path="/tr/register" component={Register} />
        <Route path="/tr/verify" component={Dogrulama} />
        <Route path="/tr/verify/:serial" component={Dogrulama} />

        <Route path="/tr/account/orders/:id" component={SiparisDetayPage} />
        <Route path="/tr/account/orders" component={SiparislerPage} />
        <Route path="/tr/account/returns/:id" component={IadeDetayPage} />
        <Route path="/tr/account/returns" component={IadePage} />
        <Route path="/tr/account/addresses" component={AdreslerPage} />
        <Route path="/tr/account/wishlist" component={ListePage} />
        <Route path="/tr/account/profile" component={BilgilerPage} />
        <Route path="/tr/account" component={HesapPage} />

        {/* ── English (/en) ── */}
        <Route path="/en" component={Home} />
        <Route path="/en/collections" component={Collections} />
        <Route path="/en/product/:slug" component={ProductDetail} />
        <Route path="/en/builder" component={SilhouetteBuilder} />
        <Route path="/en/about" component={About} />
        <Route path="/en/story" component={Story} />
        <Route path="/en/lookbook" component={Lookbook} />
        <Route path="/en/lookbook/:slug" component={LookbookDetail} />
        <Route path="/en/sustainability" component={Sustainability} />
        <Route path="/en/contact" component={Contact} />
        <Route path="/en/journal" component={Journal} />
        <Route path="/en/shipping-returns" component={ShippingReturns} />
        <Route path="/en/size-guide" component={SizeGuide} />
        <Route path="/en/checkout" component={Checkout} />
        <Route path="/en/login" component={Login} />
        <Route path="/en/register" component={Register} />
        <Route path="/en/verify" component={Dogrulama} />
        <Route path="/en/forgot-password" component={ForgotPassword} />
        <Route path="/en/reset-password" component={ResetPassword} />
        <Route path="/en/verify/:serial" component={Dogrulama} />

        <Route path="/en/account/orders/:id" component={SiparisDetayPage} />
        <Route path="/en/account/orders" component={SiparislerPage} />
        <Route path="/en/account/returns/:id" component={IadeDetayPage} />
        <Route path="/en/account/returns" component={IadePage} />
        <Route path="/en/account/addresses" component={AdreslerPage} />
        <Route path="/en/account/wishlist" component={ListePage} />
        <Route path="/en/account/profile" component={BilgilerPage} />
        <Route path="/en/account" component={HesapPage} />

        {/* ── Arabic (/ar) ── */}
        <Route path="/ar" component={Home} />
        <Route path="/ar/collections" component={Collections} />
        <Route path="/ar/product/:slug" component={ProductDetail} />
        <Route path="/ar/builder" component={SilhouetteBuilder} />
        <Route path="/ar/about" component={About} />
        <Route path="/ar/story" component={Story} />
        <Route path="/ar/lookbook" component={Lookbook} />
        <Route path="/ar/lookbook/:slug" component={LookbookDetail} />
        <Route path="/ar/sustainability" component={Sustainability} />
        <Route path="/ar/contact" component={Contact} />
        <Route path="/ar/journal" component={Journal} />
        <Route path="/ar/shipping-returns" component={ShippingReturns} />
        <Route path="/ar/size-guide" component={SizeGuide} />
        <Route path="/ar/checkout" component={Checkout} />
        <Route path="/ar/login" component={Login} />
        <Route path="/ar/register" component={Register} />
        <Route path="/ar/verify" component={Dogrulama} />
        <Route path="/ar/verify/:serial" component={Dogrulama} />

        <Route path="/ar/forgot-password" component={ForgotPassword} />
        <Route path="/ar/reset-password" component={ResetPassword} />

        <Route path="/ar/account/orders/:id" component={SiparisDetayPage} />
        <Route path="/ar/account/orders" component={SiparislerPage} />
        <Route path="/ar/account/returns/:id" component={IadeDetayPage} />
        <Route path="/ar/account/returns" component={IadePage} />
        <Route path="/ar/account/addresses" component={AdreslerPage} />
        <Route path="/ar/account/wishlist" component={ListePage} />
        <Route path="/ar/account/profile" component={BilgilerPage} />
        <Route path="/ar/account" component={HesapPage} />

        {/* ── Legacy: Turkish slug → /tr/... ── */}
        <Route path="/koleksiyonlar" component={replaceWith("/tr/collections")} />
        <Route path="/urun/:slug" component={LegacyUrunRedirect} />
        <Route path="/olustur" component={replaceWithSearch("/tr/builder")} />
        <Route path="/hakkimizda" component={replaceWith("/tr/about")} />
        <Route path="/hikayemiz" component={replaceWith("/tr/story")} />
        <Route path="/lookbook" component={replaceWith("/tr/lookbook")} />
        <Route path="/lookbook/:slug" component={({ params }: any) => { 
  window.location.replace(`/tr/lookbook/${params.slug}`); 
  return null; 
}} />
        <Route path="/surdurulebilirlik" component={replaceWith("/tr/sustainability")} />
        <Route path="/iletisim" component={replaceWith("/tr/contact")} />
        <Route path="/journal" component={replaceWith("/tr/journal")} />
        <Route path="/kargo-iade" component={replaceWith("/tr/shipping-returns")} />
        <Route path="/beden-rehberi" component={replaceWith("/tr/size-guide")} />
        <Route path="/odeme" component={replaceWithSearch("/tr/checkout")} />
        <Route path="/giris" component={replaceWithSearch("/tr/login")} />
        <Route path="/sifremi-unuttum" component={replaceWith("/tr/forgot-password")} />
        <Route path="/sifremi-sifirla" component={replaceWithSearch("/tr/reset-password")} />
        <Route path="/uye-ol" component={replaceWithSearch("/tr/register")} />
        <Route path="/dogrulama/:serial" component={LegacyDogtrulamaSerial} />
        <Route path="/dogrulama" component={replaceWithSearch("/tr/verify")} />

        <Route path="/hesap/siparisler/:id" component={() => <LegacyHesapSiparisId prefix="tr" />} />
        <Route path="/hesap/siparisler" component={replaceWith("/tr/account/orders")} />
        <Route path="/hesap/iade/:id" component={() => <LegacyHesapIadeId prefix="tr" />} />
        <Route path="/hesap/iade" component={replaceWith("/tr/account/returns")} />
        <Route path="/hesap/adresler" component={replaceWith("/tr/account/addresses")} />
        <Route path="/hesap/liste" component={replaceWith("/tr/account/wishlist")} />
        <Route path="/hesap/bilgiler" component={replaceWith("/tr/account/profile")} />
        <Route path="/hesap" component={replaceWith("/tr/account")} />

        <Route path="/hesabim" component={replaceWith("/tr/account")} />
        <Route path="/siparislerim" component={replaceWith("/tr/account/orders")} />
        <Route path="/favorilerim" component={replaceWith("/tr/account/wishlist")} />

        {/* ── Legacy: EN / AR old paths ── */}
        <Route path="/en/urun/:slug" component={LegacyEnProductRedirect} />
        <Route path="/ar/urun/:slug" component={LegacyArProductRedirect} />

        <Route path="/en/hesap/siparisler/:id" component={() => <LegacyHesapSiparisId prefix="en" />} />
        <Route path="/en/hesap/siparisler" component={replaceWith("/en/account/orders")} />
        <Route path="/en/hesap/iade/:id" component={() => <LegacyHesapIadeId prefix="en" />} />
        <Route path="/en/hesap/iade" component={replaceWith("/en/account/returns")} />
        <Route path="/en/hesap/adresler" component={replaceWith("/en/account/addresses")} />
        <Route path="/en/hesap/liste" component={replaceWith("/en/account/wishlist")} />
        <Route path="/en/hesap/bilgiler" component={replaceWith("/en/account/profile")} />
        <Route path="/en/hesap" component={replaceWith("/en/account")} />

        <Route path="/ar/hesap/siparisler/:id" component={() => <LegacyHesapSiparisId prefix="ar" />} />
        <Route path="/ar/hesap/siparisler" component={replaceWith("/ar/account/orders")} />
        <Route path="/ar/hesap/iade/:id" component={() => <LegacyHesapIadeId prefix="ar" />} />
        <Route path="/ar/hesap/iade" component={replaceWith("/ar/account/returns")} />
        <Route path="/ar/hesap/adresler" component={replaceWith("/ar/account/addresses")} />
        <Route path="/ar/hesap/liste" component={replaceWith("/ar/account/wishlist")} />
        <Route path="/ar/hesap/bilgiler" component={replaceWith("/ar/account/profile")} />
        <Route path="/ar/hesap" component={replaceWith("/ar/account")} />

        <Route path="/en/dogrulama/:serial" component={LegacyEnDogtrulamaSerial} />
        <Route path="/en/dogrulama" component={replaceWithSearch("/en/verify")} />
        <Route path="/ar/dogrulama/:serial" component={LegacyArDogtrulamaSerial} />
        <Route path="/ar/dogrulama" component={replaceWithSearch("/ar/verify")} />

        <Route path="/en/orders" component={replaceWith("/en/account/orders")} />
        <Route path="/en/favorites" component={replaceWith("/en/account/wishlist")} />
        <Route path="/ar/orders" component={replaceWith("/ar/account/orders")} />
        <Route path="/ar/favorites" component={replaceWith("/ar/account/wishlist")} />

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <AddressProvider>
              <OrdersProvider>
                <LanguageProvider>
                  <ThemeProvider defaultTheme="light">
                    <TooltipProvider>
                      <Toaster />
                      <CartDrawer />
                      <Router />
                    </TooltipProvider>
                  </ThemeProvider>
                </LanguageProvider>
              </OrdersProvider>
            </AddressProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
