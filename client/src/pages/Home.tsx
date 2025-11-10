import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { useToast } from "@/hooks/use-toast";
import type { Product, CartItem } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredProducts = products.filter(
    (p) =>
      p.isPublished &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader
        cartItemCount={cartItemCount}
        onCartClick={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold md:text-4xl">Discover Products</h1>
          <p className="mt-2 text-muted-foreground">
            Curated collection powered by AI insights
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse space-y-4"
                data-testid={`skeleton-product-${i}`}
              >
                <div className="aspect-[4/5] rounded-md bg-muted" />
                <div className="h-4 rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 text-center">
            <p className="text-lg text-muted-foreground">No products found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Check back soon for new products"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
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
