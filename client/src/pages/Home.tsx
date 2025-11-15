import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PromoBanner } from "@/components/PromoBanner";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { TrustBadges } from "@/components/TrustBadges";
import { SocialProofNotification, ExitIntentPopup, UrgencyTimer } from "@/components/ConversionBoosters";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Product, CartItem } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load cart:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (product: Product) => {
    const existing = cartItems.find((item) => item.productId === product.id);

    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl || undefined,
        },
      ]);
    }

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter((item) => item.productId !== productId));
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    });
  };

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter((c): c is string => Boolean(c))))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return p.isPublished && matchesSearch && matchesCategory;
  });

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleEmailCapture = (email: string) => {
    toast({
      title: "Discount code sent!",
      description: "Check your email for your 15% off code",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PromoBanner />
      <StorefrontHeader
        cartItemCount={cartItemCount}
        onCartClick={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <HeroSection />

      {/* Conversion Boosters */}
      <SocialProofNotification />
      <ExitIntentPopup onEmailCapture={handleEmailCapture} />

      <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
        {/* Flash Sale Timer */}
        <div className="max-w-2xl mx-auto mb-8">
          <UrgencyTimer label="Limited Time Offer Ends In" />
        </div>

        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-2 sm:mb-3">
            Shop by Category
          </h2>
          <p className="text-center text-sm sm:text-base text-muted-foreground mb-6 sm:mb-10">
            Discover products tailored to your wellness goals
          </p>

          {categories.length > 1 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-3 lg:grid-cols-5 mb-10 sm:mb-16">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`group relative overflow-hidden rounded-lg sm:rounded-xl border-2 p-4 sm:p-6 text-center transition-all hover-elevate ${
                    selectedCategory === category
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid={`button-category-${category}`}
                >
                  <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                    <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted group-hover:bg-primary/10"
                    } transition-colors`}>
                      <span className="text-lg sm:text-xl font-bold">
                        {category.charAt(0)}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">{category}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-6">
            {selectedCategory === "All" ? "All Products" : selectedCategory}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse space-y-3 sm:space-y-4"
                data-testid={`skeleton-product-${i}`}
              >
                <div className="aspect-[4/5] rounded-lg bg-muted" />
                <div className="h-3 sm:h-4 rounded bg-muted" />
                <div className="h-3 sm:h-4 w-2/3 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-[300px] sm:min-h-[400px] flex-col items-center justify-center gap-2 sm:gap-3 text-center px-4">
            <p className="text-lg sm:text-xl font-medium text-muted-foreground">No products found</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Check back soon for new arrivals"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>

      <TrustBadges />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}
