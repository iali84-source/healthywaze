import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Eye, TrendingUp } from "lucide-react";
import type { AnalyticsData, Order } from "@shared/schema";

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const isLoading = analyticsLoading || ordersLoading;

  const metrics = [
    {
      title: "Total Revenue",
      value: `$${analytics?.totalRevenue.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      trend: "+12.5%",
    },
    {
      title: "Total Orders",
      value: analytics?.totalOrders || 0,
      icon: ShoppingCart,
      trend: "+8.2%",
    },
    {
      title: "Total Views",
      value: analytics?.totalViews || 0,
      icon: Eye,
      trend: "+18.3%",
    },
    {
      title: "Conversion Rate",
      value: `${analytics?.conversionRate.toFixed(1) || "0.0"}%`,
      icon: TrendingUp,
      trend: "+2.1%",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Overview of your store performance
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-24 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.title} data-testid={`card-${metric.title.toLowerCase().replace(" ", "-")}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`text-${metric.title.toLowerCase().replace(" ", "-")}`}>
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary">{metric.trend}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : analytics?.topProducts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No sales data yet
              </p>
            ) : (
              <div className="space-y-4">
                {analytics?.topProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between"
                    data-testid={`product-row-${product.id}`}
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.sales} sales • {product.views} views
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${product.revenue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.conversionRate.toFixed(1)}% conv.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No orders yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between"
                    data-testid={`order-row-${order.id}`}
                  >
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${parseFloat(order.total).toFixed(2)}
                      </p>
                      <p className="text-sm capitalize text-muted-foreground">
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
