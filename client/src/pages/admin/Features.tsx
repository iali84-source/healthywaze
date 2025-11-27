import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { HelpCircle, Zap, DollarSign, Clock, TrendingUp, Users, Mail, MessageSquare, Package, RefreshCw, Lightbulb, Share2, Gift, Search, BarChart3, AlertCircle, Smartphone, Rocket } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Feature {
  id: string;
  title: string;
  description: string;
  info: string;
  icon: React.ReactNode;
  category: "Sales" | "Automation" | "Conversion" | "Operations" | "SEO";
  roi: string;
  effort: string;
  enabled: boolean;
}

const FEATURES: Feature[] = [
  {
    id: "email-automation",
    title: "Email Automation Sequences",
    description: "Automated abandoned cart reminders, post-purchase follow-ups, and win-back campaigns",
    info: "Automatically send personalized emails at key moments: abandoned carts (1hr), order confirmation, shipping notification, and re-engagement campaigns. Recovers 15-25% lost revenue.",
    icon: <Mail className="h-6 w-6" />,
    category: "Automation",
    roi: "+15-25% revenue",
    effort: "Easy",
    enabled: false,
  },
  {
    id: "sms-notifications",
    title: "SMS Order Notifications",
    description: "Auto-send order confirmations, shipment tracking, and delivery alerts via SMS",
    info: "98% open rate (vs 20% email). Auto-send order confirmed, shipped, and delivered notifications. Reduces support inquiries by 40%. Cost: ~$0.01 per SMS.",
    icon: <MessageSquare className="h-6 w-6" />,
    category: "Automation",
    roi: "-40% support calls",
    effort: "Easy",
    enabled: false,
  },
  {
    id: "auto-sitemap",
    title: "Auto-Generated Sitemaps & Meta Tags",
    description: "Automatically generate sitemaps and SEO meta tags for all products",
    info: "Improves Google ranking automatically. Zero manual work per niche. Add rich snippets for products, prices, and ratings. Impact: +30-50% organic traffic within 3 months.",
    icon: <Search className="h-6 w-6" />,
    category: "SEO",
    roi: "+30-50% organic traffic",
    effort: "Easy",
    enabled: false,
  },
  {
    id: "discount-rules",
    title: "Automated Discount Rules",
    description: "Create rules like 'Buy 2, get 10% off' or time-limited flash sales",
    info: "Set smart discount triggers: minimum order value, product quantity, first-time customers, or time-based. Increases AOV by automating upsells and reducing manual coupon management.",
    icon: <Zap className="h-6 w-6" />,
    category: "Sales",
    roi: "+15-20% AOV",
    effort: "Easy",
    enabled: false,
  },
  {
    id: "product-recommendations",
    title: "Smart Product Recommendations",
    description: "Show 'Customers Also Bought', related products, and cross-sell suggestions",
    info: "AI-powered: display products frequently bought together, related items by category, or seasonal recommendations. Impact: +15-20% AOV increase through automated upsells.",
    icon: <TrendingUp className="h-6 w-6" />,
    category: "Sales",
    roi: "+15-20% AOV",
    effort: "Medium",
    enabled: false,
  },
  {
    id: "abandoned-cart",
    title: "Abandoned Cart Recovery",
    description: "Save partial carts and send automated recovery emails with incentives",
    info: "Auto-save carts to user accounts. Email reminder after 1 hour with discount incentive (15% off). Recover 10-15% of lost sales. Completely automated workflow.",
    icon: <ShoppingCart className="h-6 w-6" />,
    category: "Sales",
    roi: "+10-15% recovery",
    effort: "Medium",
    enabled: false,
  },
  {
    id: "loyalty-program",
    title: "Simple Loyalty Program",
    description: "Points per purchase, tiers (Bronze→Silver→Gold), and redemption at checkout",
    info: "Customers earn 1 point per $1 spent. Redeem points for discounts. Auto-tier based on spending (Bronze: 0-500pts, Silver: 500-1000, Gold: 1000+). Impact: +25% repeat purchase rate.",
    icon: <Gift className="h-6 w-6" />,
    category: "Sales",
    roi: "+25% repeat rate",
    effort: "Medium",
    enabled: false,
  },
  {
    id: "inventory-sync",
    title: "Dynamic Inventory Sync",
    description: "Auto-sync stock levels from supplier systems, hide out-of-stock items",
    info: "Connect to supplier inventory APIs. Auto-update stock levels in real-time. Hide products when out of stock. Eliminates manual inventory updates and 'out of stock' errors completely.",
    icon: <Package className="h-6 w-6" />,
    category: "Operations",
    roi: "100% accuracy",
    effort: "Medium",
    enabled: false,
  },
  {
    id: "customer-segmentation",
    title: "Customer Segmentation & Targeted Campaigns",
    description: "Segment customers (high-value, at-risk, dormant) and send targeted emails",
    info: "Auto-segment: high-spenders, frequently-bought categories, inactive customers. Send targeted campaigns: 'Your favorite category is on sale', 'We miss you', 'VIP exclusive'. Impact: +30% email conversion.",
    icon: <Users className="h-6 w-6" />,
    category: "Automation",
    roi: "+30% conversion",
    effort: "Medium",
    enabled: false,
  },
  {
    id: "live-chat",
    title: "Live Chat & AI Bot",
    description: "AI-powered FAQ chatbot with option to route to human support",
    info: "AI answers common questions automatically (FAQ, shipping, returns). Route complex issues to human support. Reduces support workload by 60%. Cost: ~$29/month.",
    icon: <MessageSquare className="h-6 w-6" />,
    category: "Operations",
    roi: "-60% support time",
    effort: "Easy",
    enabled: false,
  },
  {
    id: "product-templates",
    title: "Product Templates & Bulk Cloning",
    description: "Clone products between niches, auto-fill descriptions, swap images/pricing",
    info: "Create product templates with pre-filled info. Clone entire catalogs from Niche A → B with one click, adjust images/pricing. Reduces setup time by 80%.",
    icon: <RefreshCw className="h-6 w-6" />,
    category: "Operations",
    roi: "-80% setup time",
    effort: "Easy",
    enabled: false,
  },
  {
    id: "invoicing",
    title: "Automated Invoice & Tax Calculation",
    description: "Auto-generate invoices, calculate sales tax, export to accounting software",
    info: "Generate professional invoices on purchase. Auto-calculate sales tax by state/country. Integrate with QuickBooks, Xero. Reduces admin work by 90%.",
    icon: <BarChart3 className="h-6 w-6" />,
    category: "Operations",
    roi: "-90% admin time",
    effort: "Medium",
    enabled: false,
  },
  {
    id: "supplier-orders",
    title: "Supplier Order Management",
    description: "Auto-generate purchase orders, track supplier performance, auto-reorder",
    info: "When inventory drops below threshold, auto-generate PO for supplier. Track on-time delivery rate, quality metrics. Reduces stockouts and manual ordering.",
    icon: <Package className="h-6 w-6" />,
    category: "Operations",
    roi: "0% stockouts",
    effort: "Medium",
    enabled: false,
  },
  {
    id: "social-posting",
    title: "Automated Social Media Posting",
    description: "Auto-post new products and sales to Instagram, Pinterest, TikTok",
    info: "When product added: post to Instagram/Pinterest with auto-generated description and product image. Schedule weekly sales announcement posts. Cost: ~$15/month.",
    icon: <Share2 className="h-6 w-6" />,
    category: "Automation",
    roi: "+30% reach",
    effort: "Easy",
    enabled: false,
  },
  {
    id: "ab-testing",
    title: "A/B Testing Framework",
    description: "Test hero text, button colors, CTA copy - auto-serve winning variant",
    info: "Set up A/B tests: hero headline, button color, CTA text. Track conversion rate for each. Auto-serve winning variant to 100% traffic. Impact: +5-15% conversion.",
    icon: <Lightbulb className="h-6 w-6" />,
    category: "Conversion",
    roi: "+5-15% conversion",
    effort: "Medium",
    enabled: false,
  },
  {
    id: "exit-popup",
    title: "Exit-Intent Popup with Discount",
    description: "Show discount offer ('15% off first order') when user tries to leave",
    info: "Triggered when mouse moves toward browser close. Offers time-limited discount. Recovers 5-10% of bounces. Customizable message and discount percentage.",
    icon: <AlertCircle className="h-6 w-6" />,
    category: "Conversion",
    roi: "+5-10% recovery",
    effort: "Easy",
    enabled: false,
  },
  {
    id: "upsell-page",
    title: "One-Click Upsell on Thank You Page",
    description: "Show related product after purchase for quick one-click add",
    info: "After checkout confirmation, show complementary product with 'Add for $X' button. Common upsells: if bought shaker bottle, offer protein powder at 20% off. Impact: +10-20% on 10% of orders.",
    icon: <Rocket className="h-6 w-6" />,
    category: "Sales",
    roi: "+10-20% upsells",
    effort: "Easy",
    enabled: false,
  },
  {
    id: "smart-search",
    title: "Smart Search with Filters",
    description: "Advanced search with AI-powered suggestions and auto-complete",
    info: "Search learns customer behavior: show trending searches, typo-correction, category suggestions. Smart filters reduce search time by 50% and improve findability.",
    icon: <Search className="h-6 w-6" />,
    category: "Conversion",
    roi: "+20% search usage",
    effort: "Medium",
    enabled: false,
  },
];

