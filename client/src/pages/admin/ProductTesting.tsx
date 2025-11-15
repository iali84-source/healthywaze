import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import type { ProductTestingMetrics } from "@shared/schema";
import { useState } from "react";

export default function ProductTesting() {
  const { toast } = useToast();
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>("");

  const { data: metrics = [], isLoading } = useQuery<ProductTestingMetrics[]>({
    queryKey: ["/api/product-testing/metrics"],
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      setGeneratingInsights(true);
      const response = await apiRequest("POST", "/api/ai/product-insights", {});
      setGeneratingInsights(false);
      return response.json();
    },
    onSuccess: (data) => {
      setAiInsights(data.insights);
      toast({ title: "AI insights generated successfully!" });
    },
    onError: () => {
      setGeneratingInsights(false);
      toast({ title: "Failed to generate insights", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "winner":
        return "default";
      case "testing":
        return "secondary";
      case "loser":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "winner":
        return <TrendingUp className="h-4 w-4" />;
      case "loser":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const winners = metrics.filter(m => m.status === "winner");
  const losers = metrics.filter(m => m.status === "loser");
  const testing = metrics.filter(m => m.status === "testing");

  const totalProfit = metrics.reduce((sum, m) => sum + m.profit, 0);
  const totalAdSpend = metrics.reduce((sum, m) => sum + m.adSpend, 0);
  const averageROAS = totalAdSpend > 0 ? (metrics.reduce((sum, m) => sum + m.revenue, 0) / totalAdSpend) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Testing Lab</h1>
          <p className="mt-2 text-muted-foreground">
            Track ROI, ROAS, and profitability to find your winning products
          </p>
        </div>
        <Button
          onClick={() => generateInsightsMutation.mutate()}
          disabled={generatingInsights || metrics.length === 0}
          data-testid="button-generate-insights"
        >
          {generatingInsights ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Get AI Recommendations
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue - (Product Costs + Ad Spend)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROAS</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageROAS.toFixed(2)}x
            </div>
            <p className="text-xs text-muted-foreground">
              Return on Ad Spend (Target: 3x+)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-2xl font-bold text-primary">{winners.length}</span>
                <p className="text-xs text-muted-foreground">Winners</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-yellow-500">{testing.length}</span>
                <p className="text-xs text-muted-foreground">Testing</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-destructive">{losers.length}</span>
                <p className="text-xs text-muted-foreground">Losers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {aiInsights && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Product Advisor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm">
              {aiInsights}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Product Performance Metrics</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track which products are profitable and worth scaling
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : metrics.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No product data yet. Add products and track ad spend to see metrics.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Ad Spend</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                    <TableHead className="text-right">ROAS</TableHead>
                    <TableHead className="text-right">CPA</TableHead>
                    <TableHead className="text-right">Conv %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((product) => (
                    <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {product.recommendation}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{product.views}</TableCell>
                      <TableCell className="text-right">{product.sales}</TableCell>
                      <TableCell className="text-right">
                        ${product.revenue.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${product.adSpend.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={product.profit >= 0 ? "text-primary font-semibold" : "text-destructive"}>
                          ${product.profit.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={product.roi >= 100 ? "text-primary font-semibold" : ""}>
                          {product.roi.toFixed(0)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={product.roas >= 3 ? "text-primary font-semibold" : ""}>
                          {product.roas.toFixed(2)}x
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        ${product.cpa.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.conversionRate.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(product.status)} className="gap-1">
                          {getStatusIcon(product.status)}
                          {product.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>📊 Understanding Your Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <strong>ROAS (Return on Ad Spend):</strong> Revenue ÷ Ad Spend. Target 3x+ (every $1 spent returns $3)
          </div>
          <div>
            <strong>ROI (Return on Investment):</strong> (Profit ÷ Total Costs) × 100. Target 100%+ (double your money)
          </div>
          <div>
            <strong>CPA (Cost Per Acquisition):</strong> Ad Spend ÷ Sales. Lower is better
          </div>
          <div>
            <strong>Winner:</strong> ROAS ≥ 3x AND ROI ≥ 100% → SCALE THIS!
          </div>
          <div>
            <strong>Testing:</strong> Needs more data or hitting breakeven
          </div>
          <div>
            <strong>Loser:</strong> Losing money → KILL OR OPTIMIZE!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
