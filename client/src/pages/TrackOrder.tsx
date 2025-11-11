import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  MapPin,
  Calendar,
} from "lucide-react";
import type { Order } from "@shared/schema";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [searchedOrderId, setSearchedOrderId] = useState("");

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["/api/orders", searchedOrderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${searchedOrderId}`);
      if (!response.ok) {
        throw new Error("Order not found");
      }
      return response.json();
    },
    enabled: !!searchedOrderId,
  });

  const handleSearch = () => {
    setSearchedOrderId(orderId);
  };

  const getStatusStep = (status: string) => {
    const steps = ["pending", "processing", "shipped", "completed"];
    return steps.indexOf(status) + 1;
  };

  const getStatusIcon = (status: string, currentStatus: string) => {
    const currentStep = getStatusStep(currentStatus);
    const thisStep = getStatusStep(status);
    
    if (thisStep < currentStep) {
      return <CheckCircle className="h-6 w-6 text-primary" />;
    } else if (thisStep === currentStep) {
      return <Clock className="h-6 w-6 text-primary animate-pulse" />;
    } else {
      return <div className="h-6 w-6 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Track Your Order</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your order ID to see the status
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter your order ID..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                data-testid="input-order-id"
              />
              <Button onClick={handleSearch} data-testid="button-track-order">
                <Search className="mr-2 h-4 w-4" />
                Track
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <Card>
            <CardContent className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 text-muted-foreground">Loading order...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">Order not found</p>
                <p className="text-sm text-muted-foreground">
                  Please check your order ID and try again
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {order && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="text-lg px-4 py-2">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Status Timeline */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Order Progress</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      {getStatusIcon("pending", order.status)}
                      <div className="flex-1">
                        <p className="font-medium">Order Placed</p>
                        <p className="text-sm text-muted-foreground">
                          We've received your order
                        </p>
                      </div>
                    </div>

                    <div className="ml-3 h-8 w-0.5 bg-muted" />

                    <div className="flex items-center gap-4">
                      {getStatusIcon("processing", order.status)}
                      <div className="flex-1">
                        <p className="font-medium">Processing</p>
                        <p className="text-sm text-muted-foreground">
                          We're preparing your items
                        </p>
                      </div>
                    </div>

                    <div className="ml-3 h-8 w-0.5 bg-muted" />

                    <div className="flex items-center gap-4">
                      {getStatusIcon("shipped", order.status)}
                      <div className="flex-1">
                        <p className="font-medium">Shipped</p>
                        <p className="text-sm text-muted-foreground">
                          Your order is on its way
                        </p>
                      </div>
                    </div>

                    <div className="ml-3 h-8 w-0.5 bg-muted" />

                    <div className="flex items-center gap-4">
                      {getStatusIcon("completed", order.status)}
                      <div className="flex-1">
                        <p className="font-medium">Delivered</p>
                        <p className="text-sm text-muted-foreground">
                          Package delivered successfully
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Shipping Information */}
                {order.trackingNumber && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Details
                    </h3>
                    <div className="rounded-lg bg-muted p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">Tracking Number</p>
                          <p className="text-lg font-mono font-semibold">
                            {order.trackingNumber}
                          </p>
                        </div>
                        <Badge variant="outline">{order.shippingProvider}</Badge>
                      </div>
                      {order.estimatedDelivery && (
                        <div className="flex items-center gap-2 pt-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">
                            Estimated delivery: <strong>{order.estimatedDelivery}</strong>
                          </p>
                        </div>
                      )}
                      {order.shippingNotes && (
                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground">
                            {order.shippingNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Delivery Address */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </h3>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Order Total */}
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">Order Total</p>
                  <p className="text-2xl font-bold">
                    ${parseFloat(order.total).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-sm text-muted-foreground">
                  <p>
                    Questions about your order? Contact us at{" "}
                    <a href="mailto:support@yourstore.com" className="text-primary hover:underline">
                      support@yourstore.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
