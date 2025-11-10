import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderConfirmation() {
  const [location] = useLocation();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const id = params.get("order");
    setOrderId(id);
  }, [location]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
            {orderId && (
              <p className="mt-4 text-sm">
                Order ID:{" "}
                <span className="font-mono font-semibold" data-testid="text-order-id">
                  {orderId}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You will receive an email confirmation shortly with your order details and tracking information.
            </p>
          </div>

          <Link href="/">
            <a>
              <Button size="lg" className="w-full" data-testid="button-continue-shopping">
                Continue Shopping
              </Button>
            </a>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
