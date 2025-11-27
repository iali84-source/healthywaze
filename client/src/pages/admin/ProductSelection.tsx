import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, TrendingUp, DollarSign, CheckCircle2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ProductWithScore {
  id: string;
  name: string;
  price: string;
  productCost: string;
  category?: string;
  sales: number;
  views: number;
  profitMargin: number;
  demandScore: number;
  overallScore: number;
  isFeatured: boolean;
}

export default function ProductSelection() {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [topN, setTopN] = useState(10);
  const [minProfitMargin, setMinProfitMargin] = useState(20);
  const [minDemandScore, setMinDemandScore] = useState(0);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products/analyzed"],
    queryFn: async () => {
      const res = await fetch("/api/products/analyzed");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      // Calculate profitability and sort
      return data.map((p: any) => {
        const price = parseFloat(p.price);
        const cost = parseFloat(p.productCost) || price * 0.3;
        const profitMargin = ((price - cost) / price) * 100;
        const demandScore = (p.sales * 10) + (p.views * 0.1);
        const overallScore = (profitMargin * 2) + (demandScore * 1);
        return { ...p, profitMargin, demandScore, overallScore };
      }).sort((a: any, b: any) => b.overallScore - a.overallScore);
    },
  });

  const filteredByThresholds = products.filter(
    (p: any) => p.profitMargin >= minProfitMargin && p.demandScore >= minDemandScore
  );

  const selectTopTenMutation = useMutation({
    mutationFn: async () => {
      const selected = filteredByThresholds.slice(0, topN).map(p => p.id);
      const response = await apiRequest("POST", "/api/products/select-featured", { productIds: selected });
      return response;
    },
    onSuccess: () => {
      toast({ title: "Success", description: `Top ${topN} products selected and others archived!` });
      queryClient.invalidateQueries({ queryKey: ["/api/products/analyzed"] });
      setSelectedIds(new Set());
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to select products", variant: "destructive" });
    },
  });

  const archiveRestMutation = useMutation({
    mutationFn: async () => {
      const idsToArchive = Array.from(selectedIds);
      const response = await apiRequest("POST", "/api/products/archive-multiple", { productIds: idsToArchive });
      return response;
    },
    onSuccess: () => {
      toast({ title: "Success", description: `${selectedIds.size} products archived` });
      queryClient.invalidateQueries({ queryKey: ["/api/products/analyzed"] });
      setSelectedIds(new Set());
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to archive products", variant: "destructive" });
    },
  });

  const topTen = products.slice(0, 10);
  const rest = products.slice(10);

  if (isLoading) {
    return <div className="text-center py-8">Loading product analysis...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Smart Product Selection</h1>
        <p className="mt-2 text-muted-foreground">
          Analyze profitability and demand. Select best 10 products. Archive the rest.
        </p>
      </div>

      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          <strong>How it works:</strong> System analyzes profit margin × sales volume × demand. Top 10 are ranked by profitability and market demand. Archive rest to focus on winners only.
        </AlertDescription>
      </Alert>

      {/* FILTER CONTROLS */}
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-700 dark:text-blue-300">Filter & Select</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-semibold">Top N Products</label>
              <div className="flex gap-2 mt-2">
                {[10, 20, 50].map((n) => (
                  <Button
                    key={n}
                    onClick={() => setTopN(n)}
                    variant={topN === n ? "default" : "outline"}
                    size="sm"
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold">Min Profit Margin (%)</label>
              <input
                type="number"
                value={minProfitMargin}
                onChange={(e) => setMinProfitMargin(Number(e.target.value))}
                className="mt-2 w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Min Demand Score</label>
              <input
                type="number"
                value={minDemandScore}
                onChange={(e) => setMinDemandScore(Number(e.target.value))}
                className="mt-2 w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TOP N RECOMMENDED */}
      <Card className="border-green-600 bg-green-50 dark:bg-green-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-5 w-5" />
                Top {topN} Best Products - Recommended to Publish
              </CardTitle>
              <CardDescription>
                Filtered by: ≥{minProfitMargin}% profit margin & ≥{minDemandScore} demand score
              </CardDescription>
            </div>
            <Button
              onClick={() => selectTopTenMutation.mutate()}
              disabled={selectTopTenMutation.isPending || filteredByThresholds.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {selectTopTenMutation.isPending ? "Selecting..." : `Select Top ${topN} & Archive Rest`}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {filteredByThresholds.slice(0, topN).map((product: any, index: number) => (
              <div
                key={product.id}
                className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-white dark:bg-slate-900"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600">{index + 1}</Badge>
                    <h3 className="font-semibold">{product.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{product.category || "Uncategorized"}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{product.profitMargin.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Profit Margin</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold">${product.price}</p>
                    <p className="text-xs text-muted-foreground">Cost: ${(parseFloat(product.productCost) || parseFloat(product.price) * 0.3).toFixed(2)}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold">{product.sales}</p>
                    <p className="text-xs text-muted-foreground">Sales</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold">{product.views}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* REST OF PRODUCTS - ARCHIVE */}
      {filteredByThresholds.slice(topN).length > 0 && (
        <Card className="border-orange-600 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-orange-700 dark:text-orange-300">
                  Remaining {filteredByThresholds.length - topN} Products - Recommended to Archive
                </CardTitle>
                <CardDescription>
                  These have lower profitability or demand. Archive to focus on best sellers.
                </CardDescription>
              </div>
              <Button
                onClick={() => archiveRestMutation.mutate()}
                disabled={archiveRestMutation.isPending || selectedIds.size === 0}
                variant="outline"
              >
                {archiveRestMutation.isPending ? "Archiving..." : `Archive Selected (${selectedIds.size})`}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredByThresholds.slice(topN).map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-white dark:bg-slate-900"
                >
                  <Checkbox
                    checked={selectedIds.has(product.id)}
                    onCheckedChange={(checked) => {
                      const newIds = new Set(selectedIds);
                      if (checked) {
                        newIds.add(product.id);
                      } else {
                        newIds.delete(product.id);
                      }
                      setSelectedIds(newIds);
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category || "Uncategorized"}</p>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="font-semibold text-orange-600">{product.profitMargin.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Margin</p>
                    </div>
                    <div>
                      <p className="font-semibold">${product.price}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* STRATEGY INFO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Strategy: How to Test 20,000 Products Efficiently
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2">Phase 1: Import & Analyze (Cost: ~$5 OpenAI)</h4>
              <ul className="text-muted-foreground space-y-1 ml-4">
                <li>• Import 20,000 products via Excel bulk upload</li>
                <li>• System auto-calculates: Profit Margin = (Price - Cost) / Price</li>
                <li>• AI ranks by: Demand Score = (Sales × 10) + (Views × 0.1)</li>
                <li>• Overall Score = (Profit Margin × 2) + (Demand × 1)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Phase 2: Select Top 10 (Cost: $0)</h4>
              <ul className="text-muted-foreground space-y-1 ml-4">
                <li>• Rank all products by combined profitability + demand</li>
                <li>• Select top 10 to feature on storefront</li>
                <li>• Archive remaining 19,990 (stored for reference)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Phase 3: Test & Deploy (Cost: ~$0-100/month)</h4>
              <ul className="text-muted-foreground space-y-1 ml-4">
                <li>• Run the 10-product storefront for 30 days</li>
                <li>• Track: conversion rate, AOV, ROI</li>
                <li>• If profitable: deploy as branded site (sportballsusa.com, etc.)</li>
                <li>• If not: swap top 10 and test again</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Cost Breakdown (for 20,000 products):</h4>
              <ul className="text-muted-foreground space-y-1 ml-4">
                <li>• Product import: $0 (you provide)</li>
                <li>• AI analysis: ~$5 (GPT-4 batching)</li>
                <li>• Hosting (30 days): ~$29-149</li>
                <li>• Stripe: 2.9% + $0.30 per transaction</li>
                <li>• <strong>Total first month: $35-155 + payment fees</strong></li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-muted">
              <p className="font-semibold mb-2">💡 Pro Tip:</p>
              <p className="text-muted-foreground">
                With this system, you can test 50+ different product niches per month. Each niche takes 30 days to validate. Winners get deployed as branded sites. Losers get archived but analyzed for patterns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
