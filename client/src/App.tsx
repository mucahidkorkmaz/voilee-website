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
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import Account from "./pages/Account";
import Favorites from "./pages/Favorites";
import Orders from "./pages/Orders";
import ManagementConsolePage from "./pages/management-console";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <>
    <ScrollToTop />
    <Switch>
      {/* Management Console */}
      <Route path="/management-console" component={ManagementConsolePage} />
      <Route path="/management-console/:rest*" component={ManagementConsolePage} />

      {/* Turkish Routes */}
      <Route path="/" component={Home} />
      <Route path="/koleksiyonlar" component={Collections} />
      <Route path="/urun/:slug" component={ProductDetail} />
      <Route path="/olustur" component={SilhouetteBuilder} />
      <Route path="/hakkimizda" component={About} />
      <Route path="/hikayemiz" component={Story} />
      <Route path="/surdurulebilirlik" component={Sustainability} />
      <Route path="/iletisim" component={Contact} />
      <Route path="/journal" component={Journal} />
      <Route path="/kargo-iade" component={ShippingReturns} />
      <Route path="/beden-rehberi" component={SizeGuide} />
      <Route path="/odeme" component={Checkout} />
      <Route path="/giris" component={Login} />
      <Route path="/uye-ol" component={Register} />
      <Route path="/hesabim" component={Account} />
      <Route path="/favorilerim" component={Favorites} />
      <Route path="/siparislerim" component={Orders} />

      {/* English Routes */}
      <Route path="/en" component={Home} />
      <Route path="/en/collections" component={Collections} />
      <Route path="/en/product/:slug" component={ProductDetail} />
      <Route path="/en/builder" component={SilhouetteBuilder} />
      <Route path="/en/about" component={About} />
      <Route path="/en/story" component={Story} />
      <Route path="/en/sustainability" component={Sustainability} />
      <Route path="/en/contact" component={Contact} />
      <Route path="/en/journal" component={Journal} />
      <Route path="/en/shipping-returns" component={ShippingReturns} />
      <Route path="/en/size-guide" component={SizeGuide} />
      <Route path="/en/checkout" component={Checkout} />
      <Route path="/en/login" component={Login} />
      <Route path="/en/register" component={Register} />
      <Route path="/en/account" component={Account} />
      <Route path="/en/favorites" component={Favorites} />
      <Route path="/en/orders" component={Orders} />

      {/* Arabic Routes */}
      <Route path="/ar" component={Home} />
      <Route path="/ar/collections" component={Collections} />
      <Route path="/ar/product/:slug" component={ProductDetail} />
      <Route path="/ar/builder" component={SilhouetteBuilder} />
      <Route path="/ar/about" component={About} />
      <Route path="/ar/story" component={Story} />
      <Route path="/ar/sustainability" component={Sustainability} />
      <Route path="/ar/contact" component={Contact} />
      <Route path="/ar/journal" component={Journal} />
      <Route path="/ar/shipping-returns" component={ShippingReturns} />
      <Route path="/ar/size-guide" component={SizeGuide} />
      <Route path="/ar/checkout" component={Checkout} />
      <Route path="/ar/login" component={Login} />
      <Route path="/ar/register" component={Register} />
      <Route path="/ar/account" component={Account} />
      <Route path="/ar/favorites" component={Favorites} />
      <Route path="/ar/orders" component={Orders} />

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
