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
import { Zap, Layers, BookMarked } from "lucide-react"
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
    title: "Site Settings",
    url: "/admin/settings",
    icon: Settings,
  },
  {
    title: "AI Tutorial",
    url: "/admin/tutorial",
    icon: GraduationCap,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">
                SA
              </div>
              <span>ShopAI Admin</span>
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