export default function FeaturesManager() {
  const [features, setFeatures] = useState<Feature[]>(FEATURES);

  const handleToggle = (id: string) => {
    setFeatures(features.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const categories = Array.from(new Set(features.map(f => f.category)));
  
  const ShoppingCart = Smartphone; // Temporary replacement for ShoppingCart icon

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Features Manager</h1>
        <p className="mt-2 text-muted-foreground">
          Enable/disable powerful features to grow your store. Click the info icon to learn what each feature does.
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{category}</h2>
            <Badge variant="outline">{features.filter(f => f.category === category).length} features</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.filter(f => f.category === category).map(feature => (
              <Card key={feature.id} className="hover-elevate transition-all" data-testid={`card-feature-${feature.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-primary mt-1">{feature.icon}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription className="mt-1">{feature.description}</CardDescription>
                      </div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button data-testid={`info-${feature.id}`}>
                          <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <p className="text-sm">{feature.info}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">{feature.roi}</Badge>
                    <Badge variant="outline" className="text-xs">{feature.effort}</Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Enable feature</span>
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={() => handleToggle(feature.id)}
                      data-testid={`toggle-${feature.id}`}
                    />
                  </div>

                  {feature.enabled && (
                    <Button variant="outline" size="sm" className="w-full" data-testid={`config-${feature.id}`}>
                      Configure →
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Pro Tips for Maximum ROI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>Start with these 5 for fastest ROI:</strong>
            <p className="text-muted-foreground">Email Automation (+20% revenue), SMS Notifications (-40% support), Auto Sitemaps (+40% organic), Loyalty Program (+25% repeat), Smart Product Recommendations (+15% AOV)</p>
          </div>
          <div>
            <strong>For best results:</strong>
            <p className="text-muted-foreground">Combine Email Automation + Loyalty Program + Product Recommendations for a compounding effect. Stack discount rules with abandoned cart recovery.</p>
          </div>
          <div>
            <strong>Save implementation time:</strong>
            <p className="text-muted-foreground">Use Product Templates + Inventory Sync for operational efficiency. These are template-driven and work across all niches.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
