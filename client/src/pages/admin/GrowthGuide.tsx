import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, DollarSign, TrendingUp, Users, Mail, MessageSquare, Package, RefreshCw, Lightbulb, Share2, Gift, Search, BarChart3, AlertCircle, Smartphone, Rocket, BookOpen, Lightbulb as Tip } from "lucide-react";

export default function GrowthGuide() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Growth Features Guide</h1>
        <p className="mt-2 text-muted-foreground">
          Complete guide to all 18 features that increase sales, reduce costs, and automate your store
        </p>
      </div>

      <Alert>
        <Tip className="h-4 w-4" />
        <AlertDescription>
          <strong>Quick Start:</strong> Enable Email Automation, SMS Notifications, and Product Recommendations first for fastest ROI. These three features alone can increase revenue by 40-50%.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Sales 💰</TabsTrigger>
          <TabsTrigger value="automation">Automation ⚙️</TabsTrigger>
          <TabsTrigger value="operations">Operations 📦</TabsTrigger>
          <TabsTrigger value="conversion">Conversion 🎯</TabsTrigger>
          <TabsTrigger value="seo">SEO 🔍</TabsTrigger>
        </TabsList>

        {/* SALES FEATURES */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue-Boosting Features
              </CardTitle>
              <CardDescription>Increase average order value and customer lifetime value</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Feature 1: Abandoned Cart */}
              <div className="border-l-4 border-primary pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">1. Abandoned Cart Recovery</h3>
                  <Badge>+10-15% recovery</Badge>
                </div>
                <p className="text-muted-foreground">Auto-save customer carts to their account. Send automated email after 1 hour with 15% discount incentive.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Example:</strong> Customer adds $50 worth of products, leaves without checking out.</p>
                  <p>→ 1 hour later: Email arrives "Complete your order for 15% off"</p>
                  <p>→ <strong>Result:</strong> 10-15% recover and purchase</p>
                </div>
              </div>

              {/* Feature 2: Loyalty Program */}
              <div className="border-l-4 border-secondary pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">2. Loyalty Program</h3>
                  <Badge>+25% repeat rate</Badge>
                </div>
                <p className="text-muted-foreground">Customers earn 1 point per $1 spent. Auto-tier system: Bronze (0-500pts) → Silver (500-1000) → Gold (1000+).</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>How it works:</strong></p>
                  <p>• Customer spends $100 → earns 100 points</p>
                  <p>• Every 100 points = $1 discount at checkout</p>
                  <p>• Reach Silver tier → 5% off all purchases</p>
                </div>
              </div>

              {/* Feature 3: Product Recommendations */}
              <div className="border-l-4 border-accent pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">3. Smart Product Recommendations</h3>
                  <Badge>+15-20% AOV</Badge>
                </div>
                <p className="text-muted-foreground">AI shows "Customers Also Bought", related products, and seasonal recommendations on product pages and checkout.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Example:</strong> Customer viewing protein powder sees:</p>
                  <p>• "Frequently bought together": shaker bottle, creatine, vitamins</p>
                  <p>• Related products: other protein flavors, collagen powder</p>
                  <p>→ <strong>Result:</strong> Average order goes from $50 to $65 (30% increase)</p>
                </div>
              </div>

              {/* Feature 4: Discount Rules */}
              <div className="border-l-4 border-primary pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">4. Automated Discount Rules</h3>
                  <Badge>+15-20% AOV</Badge>
                </div>
                <p className="text-muted-foreground">Create smart discounts: "Buy 2 get 10% off", "First-time customer 15% off", time-limited flash sales.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Rules you can set:</strong></p>
                  <p>• Buy 2+ items → 10% off</p>
                  <p>• Spend $75+ → Free shipping</p>
                  <p>• First-time customers → 15% off</p>
                  <p>• Monday-Wednesday → Flash sale 20% off</p>
                </div>
              </div>

              {/* Feature 5: Upsells */}
              <div className="border-l-4 border-green-600 pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">5. One-Click Upsell on Thank You Page</h3>
                  <Badge>+10-20% on 10% orders</Badge>
                </div>
                <p className="text-muted-foreground">After checkout, show related product with "Add for $X" button. One-click purchasing.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Example:</strong> Customer just bought protein powder</p>
                  <p>→ "Add shaker bottle for $15" button appears</p>
                  <p>→ <strong>Result:</strong> 10-20% of customers add it instantly</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUTOMATION FEATURES */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automation & Marketing
              </CardTitle>
              <CardDescription>Save time, reduce manual work, keep customers engaged</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Feature 1: Email Automation */}
              <div className="border-l-4 border-primary pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">1. Email Automation Sequences</h3>
                  <Badge>+15-25% revenue</Badge>
                </div>
                <p className="text-muted-foreground">Automatically send emails at key moments: abandoned carts, order confirmation, shipping, win-back campaigns.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Automated sequence:</strong></p>
                  <p>• Abandoned cart (1hr after leaving): "You left X items"</p>
                  <p>• Purchase confirmation (instant): Order details + tracking</p>
                  <p>• Shipment notification (day after shipping): "Your order is on the way"</p>
                  <p>• Win-back (30 days inactive): "We miss you - 20% off"</p>
                </div>
              </div>

              {/* Feature 2: SMS Notifications */}
              <div className="border-l-4 border-blue-600 pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">2. SMS Order Notifications</h3>
                  <Badge>-40% support calls</Badge>
                </div>
                <p className="text-muted-foreground">98% open rate. Auto-send: order confirmed, shipped, delivered. Cost: ~$0.01 per SMS.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Messages sent automatically:</strong></p>
                  <p>• "Order #12345 confirmed - track: [link]"</p>
                  <p>• "Your order shipped! ETA: Dec 20"</p>
                  <p>• "Delivered! Rate your order"</p>
                </div>
              </div>

              {/* Feature 3: Customer Segmentation */}
              <div className="border-l-4 border-purple-600 pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">3. Customer Segmentation & Targeted Campaigns</h3>
                  <Badge>+30% email conversion</Badge>
                </div>
                <p className="text-muted-foreground">Automatically segment customers: high-value, at-risk, dormant. Send targeted emails to each group.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Auto-segments:</strong></p>
                  <p>• High-value ($500+ spent): VIP exclusive products</p>
                  <p>• At-risk (no purchase in 60 days): "We miss you - 25% off"</p>
                  <p>• Dormant (6+ months): Cleanup campaign or remove</p>
                </div>
              </div>

              {/* Feature 4: Social Media Posting */}
              <div className="border-l-4 border-pink-600 pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">4. Automated Social Media Posting</h3>
                  <Badge>+30% reach</Badge>
                </div>
                <p className="text-muted-foreground">Auto-post new products to Instagram/Pinterest with AI descriptions. Schedule weekly sales announcements.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Auto-posts to:</strong> Instagram, Pinterest, TikTok</p>
                  <p>• New product added → Instagram post instantly</p>
                  <p>• Sales alerts scheduled → Every Monday 9am</p>
                </div>
              </div>

              {/* Feature 5: Live Chat */}
              <div className="border-l-4 border-cyan-600 pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">5. Live Chat & AI Bot</h3>
                  <Badge>-60% support time</Badge>
                </div>
                <p className="text-muted-foreground">AI answers FAQ automatically. Complex questions route to human support. Cost: ~$29/month.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Common questions AI handles:</strong></p>
                  <p>• "What's your return policy?" → Auto-answer</p>
                  <p>• "How long is shipping?" → Auto-answer</p>
                  <p>• Complex issue → Route to human</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OPERATIONS FEATURES */}
        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Operational Efficiency
              </CardTitle>
              <CardDescription>Reduce manual work, eliminate errors, save hours daily</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Feature 1: Dynamic Inventory Sync */}
              <div className="border-l-4 border-primary pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">1. Dynamic Inventory Sync</h3>
                  <Badge>100% accuracy</Badge>
                </div>
                <p className="text-muted-foreground">Connect to supplier inventory APIs. Auto-sync stock levels. Hide out-of-stock items.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Before:</strong> Manual inventory updates, overselling, customer complaints</p>
                  <p><strong>After:</strong> Real-time sync, automatic updates, zero overselling</p>
                </div>
              </div>

              {/* Feature 2: Product Templates */}
              <div className="border-l-4 border-orange-600 pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">2. Product Templates & Bulk Cloning</h3>
                  <Badge>-80% setup time</Badge>
                </div>
                <p className="text-muted-foreground">Clone products between niches with one click. Auto-fill descriptions, swap images/pricing.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Workflow:</strong></p>
                  <p>1. Create product template in Niche A (Fitness)</p>
                  <p>2. Clone → Niche B (Wellness) with one click</p>
                  <p>3. Update images and pricing</p>
                  <p>→ Full product catalog ready in minutes vs hours</p>
                </div>
              </div>

              {/* Feature 3: Invoicing */}
              <div className="border-l-4 border-green-600 pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">3. Automated Invoice & Tax Calculation</h3>
                  <Badge>-90% admin time</Badge>
                </div>
                <p className="text-muted-foreground">Auto-generate invoices on purchase. Calculate sales tax by state/country. Export to QuickBooks/Xero.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Automated:</strong></p>
                  <p>• Invoice generation on checkout</p>
                  <p>• Tax calculation by location</p>
                  <p>• Weekly accounting export</p>
                </div>
              </div>

              {/* Feature 4: Supplier Orders */}
              <div className="border-l-4 border-red-600 pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">4. Supplier Order Management</h3>
                  <Badge>0% stockouts</Badge>
                </div>
                <p className="text-muted-foreground">Auto-generate purchase orders when stock drops below threshold. Track supplier performance.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Automated workflow:</strong></p>
                  <p>• Stock hits 20 units threshold</p>
                  <p>• PO auto-generated to supplier</p>
                  <p>• Tracking updated when restocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONVERSION FEATURES */}
        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Conversion Optimization
              </CardTitle>
              <CardDescription>Turn more visitors into customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Feature 1: A/B Testing */}
              <div className="border-l-4 border-primary pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">1. A/B Testing Framework</h3>
                  <Badge>+5-15% conversion</Badge>
                </div>
                <p className="text-muted-foreground">Test hero headline, button color, CTA copy. Auto-serve winning variant to 100% traffic.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Test examples:</strong></p>
                  <p>• Headline A: "Premium Fitness Gear" vs B: "Get Ripped Fast"</p>
                  <p>• Button A: Green vs B: Orange</p>
                  <p>• CTA A: "Shop Now" vs B: "Get Instant Access"</p>
                </div>
              </div>

              {/* Feature 2: Exit Popup */}
              <div className="border-l-4 border-yellow-600 pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">2. Exit-Intent Popup with Discount</h3>
                  <Badge>+5-10% recovery</Badge>
                </div>
                <p className="text-muted-foreground">Show "15% off your first order" when user tries to leave. Recover 5-10% of bounces.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Scenario:</strong> User browsing, moves mouse to close tab</p>
                  <p>→ Popup: "Wait! 15% off for first-time customers"</p>
                  <p>→ <strong>Result:</strong> 5-10% stay and purchase</p>
                </div>
              </div>

              {/* Feature 3: Smart Search */}
              <div className="border-l-4 border-blue-600 pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">3. Smart Search with Auto-Complete</h3>
                  <Badge>+20% search usage</Badge>
                </div>
                <p className="text-muted-foreground">AI-powered suggestions, typo correction, category recommendations. Reduce search time by 50%.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>Smart features:</strong></p>
                  <p>• User types "protien" → autocorrect to "protein"</p>
                  <p>• Shows trending searches</p>
                  <p>• Category suggestions on empty search</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO FEATURES */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO & Organic Traffic
              </CardTitle>
              <CardDescription>Get on Google's first page, rank for competitive keywords</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Feature 1: Auto Sitemaps */}
              <div className="border-l-4 border-primary pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">1. Auto-Generated Sitemaps & Meta Tags</h3>
                  <Badge>+30-50% organic traffic</Badge>
                </div>
                <p className="text-muted-foreground">Automatically generate XML sitemaps and meta tags. Add rich snippets for products, prices, ratings.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><strong>What gets automated:</strong></p>
                  <p>• XML sitemap (updated daily)</p>
                  <p>• Meta descriptions for every product</p>
                  <p>• Open Graph tags for social sharing</p>
                  <p>• Schema markup for prices & ratings</p>
                  <p>→ <strong>Impact:</strong> Google can crawl and rank you faster</p>
                </div>
              </div>

              <Alert>
                <Tip className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pro tip:</strong> Combine auto-sitemaps with product templates to create multiple niche sites that all rank well on Google. Each site automatically gets SEO-optimized.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ACTION PLAN */}
      <Card className="border-green-600 bg-green-50 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="text-green-700 dark:text-green-300">Your Action Plan: First 30 Days</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Badge className="bg-green-600">Week 1</Badge>
              <div>
                <p className="font-semibold">Enable Core Features</p>
                <p className="text-muted-foreground">Email Automation, SMS Notifications, Auto Sitemaps, Product Recommendations</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="bg-green-600">Week 2</Badge>
              <div>
                <p className="font-semibold">Conversion Optimization</p>
                <p className="text-muted-foreground">A/B Testing, Exit Popup, Abandoned Cart Recovery</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="bg-green-600">Week 3</Badge>
              <div>
                <p className="font-semibold">Operational Efficiency</p>
                <p className="text-muted-foreground">Inventory Sync, Product Templates, Invoicing</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="bg-green-600">Week 4</Badge>
              <div>
                <p className="font-semibold">Advanced Features</p>
                <p className="text-muted-foreground">Loyalty Program, Customer Segmentation, Social Media Posting</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
