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
      <Route path="/olustur" component={SilhouetteBuilder} />
      <Route path="/hakkimizda" component={About} />
      <Route path="/hikayemiz" component={Story} />
      <Route path="/surdurulebilirlik" component={Sustainability} />
      <Route path="/iletisim" component={Contact} />
      <Route path="/journal" component={Journal} />
      <Route path="/kargo-iade" component={ShippingReturns} />
      <Route path="/beden-rehberi" component={SizeGuide} />
      <Route path="/odeme" component={Checkout} />
      
      {/* English Routes */}
      <Route path="/en" component={Home} />
      <Route path="/en/collections" component={Collections} />
      <Route path="/en/builder" component={SilhouetteBuilder} />
      <Route path="/en/about" component={About} />
      <Route path="/en/story" component={Story} />
      <Route path="/en/sustainability" component={Sustainability} />
      <Route path="/en/contact" component={Contact} />
      <Route path="/en/journal" component={Journal} />
      <Route path="/en/shipping-returns" component={ShippingReturns} />
      <Route path="/en/size-guide" component={SizeGuide} />
      <Route path="/en/checkout" component={Checkout} />
      
      {/* Arabic Routes */}
      <Route path="/ar" component={Home} />
      <Route path="/ar/collections" component={Collections} />
      <Route path="/ar/builder" component={SilhouetteBuilder} />
      <Route path="/ar/about" component={About} />
      <Route path="/ar/story" component={Story} />
      <Route path="/ar/sustainability" component={Sustainability} />
      <Route path="/ar/contact" component={Contact} />
      <Route path="/ar/journal" component={Journal} />
      <Route path="/ar/shipping-returns" component={ShippingReturns} />
      <Route path="/ar/size-guide" component={SizeGuide} />
      <Route path="/ar/checkout" component={Checkout} />
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <LanguageProvider>
          <ThemeProvider defaultTheme="light">
            <TooltipProvider>
              <Toaster />
              <CartDrawer />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </LanguageProvider>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
