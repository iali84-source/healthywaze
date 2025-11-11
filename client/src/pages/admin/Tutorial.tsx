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
  Search,
  Package,
  Truck,
  Mail,
} from "lucide-react";

export default function Tutorial() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Complete Store Guide</h1>
        <p className="mt-2 text-muted-foreground">
          Everything you need to run a successful e-commerce business
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="finding">Find Products</TabsTrigger>
          <TabsTrigger value="adding">Add Products</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="descriptions">AI Tools</TabsTrigger>
          <TabsTrigger value="google">Analytics</TabsTrigger>
          <TabsTrigger value="best-practices">Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Your E-Commerce Platform</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-relaxed">
                This platform helps you run a highly automated, data-driven online store
                with minimal daily involvement. Use AI to generate content, track performance,
                and make smart decisions about your inventory.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Product Research</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Discover trending products and profitable niches
                  </p>
                </div>

                <div className="space-y-2 rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">AI Product Descriptions</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generate compelling copy instantly with GPT-5
                  </p>
                </div>

                <div className="space-y-2 rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Shipping Management</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track orders and notify customers automatically
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                How to Find Best Products to Sell
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-lg">Product Research Strategies</h3>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold mb-2">1. Trending Product Research</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>Google Trends:</strong> Search for products and see interest over time</li>
                      <li>• <strong>TikTok/Instagram:</strong> Look for viral products with high engagement</li>
                      <li>• <strong>Amazon Best Sellers:</strong> Check top-selling items in various categories</li>
                      <li>• <strong>AliExpress Hot Products:</strong> Find trending items with good reviews</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold mb-2">2. Profitable Niche Criteria</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>Passion-driven:</strong> Products people are excited about (hobbies, pets, fitness)</li>
                      <li>• <strong>Problem-solving:</strong> Items that solve specific pain points</li>
                      <li>• <strong>Price range:</strong> $20-$80 is ideal (good profit margin, impulse buy)</li>
                      <li>• <strong>Lightweight:</strong> Easy and cheap to ship</li>
                      <li>• <strong>Not easily found locally:</strong> Unique or specialized items</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold mb-2">3. Competitor Analysis</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Search your product on Shopify, Amazon, and Google Shopping</li>
                      <li>• Check competitor pricing, descriptions, and customer reviews</li>
                      <li>• Look for gaps - what are customers complaining about?</li>
                      <li>• Find opportunities to differentiate (better quality, faster shipping, bundles)</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold mb-2">4. Supplier Research</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>AliExpress:</strong> Great for dropshipping, wide variety</li>
                      <li>• <strong>CJ Dropshipping:</strong> Faster shipping, US warehouses</li>
                      <li>• <strong>Spocket:</strong> US/EU suppliers, faster delivery</li>
                      <li>• <strong>Oberlo:</strong> Direct Shopify integration</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-primary/10 p-4">
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Pro Tips for Product Selection
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• Start with 5-10 test products in the same niche</li>
                  <li>• Choose products with at least 4.5★ rating and 100+ reviews on supplier sites</li>
                  <li>• Calculate total costs: product cost + shipping + payment fees (aim for 3x markup)</li>
                  <li>• Order samples first to check quality</li>
                  <li>• Focus on "wow factor" products that photograph well</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                How to Add Products to Your Website
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-lg">Step-by-Step Product Adding Guide</h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <Badge className="h-7 w-7 flex items-center justify-center shrink-0">1</Badge>
                    <div className="flex-1">
                      <p className="font-medium">Navigate to Products Page</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click <strong>Products</strong> in the admin sidebar, then click the <strong>Add Product</strong> button
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <Badge className="h-7 w-7 flex items-center justify-center shrink-0">2</Badge>
                    <div className="flex-1">
                      <p className="font-medium">Enter Product Details</p>
                      <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <p><strong>Product Name:</strong> Clear, descriptive (e.g., "Wireless Bluetooth Headphones")</p>
                        <p><strong>Price:</strong> Your selling price (remember 3x markup rule)</p>
                        <p><strong>Stock:</strong> Available quantity (or 999 for unlimited dropship)</p>
                        <p><strong>Category:</strong> Help customers find your product</p>
                        <p><strong>Image URL:</strong> High-quality product photo (right-click on supplier image → "Copy Image Address")</p>
                      </div>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <Badge className="h-7 w-7 flex items-center justify-center shrink-0">3</Badge>
                    <div className="flex-1">
                      <p className="font-medium">Generate Description with AI</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click <strong>Generate with AI</strong> to create a compelling description automatically.
                        You can edit and customize it to match your brand voice.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <Badge className="h-7 w-7 flex items-center justify-center shrink-0">4</Badge>
                    <div className="flex-1">
                      <p className="font-medium">Review and Publish</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Check all details, then click <strong>Save</strong>. Product will appear on your storefront immediately.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Best Practices for Product Listings
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Use high-quality images (at least 800x800px, white or clean background)</li>
                  <li>• Include specific benefits in descriptions, not just features</li>
                  <li>• Use psychological pricing ($29.97 instead of $30.00)</li>
                  <li>• Add urgency with low stock numbers (10-20 units) when appropriate</li>
                  <li>• Test different titles and descriptions to see what converts better</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Dropshipping & Shipping Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-lg">How to Set Up Dropshipping</h3>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold mb-2">What is Dropshipping?</h4>
                    <p className="text-sm text-muted-foreground">
                      Dropshipping allows you to sell products without holding inventory. When a customer orders,
                      you purchase from your supplier who ships directly to the customer. You never touch the product.
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold mb-2">Dropshipping Workflow</h4>
                    <ol className="space-y-2 text-sm">
                      <li><strong>1.</strong> Customer orders on your store → You receive payment</li>
                      <li><strong>2.</strong> You place order with supplier → Pay wholesale price</li>
                      <li><strong>3.</strong> Supplier ships directly to your customer</li>
                      <li><strong>4.</strong> You add tracking info in Orders page → Customer gets notified</li>
                      <li><strong>5.</strong> You keep the profit margin (retail price - wholesale price)</li>
                    </ol>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold mb-2">Recommended Dropship Suppliers</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm">AliExpress Standard Shipping</p>
                        <p className="text-sm text-muted-foreground">
                          • Cost: Free to $3 • Delivery: 15-45 days • Best for: Testing products
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-sm">CJ Dropshipping (US Warehouse)</p>
                        <p className="text-sm text-muted-foreground">
                          • Cost: $5-8 • Delivery: 3-7 days • Best for: US customers, faster shipping
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Spocket (US/EU)</p>
                        <p className="text-sm text-muted-foreground">
                          • Cost: $8-15 • Delivery: 2-5 days • Best for: Premium products, quality control
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg">Managing Orders & Tracking</h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <Badge className="h-7 w-7 flex items-center justify-center shrink-0">1</Badge>
                    <div className="flex-1">
                      <p className="font-medium">Receive Order Notification</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Check your Orders page daily for new orders
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <Badge className="h-7 w-7 flex items-center justify-center shrink-0">2</Badge>
                    <div className="flex-1">
                      <p className="font-medium">Place Order with Supplier</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Go to your supplier (AliExpress, CJ, etc.), order the product, use customer's shipping address
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <Badge className="h-7 w-7 flex items-center justify-center shrink-0">3</Badge>
                    <div className="flex-1">
                      <p className="font-medium">Add Tracking Information</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click <strong>Add Shipping Info</strong> on the order, enter tracking number,
                        carrier, and estimated delivery date
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <Badge className="h-7 w-7 flex items-center justify-center shrink-0">4</Badge>
                    <div className="flex-1">
                      <p className="font-medium">Update Order Status</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Change status: Pending → Processing → Shipped → Completed
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <Badge className="h-7 w-7 flex items-center justify-center shrink-0">5</Badge>
                    <div className="flex-1">
                      <p className="font-medium">Notify Customer</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click <strong>Email Customer</strong> or <strong>Send SMS</strong> to send tracking updates
                        (requires email/SMS API keys)
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="rounded-md bg-primary/10 p-4">
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <Mail className="h-4 w-4 text-primary" />
                  Setting Up Email/SMS Notifications
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>For Email Notifications:</strong></p>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Sign up for Resend or SendGrid (both have free tiers)</li>
                    <li>• Add API key to your environment settings</li>
                    <li>• Automatically send order confirmations and shipping updates</li>
                  </ul>
                  <p className="pt-2"><strong>For SMS Notifications:</strong></p>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Sign up for Twilio ($15/month + per-message fees)</li>
                    <li>• Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER</li>
                    <li>• Send instant SMS updates for order status changes</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Dropshipping Pro Tips
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Set realistic shipping expectations (7-15 days for standard, 3-7 for premium)</li>
                  <li>• Order product samples to test quality before selling</li>
                  <li>• Build relationships with suppliers for better pricing and priority shipping</li>
                  <li>• Use branded packaging inserts if supplier offers (builds trust)</li>
                  <li>• Always check supplier stock before listing products</li>
                  <li>• Set stock to 999 for dropship items to avoid out-of-stock issues</li>
                </ul>
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
                  <li>1. Check new orders in Orders tab</li>
                  <li>2. Add tracking info for any orders shipped by suppliers</li>
                  <li>3. Update order statuses as needed</li>
                  <li>4. Respond to customer emails if any</li>
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
