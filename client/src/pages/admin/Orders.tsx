import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Mail,
  MessageSquare,
  Truck,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import type { Order } from "@shared/schema";

export default function Orders() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shippingData, setShippingData] = useState({
    trackingNumber: "",
    shippingProvider: "",
    estimatedDelivery: "",
    shippingNotes: "",
  });

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Order> }) =>
      apiRequest("PATCH", `/api/orders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order updated successfully" });
      setSelectedOrder(null);
    },
    onError: () => {
      toast({ title: "Failed to update order", variant: "destructive" });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: ({ orderId, type }: { orderId: string; type: "email" | "sms" }) =>
      apiRequest("POST", `/api/notifications/send`, { orderId, type }),
    onSuccess: (_, variables) => {
      toast({
        title: `${variables.type === "email" ? "Email" : "SMS"} sent successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: error.message || "Notification service not configured",
        description: "Please add your email/SMS API keys in Settings",
        variant: "destructive",
      });
    },
  });

  const handleUpdateShipping = () => {
    if (!selectedOrder) return;
    updateOrderMutation.mutate({
      id: selectedOrder.id,
      data: shippingData,
    });
  };

  const handleQuickStatusUpdate = (orderId: string, status: string) => {
    updateOrderMutation.mutate({ id: orderId, data: { status } });
  };

  const openShippingDialog = (order: Order) => {
    setSelectedOrder(order);
    setShippingData({
      trackingNumber: order.trackingNumber || "",
      shippingProvider: order.shippingProvider || "",
      estimatedDelivery: order.estimatedDelivery || "",
      shippingNotes: order.shippingNotes || "",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "shipped":
        return "default";
      case "processing":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="mt-2 text-muted-foreground">
            Manage orders and shipping
          </p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 w-full rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <p className="mt-2 text-muted-foreground">
          Manage orders, shipping, and customer communications
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No orders yet</p>
              <p className="text-sm text-muted-foreground">
                Orders will appear here when customers make purchases
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} data-testid={`card-order-${order.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Customer
                    </h3>
                    <div className="space-y-1">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customerEmail}
                      </p>
                      {order.customerPhone && (
                        <p className="text-sm text-muted-foreground">
                          {order.customerPhone}
                        </p>
                      )}
                    </div>
                    <div className="pt-2">
                      <p className="text-sm font-medium">Shipping Address</p>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingAddress}
                      </p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Shipping
                    </h3>
                    {order.trackingNumber ? (
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Tracking Number</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {order.trackingNumber}
                          </p>
                        </div>
                        {order.shippingProvider && (
                          <div>
                            <p className="text-sm font-medium">Carrier</p>
                            <p className="text-sm text-muted-foreground">
                              {order.shippingProvider}
                            </p>
                          </div>
                        )}
                        {order.estimatedDelivery && (
                          <div>
                            <p className="text-sm font-medium">Estimated Delivery</p>
                            <p className="text-sm text-muted-foreground">
                              {order.estimatedDelivery}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No tracking information yet
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Order Total</h3>
                    <p className="text-3xl font-bold">
                      ${parseFloat(order.total).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => openShippingDialog(order)}
                        data-testid={`button-add-shipping-${order.id}`}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        {order.trackingNumber ? "Update Shipping" : "Add Shipping Info"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Shipping Information</DialogTitle>
                        <DialogDescription>
                          Add tracking details to notify the customer
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="trackingNumber">Tracking Number</Label>
                          <Input
                            id="trackingNumber"
                            placeholder="1Z999AA10123456784"
                            value={shippingData.trackingNumber}
                            onChange={(e) =>
                              setShippingData({
                                ...shippingData,
                                trackingNumber: e.target.value,
                              })
                            }
                            data-testid="input-tracking-number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="shippingProvider">Shipping Provider</Label>
                          <Select
                            value={shippingData.shippingProvider}
                            onValueChange={(value) =>
                              setShippingData({ ...shippingData, shippingProvider: value })
                            }
                          >
                            <SelectTrigger data-testid="select-shipping-provider">
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UPS">UPS</SelectItem>
                              <SelectItem value="FedEx">FedEx</SelectItem>
                              <SelectItem value="USPS">USPS</SelectItem>
                              <SelectItem value="DHL">DHL</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                          <Input
                            id="estimatedDelivery"
                            type="date"
                            value={shippingData.estimatedDelivery}
                            onChange={(e) =>
                              setShippingData({
                                ...shippingData,
                                estimatedDelivery: e.target.value,
                              })
                            }
                            data-testid="input-estimated-delivery"
                          />
                        </div>
                        <div>
                          <Label htmlFor="shippingNotes">Notes (optional)</Label>
                          <Textarea
                            id="shippingNotes"
                            placeholder="Any special delivery instructions..."
                            value={shippingData.shippingNotes}
                            onChange={(e) =>
                              setShippingData({
                                ...shippingData,
                                shippingNotes: e.target.value,
                              })
                            }
                            data-testid="textarea-shipping-notes"
                          />
                        </div>
                        <Button
                          onClick={handleUpdateShipping}
                          className="w-full"
                          disabled={!shippingData.trackingNumber}
                          data-testid="button-save-shipping"
                        >
                          Save Shipping Info
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      sendNotificationMutation.mutate({ orderId: order.id, type: "email" })
                    }
                    data-testid={`button-email-customer-${order.id}`}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email Customer
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      sendNotificationMutation.mutate({ orderId: order.id, type: "sms" })
                    }
                    data-testid={`button-sms-customer-${order.id}`}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send SMS
                  </Button>

                  <Select
                    value={order.status}
                    onValueChange={(value) => handleQuickStatusUpdate(order.id, value)}
                  >
                    <SelectTrigger className="w-[160px]" data-testid={`select-status-${order.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Mark as Pending</SelectItem>
                      <SelectItem value="processing">Mark as Processing</SelectItem>
                      <SelectItem value="shipped">Mark as Shipped</SelectItem>
                      <SelectItem value="completed">Mark as Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
