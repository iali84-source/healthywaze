import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  GraduationCap,
  Store,
  Settings,
  TrendingUp,
} from "lucide-react";
import { Zap, Layers, BookMarked, Wrench, Mail, FileText, Target } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import healthyWazeLogo from "@assets/generated_images/healthywaze_professional_wellness_logo.png";

const adminItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: Package,
  },
  {
    title: "Product Selection",
    url: "/admin/products/selection",
    icon: TrendingUp,
  },
  {
    title: "Archived Products",
    url: "/admin/products/archived",
    icon: Layers,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Demand Analyzer",
    url: "/admin/demand-analyzer",
    icon: TrendingUp,
  },
  {
    title: "Features Manager",
    url: "/admin/features",
    icon: Zap,
  },
  {
    title: "Growth Guide",
    url: "/admin/growth-guide",
    icon: BookMarked,
  },
  {
    title: "Newsletter",
    url: "/admin/newsletter",
    icon: Mail,
  },
  {
    title: "Blog Manager",
    url: "/admin/blog",
    icon: FileText,
  },
  {
    title: "Marketing ROI",
    url: "/admin/marketing",
    icon: Target,
  },
  {
    title: "Site Settings",
    url: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Getting Started",
    url: "/admin/tutorial",
    icon: GraduationCap,
  },
  {
    title: "Debug & Health",
    url: "/admin/debug",
    icon: Wrench,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  // Show nothing while loading auth
  if (isLoading) {
    return (
      <Sidebar>
        <SidebarContent>
          <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Only show admin sidebar if user is admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <img 
                src={healthyWazeLogo} 
                alt="Healthywaze Logo" 
                className="h-6 w-6 object-contain"
              />
              <span>Admin Dashboard</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(" ", "-")}`}
                    className="h-11 text-base"
                  >
                    <Link href={item.url}>
                      <a className="flex items-center gap-3 w-full">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </a>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel>Storefront</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="link-view-store" className="h-11 text-base">
                  <Link href="/">
                    <a className="flex items-center gap-3 w-full">
                      <Store className="h-5 w-5" />
                      <span>View Store</span>
                    </a>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
