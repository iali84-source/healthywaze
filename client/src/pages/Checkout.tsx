import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Lock, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { CartItem } from "@shared/schema";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutForm = ({ cartItems, onSuccess }: { cartItems: CartItem[], onSuccess: (orderId: string) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !customerEmail || !customerName || !shippingAddress) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/order-confirmation",
          receipt_email: customerEmail,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        const orderData = {
          customerEmail,
          customerName,
          customerPhone: customerPhone || undefined,
          shippingAddress,
          total: cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0),
          stripePaymentIntentId: paymentIntent.id,
          items: cartItems.map(item => ({
            productId: item.productId,
            productName: item.name,
            productPrice: item.price,
            quantity: item.quantity,
          })),
        };

        const response = await apiRequest("POST", "/api/orders", orderData);
        const order = await response.json();
        
        localStorage.removeItem("cart");
        onSuccess(order.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              data-testid="input-email"
            />
          </div>
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              data-testid="input-name"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              data-testid="input-phone"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="address">Full Address *</Label>
          <Input
            id="address"
            type="text"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="123 Main St, City, State, ZIP"
            required
            data-testid="input-address"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || isProcessing}
        data-testid="button-place-order"
      >
        {isProcessing ? "Processing..." : "Place Order"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Lock className="mr-1 inline h-3 w-3" />
        Secure checkout powered by Stripe
      </p>
    </form>
  );
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        const items = JSON.parse(saved);
        if (items.length === 0) {
          setLocation("/");
          return;
        }
        setCartItems(items);

        const total = items.reduce((sum: number, item: CartItem) => {
          return sum + parseFloat(item.price) * item.quantity;
        }, 0);

        apiRequest("POST", "/api/create-payment-intent", { amount: total })
          .then((res) => res.json())
          .then((data) => {
            setClientSecret(data.clientSecret);
          })
          .catch((error) => {
            toast({
              title: "Error",
              description: "Failed to initialize checkout",
              variant: "destructive",
            });
          });
      } catch (e) {
        setLocation("/");
      }
    } else {
      setLocation("/");
    }
  }, [setLocation, toast]);

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.price) * item.quantity;
  }, 0);

  const handleSuccess = (orderId: string) => {
    setLocation(`/order-confirmation?order=${orderId}`);
  };

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <Link href="/">
            <a>
              <Button variant="ghost" className="mb-6" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to store
              </Button>
            </a>
          </Link>
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Payment System Not Configured
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The payment system is not currently configured. To enable checkout:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Get your Stripe API keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dashboard.stripe.com/apikeys</a></li>
                <li>Add VITE_STRIPE_PUBLIC_KEY and STRIPE_SECRET_KEY to your environment</li>
                <li>Restart the application</li>
              </ol>
              <Link href="/">
                <a>
                  <Button className="w-full mt-4">
                    Continue Shopping
                  </Button>
                </a>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <Link href="/">
          <a>
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue shopping
            </Button>
          </a>
        </Link>

        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm cartItems={cartItems} onSuccess={handleSuccess} />
            </Elements>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between gap-2">
                    <span className="text-sm">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-sm font-medium">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span data-testid="text-order-total">${subtotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
