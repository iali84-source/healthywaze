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
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 py-16 md:py-24" data-testid="hero-section">
      <div className="container mx-auto px-4">
        <div className="text-center">
          {settings?.trustBadgeEnabled && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary" data-testid="badge-trust">
              <Sparkles className="h-4 w-4" />
              <span>{settings?.trustBadgeText || "13,000+ Happy Customers"}</span>
            </div>
          )}
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl" data-testid="text-hero-headline">
            {headlineParts[0]}
            {headlineParts.length > 1 && (
              <>
                <br />
                <span className="text-primary">{headlineParts[1]}</span>
              </>
            )}
          </h1>
          
          <p className="mb-10 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto" data-testid="text-hero-subheadline">
            {settings?.heroSubheadline || "Powerful products to help you stay energized, focused, and on track"}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-8 mb-10">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <span className="text-sm font-medium">{settings?.benefitOneText || "Feel Amazing"}</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <span className="text-sm font-medium">{settings?.benefitTwoText || "Stay Energized"}</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <span className="text-sm font-medium">{settings?.benefitThreeText || "Live Better"}</span>
            </div>
          </div>
          
          <Button size="lg" className="text-base px-8" data-testid="button-shop-now">
            {settings?.heroButtonText || "Shop Now"}
          </Button>
        </div>
      </div>
    </section>
  );
}
