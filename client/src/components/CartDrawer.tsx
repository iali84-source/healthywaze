import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FreeShippingBar } from "@/components/ConversionBoosters";
import { Minus, Plus, X, Package } from "lucide-react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";

export function CartDrawer() {
  const [, setLocation] = useLocation();
  const { items, cartOpen, setCartOpen, updateQuantity, removeFromCart } = useCart();

  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.price || item.unitPrice;
    return sum + parseFloat(price) * item.quantity;
  }, 0);

  const handleCheckout = () => {
    setCartOpen(false);
    setLocation("/checkout");
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-auto py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <p className="text-lg text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add some products to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const price = item.product?.price || item.unitPrice;
                const name = item.product?.name || 'Product';
                const imageUrl = item.product?.imageUrl;
                
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-md border p-4"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h4 className="font-medium" data-testid={`text-cart-item-name-${item.id}`}>
                          {name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFromCart(item.id)}
                          data-testid={`button-remove-item-${item.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-md border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="min-w-8 text-center" data-testid={`text-quantity-${item.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-semibold" data-testid={`text-item-total-${item.id}`}>
                          ${(parseFloat(price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="flex-col gap-4">
            <FreeShippingBar currentTotal={subtotal} threshold={50} />
            <div className="flex items-center justify-between border-t pt-4 text-lg font-semibold">
              <span>Subtotal:</span>
              <span data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              data-testid="button-checkout"
            >
              Proceed to Checkout
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
