import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Product, CartItem } from "@shared/schema";
import { CartDrawer } from "@/components/CartDrawer";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const { toast } = useToast();
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
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

  const handleAddToCart = () => {
    if (!product) return;

    const existing = cartItems.find((item) => item.productId === product.id);

    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
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
          quantity,
          imageUrl: product.imageUrl || undefined,
        },
      ]);
    }

    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added to cart`,
    });

    setQuantity(1);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <StorefrontHeader
          cartItemCount={cartItemCount}
          onCartClick={() => setCartOpen(true)}
          searchQuery=""
          onSearchChange={() => {}}
        />
        <div className="container mx-auto animate-pulse px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square rounded-lg bg-muted" />
            <div className="space-y-4">
              <div className="h-8 rounded bg-muted" />
              <div className="h-4 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <StorefrontHeader
          cartItemCount={cartItemCount}
          onCartClick={() => setCartOpen(true)}
          searchQuery=""
          onSearchChange={() => {}}
        />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link href="/">
            <a>
              <Button className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to store
              </Button>
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const price = parseFloat(product.price);
  const inStock = product.stock > 0;

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader
        cartItemCount={cartItemCount}
        onCartClick={() => setCartOpen(true)}
        searchQuery=""
        onSearchChange={() => {}}
      />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <Link href="/">
          <a>
            <Button variant="ghost" size="sm" className="mb-4 sm:mb-6" data-testid="button-back">
              <ArrowLeft className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-sm">Back to products</span>
            </Button>
          </a>
        </Link>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="overflow-hidden rounded-lg bg-muted">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
                data-testid="img-product"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center">
                <Package className="h-24 w-24 sm:h-32 sm:w-32 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold lg:text-4xl" data-testid="text-product-name">
                {product.name}
              </h1>
              <div className="mt-3 sm:mt-4 flex flex-wrap items-baseline gap-3 sm:gap-4">
                <span className="text-3xl sm:text-4xl font-bold" data-testid="text-price">
                  ${price.toFixed(2)}
                </span>
                {!inStock && <Badge variant="secondary">Out of Stock</Badge>}
                {inStock && product.stock <= 5 && (
                  <Badge variant="destructive">Only {product.stock} left!</Badge>
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-base sm:text-lg font-semibold">Description</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed" data-testid="text-description">
                {product.description}
              </p>
            </div>

            <div className="mt-auto space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <label className="text-sm sm:text-base font-medium">Quantity:</label>
                <div className="flex items-center gap-2 rounded-md border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    data-testid="button-decrease-quantity"
                  >
                    -
                  </Button>
                  <span className="min-w-10 sm:min-w-12 text-center text-sm sm:text-base" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    data-testid="button-increase-quantity"
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full text-sm sm:text-base"
                disabled={!inStock}
                onClick={handleAddToCart}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </div>
      </main>

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
