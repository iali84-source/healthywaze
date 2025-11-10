import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { AnalyticsData } from "@shared/schema";

export default function Analytics() {
  const { toast } = useToast();
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const generateInsightsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/ai/analyze-performance", {}),
    onSuccess: async (response) => {
      const data = await response.json();
      setAiInsights(data.insights);
      toast({ title: "AI insights generated successfully!" });
    },
    onError: () => {
      toast({
        title: "Failed to generate insights",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="mt-2 text-muted-foreground">
            Detailed insights and performance metrics
          </p>
        </div>
        <Button
          onClick={() => generateInsightsMutation.mutate()}
          disabled={generateInsightsMutation.isPending || isLoading}
          data-testid="button-generate-insights"
        >
          {generateInsightsMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Insights
            </>
          )}
        </Button>
      </div>

      {aiInsights && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none" data-testid="text-ai-insights">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {aiInsights}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="text-3xl font-bold" data-testid="text-total-revenue">
                  ${analytics?.totalRevenue.toFixed(2) || "0.00"}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  From {analytics?.totalOrders || 0} orders
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="text-3xl font-bold" data-testid="text-total-views">
                  {analytics?.totalViews.toLocaleString() || 0}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Product page views
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="text-3xl font-bold" data-testid="text-conversion-rate">
                  {analytics?.conversionRate.toFixed(2) || "0.00"}%
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Views to purchases
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : !analytics?.topProducts || analytics.topProducts.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No product data available yet
            </p>
          ) : (
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-4 rounded-md border p-4"
                  data-testid={`product-analytics-${product.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{product.views} views</span>
                        <span>{product.sales} sales</span>
                        <span>${product.revenue.toFixed(2)} revenue</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        product.conversionRate >= 5 ? "default" : "secondary"
                      }
                    >
                      {product.conversionRate >= 5 ? (
                        <TrendingUp className="mr-1 h-3 w-3" />
                      ) : (
                        <TrendingDown className="mr-1 h-3 w-3" />
                      )}
                      {product.conversionRate.toFixed(1)}% conv.
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
