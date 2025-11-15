import { useQuery } from "@tanstack/react-query";
import { Truck } from "lucide-react";
import type { SiteSettings } from "@shared/schema";

export function PromoBanner() {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });

  if (!settings?.promoBannerEnabled) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary via-secondary to-primary text-white py-2 text-center text-sm font-medium" data-testid="promo-banner">
      <div className="container mx-auto px-4 flex items-center justify-center gap-2">
        <Truck className="h-4 w-4" />
        <span data-testid="text-promo-message">
          {settings?.promoBannerText || "Free Shipping on Orders Over $75 | 30-Day Money-Back Guarantee"}
        </span>
      </div>
    </div>
  );
}
