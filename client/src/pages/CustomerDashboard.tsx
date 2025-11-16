import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, TrendingUp, User } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import type { Order, Product } from "@shared/schema";

export default function CustomerDashboard() {
  const { user } = useAuth();

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
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
            Track your orders and discover new products
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
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

          <Card data-testid="card-account-status">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize" data-testid="text-account-status">
                {user?.role || 'Customer'}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card data-testid="card-recent-orders">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Your latest orders and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading orders...
                </div>
              ) : recentOrders.length === 0 ? (
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
                  {recentOrders.map((order) => (
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
                  {totalOrders > 5 && (
                    <Link href="/track-order">
                      <Button variant="outline" className="w-full" data-testid="button-view-all-orders">
                        View All Orders
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

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
                <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        <div className="flex justify-center">
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
