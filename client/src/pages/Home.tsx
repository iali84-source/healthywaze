import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { StorefrontFooter } from "@/components/StorefrontFooter";
import { TrustBadges } from "@/components/TrustBadges";
import { SocialProofNotification, FreeShippingBar } from "@/components/ConversionBoosters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CartDrawer } from "@/components/CartDrawer";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ShoppingCart,
  Shield,
  Heart,
  Truck,
  Leaf,
  Star,
  ChevronRight,
  Package,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { Product, CartItem, SiteSettings } from "@shared/schema";
import healthyWazeLogo from "@assets/generated_images/healthywaze_professional_wellness_logo.png";

export default function Home() {
  const { toast } = useToast();
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/subscribe", { email, category: "all" });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome to the family!",
        description: data.message,
      });
      setEmail("");
    },
    onError: (error: any) => {
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
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
      description: `${product.name} added to cart`,
    });
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter((item) => item.productId !== productId));
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const publishedProducts = products.filter((p) => p.isPublished);
  const featuredProducts = publishedProducts.filter((p) => p.isFeatured);
  const categories = Array.from(new Set(publishedProducts.map((p) => p.category).filter((c): c is string => c !== null && c !== undefined)));

  const filteredProducts = publishedProducts.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate(email);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StorefrontHeader
        cartItemCount={cartItemCount}
        onCartClick={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge variant="secondary" className="mb-2" data-testid="badge-hero-tag">
                  <Heart className="w-3 h-3 mr-1" />
                  Family-Owned Wellness
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-hero-headline">
                  {siteSettings?.heroHeadline || "Trusted Wellness Essentials Handpicked by Real Families"}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl" data-testid="text-hero-subheadline">
                  {siteSettings?.heroSubheadline || "We're not just another wellness store. We're a family that personally tests every product we recommend. Clean ingredients, proven results, delivered with care."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="gap-2" 
                    data-testid="button-shop-now"
                    onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {siteSettings?.heroButtonText || "Shop Wellness"}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="gap-2" 
                    data-testid="button-learn-more"
                    onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Sparkles className="w-5 h-5" />
                    Why Families Trust Us
                  </Button>
                </div>
                {/* Trust Strip */}
                <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Family-Tested</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>30-Day Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" />
                    <span>Free Shipping $50+</span>
                  </div>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <img
                    src={healthyWazeLogo}
                    alt="Healthywaze - Family Wellness"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Bar */}
        <section className="border-y bg-muted/30 py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex items-center justify-center gap-3" data-testid="benefit-clean">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{siteSettings?.benefitOneText || "Certified Clean Ingredients"}</div>
                  <div className="text-sm text-muted-foreground">No harmful additives</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3" data-testid="benefit-tested">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{siteSettings?.benefitTwoText || "Family-Tested Products"}</div>
                  <div className="text-sm text-muted-foreground">We use what we sell</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3" data-testid="benefit-guarantee">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{siteSettings?.benefitThreeText || "100% Satisfaction Guarantee"}</div>
                  <div className="text-sm text-muted-foreground">30-day money back</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
                  <p className="text-muted-foreground mt-1">Our family's top picks for your wellness journey</p>
                </div>
                <Button variant="ghost" className="gap-1" data-testid="button-view-all-featured">
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Category Filter & All Products */}
        <section id="products" className="py-12 md:py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Shop All Products</h2>
                <p className="text-muted-foreground mt-1">
                  {filteredProducts.length} products available
                </p>
              </div>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    data-testid="button-category-all"
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category || null)}
                      data-testid={`button-category-${category}`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-muted rounded-t-lg" />
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : "Products coming soon! Subscribe to get notified."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Email Signup Section */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                <Star className="w-3 h-3 mr-1" />
                Join Our Wellness Family
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-signup-headline">
                Get Exclusive Wellness Tips & Offers
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Join thousands of families who receive our weekly wellness insights, new product announcements, and exclusive member-only discounts.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                  data-testid="input-subscribe-email"
                />
                <Button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="gap-2"
                  data-testid="button-subscribe"
                >
                  {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section id="story" className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge variant="outline">
                  <Heart className="w-3 h-3 mr-1" />
                  Our Story
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold">
                  A Family's Mission to Transform Wellness
                </h2>
                <p className="text-muted-foreground text-lg">
                  Healthywaze started around our family dinner table. Frustrated by confusing labels and questionable ingredients in mainstream wellness products, we decided to create a platform that curates only the products we'd give to our own children.
                </p>
                <p className="text-muted-foreground">
                  Every product on Healthywaze is personally tested by our family. We believe in transparency, clean ingredients, and building genuine relationships with the brands we partner with. This isn't just a business—it's our way of helping families like yours live healthier, happier lives.
                </p>
                <div className="flex gap-4">
                  <Link href="/about">
                    <Button variant="outline" className="gap-2" data-testid="button-learn-story">
                      Read Our Full Story
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-muted/30 rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Every Product Personally Tested</div>
                    <div className="text-sm text-muted-foreground">By our family before it reaches yours</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Ingredient Transparency</div>
                    <div className="text-sm text-muted-foreground">Know exactly what you're putting in your body</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Family Values First</div>
                    <div className="text-sm text-muted-foreground">We treat every customer like family</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <TrustBadges />
      </main>

      <StorefrontFooter />

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      {/* Social Proof */}
      <SocialProofNotification />
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: () => void;
}) {
  const price = parseFloat(product.price);
  const inStock = product.stock > 0;

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group overflow-hidden hover-elevate cursor-pointer h-full" data-testid={`card-product-${product.id}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          {product.isFeatured && (
            <Badge className="absolute top-2 left-2" variant="secondary">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <Badge className="absolute top-2 right-2" variant="destructive">
              Only {product.stock} left
            </Badge>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          {product.category && (
            <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          )}
          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold" data-testid={`text-price-${product.id}`}>
              ${price.toFixed(2)}
            </span>
            <Button
              size="sm"
              disabled={!inStock}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart();
              }}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
