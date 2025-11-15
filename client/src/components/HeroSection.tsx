import { useQuery } from "@tanstack/react-query";
import { Sparkles, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@shared/schema";

export function HeroSection() {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });

  const headline = settings?.heroHeadline || "Your Wellness Journey\nMade Simple";
  const headlineParts = headline.split('\n');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 py-10 sm:py-16 md:py-24" data-testid="hero-section">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center">
          {settings?.trustBadgeEnabled && (
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary" data-testid="badge-trust">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{settings?.trustBadgeText || "13,000+ Happy Customers"}</span>
            </div>
          )}
          
          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight px-2" data-testid="text-hero-headline">
            {headlineParts[0]}
            {headlineParts.length > 1 && (
              <>
                <br />
                <span className="text-primary">{headlineParts[1]}</span>
              </>
            )}
          </h1>
          
          <p className="mb-8 sm:mb-10 text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4" data-testid="text-hero-subheadline">
            {settings?.heroSubheadline || "Powerful products to help you stay energized, focused, and on track"}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <span className="text-xs sm:text-sm font-medium">{settings?.benefitOneText || "Feel Amazing"}</span>
            </div>
            
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <span className="text-xs sm:text-sm font-medium">{settings?.benefitTwoText || "Stay Energized"}</span>
            </div>
            
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <span className="text-xs sm:text-sm font-medium">{settings?.benefitThreeText || "Live Better"}</span>
            </div>
          </div>
          
          <Button size="lg" className="text-sm sm:text-base px-6 sm:px-8" data-testid="button-shop-now">
            {settings?.heroButtonText || "Shop Now"}
          </Button>
        </div>
      </div>
    </section>
  );
}
