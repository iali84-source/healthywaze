import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, Loader2, Calendar, DollarSign, Search, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DemandAnalysis {
  productId: string;
  productName: string;
  demandScore: number;
  trendScore: number;
  seasonality: string;
  competitionLevel: "High" | "Medium" | "Low";
  priceOptimization: string;
  searchDemand: string;
  recommendation: string;
  insights: string;
}

export default function DemandAnalyzer() {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<DemandAnalysis[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/analyze-demand", {});
      return response.json();
    },
    onSuccess: (data) => {
      const analyzedCount = data.analyzedProducts || 0;
      setAnalysis(data.analysis || []);
      setTotalProducts(data.totalProducts || 0);
      
      if (analyzedCount === 0) {
        toast({ 
          title: "No analysis results",
          description: "AI couldn't analyze products. Please try again.",
          variant: "destructive",
        });
      } else if (analyzedCount < data.totalProducts) {
        toast({ 
          title: "Partial analysis complete", 
          description: `Analyzed ${analyzedCount} of ${data.totalProducts} products`,
        });
      } else {
        toast({ 
          title: "Demand analysis complete!", 
          description: `Analyzed all ${analyzedCount} products`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze product demand",
        variant: "destructive",
      });
    },
  });

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case "High": return "text-destructive";
      case "Medium": return "text-primary";
      case "Low": return "text-green-600 dark:text-green-400";
      default: return "text-muted-foreground";
    }
  };

  const getDemandScoreVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 8) return "default";
    if (score >= 6) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Demand Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Analyze product demand trends and market opportunities using AI-powered insights
        </p>
      </div>

      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Google Search Demand Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI analyzes market trends, seasonality, competition, and search demand to rank your products by opportunity
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            size="lg"
            className="w-full sm:w-auto"
            data-testid="button-analyze-demand"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Market Demand...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analyze Product Demand
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">In catalog</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">High Demand</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-high-demand-count">
                  {analysis.filter(p => p.demandScore >= 8).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Score ≥ 8.0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Medium Demand</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary" data-testid="text-medium-demand-count">
                  {analysis.filter(p => p.demandScore >= 6 && p.demandScore < 8).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Score 6.0-7.9</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Low Demand</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive" data-testid="text-low-demand-count">
                  {analysis.filter(p => p.demandScore < 6).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Score &lt; 6.0</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Demand Rankings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Products ranked by AI-analyzed market demand score
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Demand Score</TableHead>
                      <TableHead className="text-center">Trend</TableHead>
                      <TableHead>Competition</TableHead>
                      <TableHead>Search Demand</TableHead>
                      <TableHead>Seasonality</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.map((product, index) => (
                      <TableRow key={product.productId} data-testid={`row-demand-${product.productId}`}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-semibold" data-testid={`text-product-name-${product.productId}`}>
                              {product.productName}
                            </p>
                            {product.insights && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2" data-testid={`text-insights-${product.productId}`}>
                                {product.insights}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={getDemandScoreVariant(product.demandScore)} 
                            className="font-mono"
                            data-testid={`badge-demand-score-${product.productId}`}
                          >
                            {product.demandScore.toFixed(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1" data-testid={`text-trend-score-${product.productId}`}>
                            {product.trendScore >= 7 ? (
                              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                            <span className="font-mono text-sm">{product.trendScore}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={getCompetitionColor(product.competitionLevel)}>
                            {product.competitionLevel}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Search className="h-3 w-3" />
                            <span className="text-xs">{product.searchDemand}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm max-w-xs">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="text-xs line-clamp-2">{product.seasonality}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-xs line-clamp-3">{product.recommendation}</p>
                            {product.priceOptimization && (
                              <div className="flex items-start gap-1 mt-1">
                                <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {product.priceOptimization}
                                </p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                How to Use These Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong className="text-green-600 dark:text-green-400">High Demand (8.0+):</strong> Promote heavily, increase inventory, optimize listings
              </div>
              <div>
                <strong className="text-primary">Medium Demand (6.0-7.9):</strong> Monitor trends, consider bundling with high-demand products
              </div>
              <div>
                <strong className="text-destructive">Low Demand (&lt;6.0):</strong> Evaluate if worth keeping, consider price adjustments or phase out
              </div>
              <div className="pt-3 border-t">
                <strong>Trend Score:</strong> Indicates growth trajectory. Scores 7+ suggest rising demand
              </div>
              <div>
                <strong>Competition Level:</strong> Low = opportunity, High = saturated market
              </div>
              <div>
                <strong>Seasonality:</strong> Plan inventory and promotions around peak demand periods
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
