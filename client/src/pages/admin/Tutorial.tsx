import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  BarChart3,
  ShoppingCart,
  TrendingUp,
  Bell,
  CheckCircle,
} from "lucide-react";

export default function Tutorial() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">AI Tools Tutorial</h1>
        <p className="mt-2 text-muted-foreground">
          Learn how to use AI-powered features to optimize your e-commerce business
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="descriptions">AI Descriptions</TabsTrigger>
          <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
          <TabsTrigger value="google">Google Analytics</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to ShopAI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-relaxed">
                ShopAI combines powerful AI tools with Google Analytics to help you run a
                highly automated, data-driven e-commerce business with minimal daily involvement.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">AI Product Descriptions</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generate compelling, SEO-optimized product descriptions instantly
                  </p>
                </div>

                <div className="space-y-2 rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">AI Performance Analysis</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get intelligent insights on which products to focus on
                  </p>
                </div>

                <div className="space-y-2 rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Google Analytics Integration</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track customer behavior and conversion metrics in real-time
                  </p>
                </div>

                <div className="space-y-2 rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Automated Notifications</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive SMS alerts for new orders and important events
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="descriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Product Description Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">How It Works</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The AI description generator uses OpenAI's GPT-5 model to create
                  compelling, conversion-focused product descriptions based on your product name.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Step-by-Step Guide</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">1</Badge>
                    <span>Go to <strong>Products</strong> in the admin sidebar</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">2</Badge>
                    <span>Click <strong>Add Product</strong> button</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">3</Badge>
                    <span>Enter your product name in the form</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">4</Badge>
                    <span>Click <strong>Generate with AI</strong> button below the description field</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">5</Badge>
                    <span>Review and edit the generated description as needed</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">6</Badge>
                    <span>Complete the rest of the product details and save</span>
                  </li>
                </ol>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Pro Tips
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Use descriptive product names for better AI-generated descriptions</li>
                  <li>• You can regenerate descriptions multiple times to get different variations</li>
                  <li>• Always review and personalize AI content to match your brand voice</li>
                  <li>• Include key features or benefits in the product name for richer descriptions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                AI Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">What It Does</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The AI analyzer reviews your product performance data and provides actionable
                  insights on which products to promote, which to improve, and opportunities
                  for growth.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">How to Use</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">1</Badge>
                    <span>Navigate to <strong>Analytics</strong> in the admin sidebar</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">2</Badge>
                    <span>Click <strong>Generate AI Insights</strong> button</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">3</Badge>
                    <span>Wait a few seconds while AI analyzes your data</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">4</Badge>
                    <span>Review the insights and recommendations</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">5</Badge>
                    <span>Take action on the suggestions to optimize your store</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Understanding the Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="rounded-md border p-3">
                    <strong>Conversion Rate:</strong>
                    <p className="text-muted-foreground">
                      Percentage of product views that result in sales. Higher is better (5%+ is excellent).
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <strong>Views vs Sales:</strong>
                    <p className="text-muted-foreground">
                      High views but low sales may indicate pricing issues or poor product descriptions.
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <strong>Revenue per Product:</strong>
                    <p className="text-muted-foreground">
                      Focus your marketing efforts on products generating the most revenue.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="google" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Google Analytics 4 Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">What's Being Tracked</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Google Analytics automatically tracks all user interactions on your store:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Page views and navigation patterns</li>
                  <li>• Product views and engagement</li>
                  <li>• Add to cart events</li>
                  <li>• Checkout initiations</li>
                  <li>• Purchase completions</li>
                  <li>• User demographics and behavior</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Accessing Your Data</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">1</Badge>
                    <span>Log into your Google Analytics account at analytics.google.com</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">2</Badge>
                    <span>Select your property (website)</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">3</Badge>
                    <span>View real-time data in the <strong>Realtime</strong> report</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">4</Badge>
                    <span>Check <strong>Events</strong> to see product interactions</span>
                  </li>
                  <li className="flex gap-2">
                    <Badge className="h-6 w-6 items-center justify-center p-0">5</Badge>
                    <span>Use <strong>Conversions</strong> to track purchases</span>
                  </li>
                </ol>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Key Reports to Monitor
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Acquisition:</strong> Where your traffic comes from</li>
                  <li>• <strong>Engagement:</strong> Which products get the most attention</li>
                  <li>• <strong>Monetization:</strong> Revenue and purchase behavior</li>
                  <li>• <strong>Retention:</strong> Returning vs new customers</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="best-practices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Best Practices for Success</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Product Testing Strategy
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>1. Start Small:</strong> Add 5-10 products to test the market</li>
                  <li><strong>2. Use AI Descriptions:</strong> Generate compelling copy for each product</li>
                  <li><strong>3. Set Competitive Pricing:</strong> Research competitors and price strategically</li>
                  <li><strong>4. Monitor for 1 Week:</strong> Give each product at least 7 days to gather data</li>
                  <li><strong>5. Analyze Performance:</strong> Use AI insights to identify winners</li>
                  <li><strong>6. Double Down:</strong> Focus marketing on top-performing products</li>
                  <li><strong>7. Remove Losers:</strong> Unpublish products with poor conversion rates</li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Optimization Tips
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="rounded-md border p-3">
                    <strong>Inventory Management:</strong>
                    <p className="text-muted-foreground">
                      Stock decreases automatically with sales. Low stock badges create urgency.
                      Keep top sellers well-stocked.
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <strong>Product Images:</strong>
                    <p className="text-muted-foreground">
                      High-quality images significantly improve conversion rates. Use consistent
                      4:5 aspect ratio for professional appearance.
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <strong>Pricing Psychology:</strong>
                    <p className="text-muted-foreground">
                      Use .99 or .97 pricing (e.g., $29.99 instead of $30.00). Test different
                      price points to find the sweet spot.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-primary/10 p-4">
                <h3 className="mb-2 font-semibold">Daily Routine (5 minutes)</h3>
                <ol className="space-y-1 text-sm">
                  <li>1. Check new orders in Orders tab (or wait for SMS notification)</li>
                  <li>2. Review Dashboard metrics for unusual patterns</li>
                  <li>3. Update order statuses as needed</li>
                  <li>4. Restock products running low</li>
                </ol>
              </div>

              <div className="rounded-md bg-primary/10 p-4">
                <h3 className="mb-2 font-semibold">Weekly Review (15 minutes)</h3>
                <ol className="space-y-1 text-sm">
                  <li>1. Generate AI insights in Analytics tab</li>
                  <li>2. Review top and bottom performing products</li>
                  <li>3. Unpublish products with poor conversion rates</li>
                  <li>4. Add new products to test</li>
                  <li>5. Check Google Analytics for traffic trends</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
