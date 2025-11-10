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
import Dashboard from "@/pages/admin/Dashboard";
import Products from "@/pages/admin/Products";
import Orders from "@/pages/admin/Orders";
import Analytics from "@/pages/admin/Analytics";
import Tutorial from "@/pages/admin/Tutorial";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";

function StorefrontRouter() {
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminRouter() {
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/products" component={Products} />
      <Route path="/admin/orders" component={Orders} />
      <Route path="/admin/analytics" component={Analytics} />
      <Route path="/admin/tutorial" component={Tutorial} />
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

  const isAdminRoute = window.location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    const style = {
      "--sidebar-width": "16rem",
      "--sidebar-width-icon": "3rem",
    };

    return (
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StorefrontRouter />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
