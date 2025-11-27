import { useQuery } from "@tanstack/react-query";
import { Sparkles, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@shared/schema";
import heroImage from "@assets/stock_images/fitness_health_welln_0180cca4.jpg";

export function HeroSection() {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });

  const headline = settings?.heroHeadline || "Your Wellness Journey\nMade Simple";
  const headlineParts = headline.split('\n');

  return (
    <section className="relative overflow-hidden py-10 sm:py-16 md:py-24" data-testid="hero-section">
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Fitness and wellness" 
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-secondary/20"></div>
      </div>
      <div className="container relative z-10 mx-auto px-3 sm:px-4">
        <div className="text-center">
          {settings?.trustBadgeEnabled && (
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-lg" data-testid="badge-trust">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{settings?.trustBadgeText || "13,000+ Happy Customers"}</span>
            </div>
          )}
          
          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight px-2 text-white drop-shadow-lg" data-testid="text-hero-headline">
            {headlineParts[0]}
            {headlineParts.length > 1 && (
              <>
                <br />
                <span className="text-secondary">{headlineParts[1]}</span>
              </>
            )}
          </h1>
          
          <p className="mb-8 sm:mb-10 text-sm sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto px-4 drop-shadow-md" data-testid="text-hero-subheadline">
            {settings?.heroSubheadline || "Natural Wellness Solutions Trusted by Families"}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/90 shadow-lg">
                <Heart className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-white drop-shadow">{settings?.benefitOneText || "Feel Amazing"}</span>
            </div>
            
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-secondary/90 shadow-lg">
                <Zap className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-white drop-shadow">{settings?.benefitTwoText || "Stay Energized"}</span>
            </div>
            
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-accent/90 shadow-lg">
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-white drop-shadow">{settings?.benefitThreeText || "Live Better"}</span>
            </div>
          </div>
          
          <Button size="lg" className="text-sm sm:text-base px-6 sm:px-8 shadow-xl hover:scale-105 transition-transform" data-testid="button-shop-now">
            {settings?.heroButtonText || "Shop Now"}
          </Button>
        </div>
      </div>
    </section>
  );
}
