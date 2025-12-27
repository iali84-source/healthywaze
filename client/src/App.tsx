import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AboutUs from "@/pages/AboutUs";
import Contact from "@/pages/Contact";
import ProductDetail from "@/pages/ProductDetail";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import TrackOrder from "@/pages/TrackOrder";
import CustomerDashboard from "@/pages/CustomerDashboard";
import LoyaltyDashboard from "@/pages/LoyaltyDashboard";
import Dashboard from "@/pages/admin/Dashboard";
import Products from "@/pages/admin/Products";
import Orders from "@/pages/admin/Orders";
import Analytics from "@/pages/admin/Analytics";
import Accounting from "@/pages/admin/Accounting";
import DemandAnalyzer from "@/pages/admin/DemandAnalyzer";
import Tutorial from "@/pages/admin/Tutorial";
import SiteSettings from "@/pages/admin/SiteSettings";
import Features from "@/pages/admin/Features";
import ProductArchive from "@/pages/admin/ProductArchive";
import GrowthGuide from "@/pages/admin/GrowthGuide";
import ProductSelection from "@/pages/admin/ProductSelection";
import DebugDashboard from "@/pages/admin/DebugDashboard";
import Newsletter from "@/pages/admin/Newsletter";
import BlogManager from "@/pages/admin/BlogManager";
import AuthPage from "@/pages/AuthPage";
import LogoShowcase from "@/pages/LogoShowcase";
import Blog from "@/pages/Blog";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import { ProtectedRoute } from "@/lib/protected-route";
import { AiChatbot } from "@/components/AiChatbot";

function AdminPage() {
  const { isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user || user.role !== 'admin') {
    return <Redirect to="/auth" />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center gap-4 border-b px-6">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <AdminPageRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AdminPageRouter() {
  return (
    <Switch>
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/products" component={Products} />
      <Route path="/admin/products/selection" component={ProductSelection} />
      <Route path="/admin/products/archived" component={ProductArchive} />
      <Route path="/admin/orders" component={Orders} />
      <Route path="/admin/analytics" component={Analytics} />
      <Route path="/admin/accounting" component={Accounting} />
      <Route path="/admin/demand-analyzer" component={DemandAnalyzer} />
      <Route path="/admin/features" component={Features} />
      <Route path="/admin/growth-guide" component={GrowthGuide} />
      <Route path="/admin/debug" component={DebugDashboard} />
      <Route path="/admin/settings" component={SiteSettings} />
      <Route path="/admin/tutorial" component={Tutorial} />
      <Route path="/admin/newsletter" component={Newsletter} />
      <Route path="/admin/blog" component={BlogManager} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  useAnalytics();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Switch>
            {/* Auth route */}
            <Route path="/auth" component={AuthPage} />
            
            {/* Admin routes - match any /admin path */}
            <Route path="/admin" component={AdminPage} />
            <Route path="/admin/products" component={AdminPage} />
            <Route path="/admin/products/:id" component={AdminPage} />
            <Route path="/admin/orders" component={AdminPage} />
            <Route path="/admin/analytics" component={AdminPage} />
            <Route path="/admin/accounting" component={AdminPage} />
            <Route path="/admin/demand-analyzer" component={AdminPage} />
            <Route path="/admin/features" component={AdminPage} />
            <Route path="/admin/growth-guide" component={AdminPage} />
            <Route path="/admin/debug" component={AdminPage} />
            <Route path="/admin/settings" component={AdminPage} />
            <Route path="/admin/tutorial" component={AdminPage} />
            <Route path="/admin/newsletter" component={AdminPage} />
            <Route path="/admin/blog" component={AdminPage} />
            
            {/* Logo Showcase */}
            <Route path="/logo" component={LogoShowcase} />
            
            {/* Blog routes */}
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:slug">
              {(params) => <Blog params={params} />}
            </Route>
            
            {/* Storefront routes */}
            <Route path="/" component={Home} />
            <Route path="/about" component={AboutUs} />
            <Route path="/contact" component={Contact} />
            <Route path="/product/:id" component={ProductDetail} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/order-confirmation" component={OrderConfirmation} />
            <Route path="/track-order" component={TrackOrder} />
            <ProtectedRoute path="/dashboard" component={CustomerDashboard} requireRole="customer" />
            <ProtectedRoute path="/loyalty" component={LoyaltyDashboard} requireRole="customer" />
            
            {/* 404 */}
            <Route component={NotFound} />
            </Switch>
            <Toaster />
            <AiChatbot />
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
