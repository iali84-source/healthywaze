import { ShoppingCart, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import healthyWazeLogo from "@assets/generated_images/healthywaze_professional_wellness_logo.png";

interface StorefrontHeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function StorefrontHeader({ cartItemCount, onCartClick, searchQuery, onSearchChange }: StorefrontHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover-elevate rounded-md px-2 sm:px-3 py-2" data-testid="link-home">
            <img 
              src={healthyWazeLogo} 
              alt="Healthywaze Logo" 
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
            />
            <span className="hidden text-base sm:text-lg font-bold md:inline">Healthywaze</span>
          </Link>

          <div className="flex flex-1 items-center justify-center px-1 sm:px-4 max-w-sm sm:max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 sm:pl-10 text-sm h-9"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <Link href="/blog" className="hidden sm:inline-block text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-blog">
              Blog
            </Link>
            <Link href="/about" className="hidden sm:inline-block text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-about">
              About
            </Link>
            <Link href="/auth" className="hidden sm:inline-block text-xs font-medium text-muted-foreground hover-elevate px-2 py-2 rounded-md" data-testid="link-admin">
              Admin
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={onCartClick}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs"
                  data-testid="badge-cart-count"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
