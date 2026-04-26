import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
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

// Account pages
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

function RootRedirectToTr() {
  useEffect(() => {
    window.location.replace("/tr");
  }, []);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <LangPathSync />
      <Switch>
        <Route path="/management-console" component={ManagementConsolePage} />
        <Route path="/management-console/:rest*" component={ManagementConsolePage} />

        <Route path="/" component={RootRedirectToTr} />

        {/* Turkish */}
        <Route path="/tr" component={Home} />
        <Route path="/tr/silhouettes" component={Collections} />
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
        <Route path="/tr/account/settings" component={BilgilerPage} />
        <Route path="/tr/account" component={HesapPage} />

        {/* English */}
        <Route path="/en" component={Home} />
        <Route path="/en/silhouettes" component={Collections} />
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
        <Route path="/en/forgot-password" component={ForgotPassword} />
        <Route path="/en/reset-password" component={ResetPassword} />
        <Route path="/en/register" component={Register} />
        <Route path="/en/verify" component={Dogrulama} />
        <Route path="/en/verify/:serial" component={Dogrulama} />
        <Route path="/en/account/orders/:id" component={SiparisDetayPage} />
        <Route path="/en/account/orders" component={SiparislerPage} />
        <Route path="/en/account/returns/:id" component={IadeDetayPage} />
        <Route path="/en/account/returns" component={IadePage} />
        <Route path="/en/account/addresses" component={AdreslerPage} />
        <Route path="/en/account/wishlist" component={ListePage} />
        <Route path="/en/account/settings" component={BilgilerPage} />
        <Route path="/en/account" component={HesapPage} />

        {/* Arabic */}
        <Route path="/ar" component={Home} />
        <Route path="/ar/silhouettes" component={Collections} />
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
        <Route path="/ar/forgot-password" component={ForgotPassword} />
        <Route path="/ar/reset-password" component={ResetPassword} />
        <Route path="/ar/register" component={Register} />
        <Route path="/ar/verify" component={Dogrulama} />
        <Route path="/ar/verify/:serial" component={Dogrulama} />
        <Route path="/ar/account/orders/:id" component={SiparisDetayPage} />
        <Route path="/ar/account/orders" component={SiparislerPage} />
        <Route path="/ar/account/returns/:id" component={IadeDetayPage} />
        <Route path="/ar/account/returns" component={IadePage} />
        <Route path="/ar/account/addresses" component={AdreslerPage} />
        <Route path="/ar/account/wishlist" component={ListePage} />
        <Route path="/ar/account/settings" component={BilgilerPage} />
        <Route path="/ar/account" component={HesapPage} />

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
