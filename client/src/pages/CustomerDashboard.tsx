import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingCart, TrendingUp, User, MapPin, Heart, Trash2, Plus, Star, Settings } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Order, Product, CustomerAddress } from "@shared/schema";

type SavedItem = {
  id: number;
  productId: number;
  product?: Product;
  createdAt: string;
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery<CustomerAddress[]>({
    queryKey: ['/api/addresses'],
  });

  const { data: savedItems, isLoading: savedLoading } = useQuery<SavedItem[]>({
    queryKey: ['/api/cart/saved'],
  });

  const moveToCartMutation = useMutation({
    mutationFn: async (savedId: number) => {
      await apiRequest('POST', `/api/cart/move-to-cart/${savedId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart/saved'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({ title: "Moved to cart", description: "Item has been added to your cart" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to move item to cart", variant: "destructive" });
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: number) => {
      await apiRequest('DELETE', `/api/addresses/${addressId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      toast({ title: "Address deleted", description: "Address has been removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete address", variant: "destructive" });
    }
  });

  const recentOrders = orders?.slice(0, 5) || [];
  const totalOrders = orders?.length || 0;
  const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;

  const topProducts = products
    ?.filter(p => p.isPublished)
    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 4) || [];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    processing: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    delivered: "bg-green-500/10 text-green-700 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-700 border-red-500/20",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-muted-foreground">
            Manage your orders, addresses, and saved items
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card data-testid="card-total-orders">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-orders">
                {totalOrders}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-spent">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-spent">
                ${totalSpent.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-saved-items">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Items</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-saved-count">
                {savedItems?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-addresses">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Addresses</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-address-count">
                {addresses?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-4 gap-2">
            <TabsTrigger value="orders" data-testid="tab-orders">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="saved" data-testid="tab-saved">
              <Heart className="h-4 w-4 mr-2" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="addresses" data-testid="tab-addresses">
              <MapPin className="h-4 w-4 mr-2" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="recommendations" data-testid="tab-recommendations">
              <TrendingUp className="h-4 w-4 mr-2" />
              For You
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card data-testid="card-recent-orders">
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  Track your orders and view order details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading orders...
                  </div>
                ) : orders?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4" data-testid="text-no-orders">
                      You haven't placed any orders yet
                    </p>
                    <Link href="/">
                      <Button data-testid="button-start-shopping">
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders?.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between gap-4 p-4 rounded-lg border hover-elevate"
                        data-testid={`card-order-${order.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium" data-testid={`text-order-id-${order.id}`}>
                              #{order.id.slice(0, 8)}
                            </span>
                            <Badge
                              variant="outline"
                              className={statusColors[order.status] || ""}
                              data-testid={`badge-status-${order.id}`}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold" data-testid={`text-order-total-${order.id}`}>
                            ${parseFloat(order.total).toFixed(2)}
                          </p>
                          <Link href={`/track-order?orderId=${order.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-track-${order.id}`}
                            >
                              Track
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card data-testid="card-saved-items">
              <CardHeader>
                <CardTitle>Saved for Later</CardTitle>
                <CardDescription>
                  Items you've saved to buy later
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading saved items...
                  </div>
                ) : !savedItems || savedItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4" data-testid="text-no-saved">
                      No saved items yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Save items from your cart to buy later
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {savedItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden" data-testid={`card-saved-${item.id}`}>
                        <div className="aspect-square relative overflow-hidden">
                          {item.product?.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Package className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-1 line-clamp-1">
                            {item.product?.name || 'Product unavailable'}
                          </h3>
                          <p className="text-lg font-bold text-primary mb-3">
                            ${item.product?.price ? parseFloat(item.product.price).toFixed(2) : '0.00'}
                          </p>
                          <Button
                            className="w-full"
                            size="sm"
                            onClick={() => moveToCartMutation.mutate(item.id)}
                            disabled={moveToCartMutation.isPending}
                            data-testid={`button-move-to-cart-${item.id}`}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Move to Cart
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card data-testid="card-addresses-list">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>
                    Manage your shipping and billing addresses
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {addressesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading addresses...
                  </div>
                ) : !addresses || addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4" data-testid="text-no-addresses">
                      No saved addresses yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Addresses will be saved during checkout
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="p-4 rounded-lg border relative"
                        data-testid={`card-address-${address.id}`}
                      >
                        {address.isDefault && (
                          <Badge className="absolute top-2 right-2" variant="secondary">
                            Default
                          </Badge>
                        )}
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">{address.fullName}</p>
                            <p className="text-sm text-muted-foreground">{address.addressLine1}</p>
                            {address.addressLine2 && (
                              <p className="text-sm text-muted-foreground">{address.addressLine2}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {address.city}, {address.state} {address.zip}
                            </p>
                            {address.phone && (
                              <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAddressMutation.mutate(address.id)}
                            disabled={deleteAddressMutation.isPending}
                            data-testid={`button-delete-address-${address.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card data-testid="card-recommendations">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recommended for You
                </CardTitle>
                <CardDescription>
                  Popular products you might like
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading recommendations...
                  </div>
                ) : topProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No products available
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {topProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        data-testid={`link-product-${product.id}`}
                      >
                        <Card className="overflow-hidden hover-elevate cursor-pointer">
                          <div className="aspect-square relative overflow-hidden">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="object-cover w-full h-full"
                                data-testid={`img-product-${product.id}`}
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <Package className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-semibold text-sm mb-1 line-clamp-1" data-testid={`text-product-name-${product.id}`}>
                              {product.name}
                            </h3>
                            <p className="text-lg font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
                              ${parseFloat(product.price).toFixed(2)}
                            </p>
                            {product.sales > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {product.sales} sold
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center gap-4 mt-8">
          <Link href="/loyalty">
            <Button variant="outline" size="lg" data-testid="button-view-loyalty">
              <Star className="h-4 w-4 mr-2" />
              View Rewards
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" data-testid="button-continue-shopping">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
