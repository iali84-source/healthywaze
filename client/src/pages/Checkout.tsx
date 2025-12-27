import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckoutTrustIndicators } from "@/components/TrustBadges";
import { FreeShippingBar } from "@/components/ConversionBoosters";
import { ArrowLeft, Lock, AlertCircle, Plus, MapPin, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { CustomerAddress, Product } from "@shared/schema";

type PersistentCartItem = {
  id: number;
  cartId: string;
  productId: number;
  variantId: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product?: Product | null;
};

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface AddressFormData {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

const emptyAddress: AddressFormData = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
  phone: "",
};

const AddressForm = ({ 
  address, 
  onChange, 
  prefix 
}: { 
  address: AddressFormData; 
  onChange: (field: keyof AddressFormData, value: string) => void;
  prefix: string;
}) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor={`${prefix}-name`}>Full Name *</Label>
      <Input
        id={`${prefix}-name`}
        type="text"
        value={address.fullName}
        onChange={(e) => onChange("fullName", e.target.value)}
        required
        data-testid={`input-${prefix}-name`}
      />
    </div>
    <div>
      <Label htmlFor={`${prefix}-address1`}>Address Line 1 *</Label>
      <Input
        id={`${prefix}-address1`}
        type="text"
        value={address.addressLine1}
        onChange={(e) => onChange("addressLine1", e.target.value)}
        placeholder="Street address"
        required
        data-testid={`input-${prefix}-address1`}
      />
    </div>
    <div>
      <Label htmlFor={`${prefix}-address2`}>Address Line 2</Label>
      <Input
        id={`${prefix}-address2`}
        type="text"
        value={address.addressLine2}
        onChange={(e) => onChange("addressLine2", e.target.value)}
        placeholder="Apartment, suite, etc. (optional)"
        data-testid={`input-${prefix}-address2`}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor={`${prefix}-city`}>City *</Label>
        <Input
          id={`${prefix}-city`}
          type="text"
          value={address.city}
          onChange={(e) => onChange("city", e.target.value)}
          required
          data-testid={`input-${prefix}-city`}
        />
      </div>
      <div>
        <Label htmlFor={`${prefix}-state`}>State *</Label>
        <Input
          id={`${prefix}-state`}
          type="text"
          value={address.state}
          onChange={(e) => onChange("state", e.target.value)}
          required
          data-testid={`input-${prefix}-state`}
        />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor={`${prefix}-zip`}>ZIP Code *</Label>
        <Input
          id={`${prefix}-zip`}
          type="text"
          value={address.zip}
          onChange={(e) => onChange("zip", e.target.value)}
          required
          data-testid={`input-${prefix}-zip`}
        />
      </div>
      <div>
        <Label htmlFor={`${prefix}-country`}>Country *</Label>
        <Input
          id={`${prefix}-country`}
          type="text"
          value={address.country}
          onChange={(e) => onChange("country", e.target.value)}
          required
          data-testid={`input-${prefix}-country`}
        />
      </div>
    </div>
    <div>
      <Label htmlFor={`${prefix}-phone`}>Phone Number *</Label>
      <Input
        id={`${prefix}-phone`}
        type="tel"
        value={address.phone}
        onChange={(e) => onChange("phone", e.target.value)}
        required
        data-testid={`input-${prefix}-phone`}
      />
    </div>
  </div>
);

