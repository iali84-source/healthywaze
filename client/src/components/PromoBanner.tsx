import { Truck } from "lucide-react";

export function PromoBanner() {
  return (
    <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-medium" data-testid="promo-banner">
      <div className="container mx-auto px-4 flex items-center justify-center gap-2">
        <Truck className="h-4 w-4" />
        <span data-testid="text-promo-message">Free Shipping on Orders Over $75 | 30-Day Money-Back Guarantee</span>
      </div>
    </div>
  );
}
