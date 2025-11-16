import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import TrackOrder from "@/pages/TrackOrder";
import CustomerDashboard from "@/pages/CustomerDashboard";
import Dashboard from "@/pages/admin/Dashboard";
import Products from "@/pages/admin/Products";
import Orders from "@/pages/admin/Orders";
import Analytics from "@/pages/admin/Analytics";
import DemandAnalyzer from "@/pages/admin/DemandAnalyzer";
import Tutorial from "@/pages/admin/Tutorial";
import SiteSettings from "@/pages/admin/SiteSettings";
import AuthPage from "@/pages/AuthPage";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function StorefrontRouter() {
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route path="/track-order" component={TrackOrder} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={CustomerDashboard} requireRole="customer" />
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminRouter() {
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/admin" component={Dashboard} requireRole="admin" />
      <ProtectedRoute path="/admin/products" component={Products} requireRole="admin" />
      <ProtectedRoute path="/admin/orders" component={Orders} requireRole="admin" />
      <ProtectedRoute path="/admin/analytics" component={Analytics} requireRole="admin" />
      <ProtectedRoute path="/admin/demand-analyzer" component={DemandAnalyzer} requireRole="admin" />
      <ProtectedRoute path="/admin/settings" component={SiteSettings} requireRole="admin" />
      <ProtectedRoute path="/admin/tutorial" component={Tutorial} requireRole="admin" />
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

  const isAdminRoute = window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/auth');

  if (isAdminRoute) {
    const style = {
      "--sidebar-width": "16rem",
      "--sidebar-width-icon": "3rem",
    };

    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <SidebarProvider style={style as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-1 flex-col">
                  <header className="flex h-16 items-center gap-4 border-b px-6">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                  </header>
                  <main className="flex-1 overflow-auto p-6">
                    <AdminRouter />
                  </main>
                </div>
              </div>
            </SidebarProvider>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <StorefrontRouter />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