const CheckoutForm = ({ 
  cartItems, 
  onSuccess,
  clearCart
}: { 
  cartItems: PersistentCartItem[]; 
  onSuccess: (orderId: string) => void;
  clearCart: () => Promise<void>;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [customerEmail, setCustomerEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Address selection states
  const [selectedShippingId, setSelectedShippingId] = useState<string>("new");
  const [selectedBillingId, setSelectedBillingId] = useState<string>("same");
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  
  // New address forms
  const [shippingAddress, setShippingAddress] = useState<AddressFormData>(emptyAddress);
  const [billingAddress, setBillingAddress] = useState<AddressFormData>(emptyAddress);

  // Fetch saved addresses for logged-in users
  const { data: savedAddresses = [] } = useQuery<CustomerAddress[]>({
    queryKey: ["/api/addresses"],
    enabled: !!user,
  });

  // Set default address as selected on load
  useEffect(() => {
    const defaultAddress = savedAddresses.find(addr => addr.isDefault);
    if (defaultAddress && savedAddresses.length > 0) {
      setSelectedShippingId(defaultAddress.id.toString());
    }
  }, [savedAddresses]);

  const updateShippingField = (field: keyof AddressFormData, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const updateBillingField = (field: keyof AddressFormData, value: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }));
  };

  const getSelectedShippingAddress = (): AddressFormData | null => {
    if (selectedShippingId === "new") {
      return shippingAddress;
    }
    const saved = savedAddresses.find(a => a.id.toString() === selectedShippingId);
    if (saved) {
      return {
        fullName: saved.fullName,
        addressLine1: saved.addressLine1,
        addressLine2: saved.addressLine2 || "",
        city: saved.city,
        state: saved.state,
        zip: saved.zip,
        country: saved.country,
        phone: saved.phone || "",
      };
    }
    return null;
  };

  const getSelectedBillingAddress = (): AddressFormData | null => {
    if (billingSameAsShipping) {
      return getSelectedShippingAddress();
    }
    if (selectedBillingId === "new") {
      return billingAddress;
    }
    const saved = savedAddresses.find(a => a.id.toString() === selectedBillingId);
    if (saved) {
      return {
        fullName: saved.fullName,
        addressLine1: saved.addressLine1,
        addressLine2: saved.addressLine2 || "",
        city: saved.city,
        state: saved.state,
        zip: saved.zip,
        country: saved.country,
        phone: saved.phone || "",
      };
    }
    return null;
  };

  const validateAddress = (addr: AddressFormData | null, type: string): boolean => {
    if (!addr) {
      toast({
        title: "Missing address",
        description: `Please select or enter a ${type} address`,
        variant: "destructive",
      });
      return false;
    }
    
    const required = ["fullName", "addressLine1", "city", "state", "zip", "country", "phone"];
    for (const field of required) {
      if (!addr[field as keyof AddressFormData]) {
        toast({
          title: "Incomplete address",
          description: `Please complete all required ${type} address fields`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !customerEmail) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const shipping = getSelectedShippingAddress();
    const billing = getSelectedBillingAddress();

    if (!validateAddress(shipping, "shipping") || !validateAddress(billing, "billing")) {
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
        // Send order with structured addresses
        const orderData = {
          customerEmail,
          customerName: shipping!.fullName,
          customerPhone: shipping!.phone,
          shippingAddressLine1: shipping!.addressLine1,
          shippingAddressLine2: shipping!.addressLine2 || undefined,
          shippingCity: shipping!.city,
          shippingState: shipping!.state,
          shippingZip: shipping!.zip,
          shippingCountry: shipping!.country,
          billingSameAsShipping,
          billingAddressLine1: billing!.addressLine1,
          billingAddressLine2: billing!.addressLine2 || undefined,
          billingCity: billing!.city,
          billingState: billing!.state,
          billingZip: billing!.zip,
          billingCountry: billing!.country,
          stripePaymentIntentId: paymentIntent.id,
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        };

        const response = await apiRequest("POST", "/api/orders", orderData);
        const order = await response.json();
        
        await clearCart();
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
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
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && savedAddresses.length > 0 && (
            <div className="space-y-3">
              <Label>Select saved address or add new</Label>
              <RadioGroup value={selectedShippingId} onValueChange={setSelectedShippingId}>
                {savedAddresses.map((addr) => (
                  <div key={addr.id} className="flex items-start gap-3 p-3 rounded-md border hover-elevate">
                    <RadioGroupItem 
                      value={addr.id.toString()} 
                      id={`shipping-${addr.id}`}
                      data-testid={`radio-shipping-${addr.id}`}
                    />
                    <Label 
                      htmlFor={`shipping-${addr.id}`} 
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{addr.label || "Address"}</div>
                      <div className="text-sm text-muted-foreground">
                        {addr.fullName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {addr.addressLine1}
                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {addr.city}, {addr.state} {addr.zip}
                      </div>
                      {addr.isDefault && (
                        <div className="text-xs text-primary font-medium mt-1">Default</div>
                      )}
                    </Label>
                  </div>
                ))}
                <div className="flex items-center gap-3 p-3 rounded-md border hover-elevate">
                  <RadioGroupItem value="new" id="shipping-new" data-testid="radio-shipping-new" />
                  <Label htmlFor="shipping-new" className="cursor-pointer font-medium flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add new address
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
          
          {(!user || selectedShippingId === "new") && (
            <AddressForm 
              address={shippingAddress} 
              onChange={updateShippingField}
              prefix="shipping"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="same-as-shipping"
              checked={billingSameAsShipping}
              onCheckedChange={(checked) => {
                setBillingSameAsShipping(checked === true);
                if (checked) {
                  setSelectedBillingId("same");
                } else {
                  setSelectedBillingId("new");
                }
              }}
              data-testid="checkbox-same-as-shipping"
            />
            <Label htmlFor="same-as-shipping" className="cursor-pointer">
              Same as shipping address
            </Label>
          </div>

          {!billingSameAsShipping && (
            <>
              {user && savedAddresses.length > 0 && (
                <div className="space-y-3">
                  <Label>Select saved address or add new</Label>
                  <RadioGroup value={selectedBillingId} onValueChange={setSelectedBillingId}>
                    {savedAddresses.map((addr) => (
                      <div key={addr.id} className="flex items-start gap-3 p-3 rounded-md border hover-elevate">
                        <RadioGroupItem 
                          value={addr.id.toString()} 
                          id={`billing-${addr.id}`}
                          data-testid={`radio-billing-${addr.id}`}
                        />
                        <Label 
                          htmlFor={`billing-${addr.id}`} 
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{addr.label || "Address"}</div>
                          <div className="text-sm text-muted-foreground">
                            {addr.fullName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {addr.city}, {addr.state} {addr.zip}
                          </div>
                        </Label>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 p-3 rounded-md border hover-elevate">
                      <RadioGroupItem value="new" id="billing-new" data-testid="radio-billing-new" />
                      <Label htmlFor="billing-new" className="cursor-pointer font-medium flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add new address
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
              
              {selectedBillingId === "new" && (
                <AddressForm 
                  address={billingAddress} 
                  onChange={updateBillingField}
                  prefix="billing"
                />
              )}
            </>
          )}
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
  const { items: cartItems, clearCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (cartItems.length === 0) {
      return;
    }

    const itemsForPayment = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    apiRequest("POST", "/api/create-payment-intent", { items: itemsForPayment })
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
  }, [cartItems.length, toast]);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.unitPrice;
    return sum + parseFloat(price) * item.quantity;
  }, 0);

  const handleSuccess = (orderId: string) => {
    setLocation(`/order-confirmation?order=${orderId}`);
  };

  // Handle empty cart first
  if (cartItems.length === 0) {
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Your Cart is Empty
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Add some items to your cart before proceeding to checkout.
              </p>
              <Link href="/">
                <a>
                  <Button className="w-full mt-4" data-testid="button-continue-shopping">
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
    <div className="min-h-screen bg-background py-4 sm:py-6 md:py-8">
      <div className="container mx-auto max-w-4xl px-3 sm:px-4">
        <Link href="/">
          <a>
            <Button variant="ghost" size="sm" className="mb-4 sm:mb-6" data-testid="button-back">
              <ArrowLeft className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-sm">Continue shopping</span>
            </Button>
          </a>
        </Link>

        <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold">Checkout</h1>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <CheckoutTrustIndicators />
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm cartItems={cartItems} onSuccess={handleSuccess} clearCart={clearCart} />
            </Elements>
          </div>

          <div className="order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <FreeShippingBar currentTotal={subtotal} threshold={50} />
                {cartItems.map((item) => {
                  const price = item.product?.price || item.unitPrice;
                  const name = item.product?.name || 'Product';
                  return (
                    <div key={item.id} className="flex justify-between gap-2">
                      <span className="text-xs sm:text-sm">
                        {item.quantity}x {name}
                      </span>
                      <span className="text-xs sm:text-sm font-medium">
                        ${(parseFloat(price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                <Separator />
                <div className="flex justify-between text-base sm:text-lg font-bold">
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
