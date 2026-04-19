import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import CartDrawer from "./components/CartDrawer";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
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
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
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

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Management Console */}
        <Route path="/management-console" component={ManagementConsolePage} />
        <Route path="/management-console/:rest*" component={ManagementConsolePage} />

        {/* ── Turkish Routes ── */}
        <Route path="/" component={Home} />
        <Route path="/koleksiyonlar" component={Collections} />
        <Route path="/urun/:slug" component={ProductDetail} />
        <Route path="/olustur" component={SilhouetteBuilder} />
        <Route path="/hakkimizda" component={About} />
        <Route path="/hikayemiz" component={Story} />
        <Route path="/lookbook" component={Lookbook} />
        <Route path="/surdurulebilirlik" component={Sustainability} />
        <Route path="/iletisim" component={Contact} />
        <Route path="/journal" component={Journal} />
        <Route path="/kargo-iade" component={ShippingReturns} />
        <Route path="/beden-rehberi" component={SizeGuide} />
        <Route path="/odeme" component={Checkout} />
        <Route path="/giris" component={Login} />
        <Route path="/uye-ol" component={Register} />

        {/* Account — TR */}
        <Route path="/hesap" component={HesapPage} />
        <Route path="/hesap/siparisler" component={SiparislerPage} />
        <Route path="/hesap/siparisler/:id" component={SiparisDetayPage} />
        <Route path="/hesap/iade" component={IadePage} />
        <Route path="/hesap/iade/:id" component={IadeDetayPage} />
        <Route path="/hesap/adresler" component={AdreslerPage} />
        <Route path="/hesap/liste" component={ListePage} />
        <Route path="/hesap/bilgiler" component={BilgilerPage} />

        {/* ── English Routes ── */}
        <Route path="/en" component={Home} />
        <Route path="/en/collections" component={Collections} />
        <Route path="/en/product/:slug" component={ProductDetail} />
        <Route path="/en/builder" component={SilhouetteBuilder} />
        <Route path="/en/about" component={About} />
        <Route path="/en/story" component={Story} />
        <Route path="/en/lookbook" component={Lookbook} />
        <Route path="/en/sustainability" component={Sustainability} />
        <Route path="/en/contact" component={Contact} />
        <Route path="/en/journal" component={Journal} />
        <Route path="/en/shipping-returns" component={ShippingReturns} />
        <Route path="/en/size-guide" component={SizeGuide} />
        <Route path="/en/checkout" component={Checkout} />
        <Route path="/en/login" component={Login} />
        <Route path="/en/register" component={Register} />

        {/* Account — EN */}
        <Route path="/en/hesap" component={HesapPage} />
        <Route path="/en/hesap/siparisler" component={SiparislerPage} />
        <Route path="/en/hesap/siparisler/:id" component={SiparisDetayPage} />
        <Route path="/en/hesap/iade" component={IadePage} />
        <Route path="/en/hesap/iade/:id" component={IadeDetayPage} />
        <Route path="/en/hesap/adresler" component={AdreslerPage} />
        <Route path="/en/hesap/liste" component={ListePage} />
        <Route path="/en/hesap/bilgiler" component={BilgilerPage} />

        {/* ── Arabic Routes ── */}
        <Route path="/ar" component={Home} />
        <Route path="/ar/collections" component={Collections} />
        <Route path="/ar/product/:slug" component={ProductDetail} />
        <Route path="/ar/builder" component={SilhouetteBuilder} />
        <Route path="/ar/about" component={About} />
        <Route path="/ar/story" component={Story} />
        <Route path="/ar/lookbook" component={Lookbook} />
        <Route path="/ar/sustainability" component={Sustainability} />
        <Route path="/ar/contact" component={Contact} />
        <Route path="/ar/journal" component={Journal} />
        <Route path="/ar/shipping-returns" component={ShippingReturns} />
        <Route path="/ar/size-guide" component={SizeGuide} />
        <Route path="/ar/checkout" component={Checkout} />
        <Route path="/ar/login" component={Login} />
        <Route path="/ar/register" component={Register} />

        {/* Account — AR */}
        <Route path="/ar/hesap" component={HesapPage} />
        <Route path="/ar/hesap/siparisler" component={SiparislerPage} />
        <Route path="/ar/hesap/siparisler/:id" component={SiparisDetayPage} />
        <Route path="/ar/hesap/iade" component={IadePage} />
        <Route path="/ar/hesap/iade/:id" component={IadeDetayPage} />
        <Route path="/ar/hesap/adresler" component={AdreslerPage} />
        <Route path="/ar/hesap/liste" component={ListePage} />
        <Route path="/ar/hesap/bilgiler" component={BilgilerPage} />

        {/* ── Legacy redirects (backward compat) ── */}
        <Route path="/hesabim" component={() => { window.location.replace("/hesap"); return null; }} />
        <Route path="/siparislerim" component={() => { window.location.replace("/hesap/siparisler"); return null; }} />
        <Route path="/favorilerim" component={() => { window.location.replace("/hesap/liste"); return null; }} />
        <Route path="/en/account" component={() => { window.location.replace("/en/hesap"); return null; }} />
        <Route path="/en/orders" component={() => { window.location.replace("/en/hesap/siparisler"); return null; }} />
        <Route path="/en/favorites" component={() => { window.location.replace("/en/hesap/liste"); return null; }} />
        <Route path="/ar/account" component={() => { window.location.replace("/ar/hesap"); return null; }} />
        <Route path="/ar/orders" component={() => { window.location.replace("/ar/hesap/siparisler"); return null; }} />
        <Route path="/ar/favorites" component={() => { window.location.replace("/ar/hesap/liste"); return null; }} />

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
