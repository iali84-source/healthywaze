import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, Users, Target, Plus, Tag, Megaphone, MessageSquare } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PromoCode, MarketingCampaign } from "@shared/schema";

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function MarketingROI() {
  const { toast } = useToast();
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);

  const { data: roiData } = useQuery<{
    totalSpend: number;
    totalRevenue: number;
    overallRoas: number;
    totalConversions: number;
    avgCpa: number;
    topCampaigns: MarketingCampaign[];
  }>({
    queryKey: ["/api/admin/marketing/roi"],
  });

  const { data: analytics } = useQuery<{
    bySource: { source: string; sessions: number; conversions: number; revenue: number }[];
    byCampaign: { campaign: string; sessions: number; conversions: number; revenue: number }[];
    byMedium: { medium: string; sessions: number; conversions: number; revenue: number }[];
  }>({
    queryKey: ["/api/admin/marketing/analytics"],
  });

  const { data: promoCodes } = useQuery<PromoCode[]>({
    queryKey: ["/api/admin/promo-codes"],
  });

  const { data: campaigns } = useQuery<MarketingCampaign[]>({
    queryKey: ["/api/admin/campaigns"],
  });

  const { data: segments } = useQuery<{
    segment: string;
    count: number;
    avg_lifetime_value: number;
    total_revenue: number;
  }[]>({
    queryKey: ["/api/admin/customer-segments"],
  });

  const { data: surveyStats } = useQuery<{
    heardAboutUs: { source: string; count: number }[];
    avgSatisfaction: number;
    wouldRecommendPercent: number;
  }>({
    queryKey: ["/api/admin/surveys/stats"],
  });

  const createPromoMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/promo-codes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      setPromoDialogOpen(false);
      toast({ title: "Promo code created" });
    },
    onError: () => {
      toast({ title: "Failed to create promo code", variant: "destructive" });
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/campaigns", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      setCampaignDialogOpen(false);
      toast({ title: "Campaign created" });
    },
    onError: () => {
      toast({ title: "Failed to create campaign", variant: "destructive" });
    },
  });

  const handleCreatePromo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createPromoMutation.mutate({
      code: formData.get("code"),
      description: formData.get("description"),
      discountType: formData.get("discountType"),
      discountValue: formData.get("discountValue"),
      minimumOrder: formData.get("minimumOrder") || undefined,
      maxUses: formData.get("maxUses") ? parseInt(formData.get("maxUses") as string) : undefined,
      campaignName: formData.get("campaignName") || undefined,
      source: formData.get("source") || undefined,
    });
  };

  const handleCreateCampaign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createCampaignMutation.mutate({
      name: formData.get("name"),
      platform: formData.get("platform"),
      utmCampaign: formData.get("utmCampaign") || undefined,
      utmSource: formData.get("utmSource") || undefined,
      totalSpend: formData.get("totalSpend") || "0",
      dailyBudget: formData.get("dailyBudget") || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Marketing ROI</h1>
          <p className="text-muted-foreground">Track your marketing spend and return on investment</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-promo">
                <Tag className="h-4 w-4 mr-2" />
                New Promo Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Promo Code</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePromo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" name="code" placeholder="SUMMER20" required data-testid="input-promo-code" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" placeholder="Summer sale 20% off" data-testid="input-promo-description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select name="discountType" defaultValue="percentage">
                      <SelectTrigger data-testid="select-discount-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">Value</Label>
                    <Input id="discountValue" name="discountValue" type="number" placeholder="20" required data-testid="input-discount-value" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimumOrder">Min Order ($)</Label>
                    <Input id="minimumOrder" name="minimumOrder" type="number" placeholder="50" data-testid="input-min-order" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxUses">Max Uses</Label>
                    <Input id="maxUses" name="maxUses" type="number" placeholder="100" data-testid="input-max-uses" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name (for tracking)</Label>
                  <Input id="campaignName" name="campaignName" placeholder="summer_sale_2025" data-testid="input-campaign-name" />
                </div>
                <Button type="submit" className="w-full" disabled={createPromoMutation.isPending} data-testid="button-submit-promo">
                  {createPromoMutation.isPending ? "Creating..." : "Create Promo Code"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-campaign">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Marketing Campaign</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input id="name" name="name" placeholder="Summer Sale 2025" required data-testid="input-campaign-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select name="platform" defaultValue="google_ads">
                    <SelectTrigger data-testid="select-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google_ads">Google Ads</SelectItem>
                      <SelectItem value="facebook_ads">Facebook Ads</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="influencer">Influencer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="utmCampaign">UTM Campaign</Label>
                    <Input id="utmCampaign" name="utmCampaign" placeholder="summer_sale" data-testid="input-utm-campaign" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="utmSource">UTM Source</Label>
                    <Input id="utmSource" name="utmSource" placeholder="google" data-testid="input-utm-source" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalSpend">Total Spend ($)</Label>
                    <Input id="totalSpend" name="totalSpend" type="number" step="0.01" placeholder="500" data-testid="input-total-spend" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyBudget">Daily Budget ($)</Label>
                    <Input id="dailyBudget" name="dailyBudget" type="number" step="0.01" placeholder="50" data-testid="input-daily-budget" />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createCampaignMutation.isPending} data-testid="button-submit-campaign">
                  {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ad Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-spend">
              ${roiData?.totalSpend?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue from Ads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-revenue">
              ${roiData?.totalRevenue?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Attributed to marketing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROAS</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-roas">
              {roiData?.overallRoas?.toFixed(2) || "0.00"}x
            </div>
            <p className="text-xs text-muted-foreground">Return on Ad Spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. CPA</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-cpa">
              ${roiData?.avgCpa?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Cost per Acquisition</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attribution" data-testid="tab-attribution">Attribution</TabsTrigger>
          <TabsTrigger value="promo-codes" data-testid="tab-promo-codes">Promo Codes</TabsTrigger>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="customers" data-testid="tab-customers">Customer Segments</TabsTrigger>
          <TabsTrigger value="surveys" data-testid="tab-surveys">Surveys</TabsTrigger>
        </TabsList>

        <TabsContent value="attribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
                <CardDescription>Where your customers come from</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.bySource && analytics.bySource.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.bySource}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="source" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                      <Bar dataKey="revenue" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No attribution data yet. Share links with UTM parameters to track sources.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversions by Medium</CardTitle>
                <CardDescription>Paid, organic, social, email</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.byMedium && analytics.byMedium.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.byMedium}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ medium, conversions }) => `${medium}: ${conversions}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="conversions"
                        nameKey="medium"
                      >
                        {analytics.byMedium.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No medium data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Sessions, conversions, and revenue by campaign</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.byCampaign && analytics.byCampaign.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Campaign</th>
                        <th className="text-right py-2">Sessions</th>
                        <th className="text-right py-2">Conversions</th>
                        <th className="text-right py-2">Revenue</th>
                        <th className="text-right py-2">Conv. Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.byCampaign.map((c, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-2">{c.campaign}</td>
                          <td className="text-right py-2">{c.sessions}</td>
                          <td className="text-right py-2">{c.conversions}</td>
                          <td className="text-right py-2">${Number(c.revenue).toFixed(2)}</td>
                          <td className="text-right py-2">
                            {c.sessions > 0 ? ((c.conversions / Number(c.sessions)) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No campaign data yet</p>
                  <p className="text-sm mt-2">
                    Use UTM parameters like <code className="bg-muted px-1 rounded">?utm_campaign=summer_sale&utm_source=google</code>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promo-codes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Promo Codes</CardTitle>
              <CardDescription>Track discount code performance</CardDescription>
            </CardHeader>
            <CardContent>
              {promoCodes && promoCodes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Code</th>
                        <th className="text-left py-2">Discount</th>
                        <th className="text-right py-2">Uses</th>
                        <th className="text-right py-2">Revenue</th>
                        <th className="text-right py-2">Discount Given</th>
                        <th className="text-center py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promoCodes.map((code) => (
                        <tr key={code.id} className="border-b">
                          <td className="py-2 font-mono font-semibold">{code.code}</td>
                          <td className="py-2">
                            {code.discountType === "percentage"
                              ? `${code.discountValue}%`
                              : `$${code.discountValue}`}
                          </td>
                          <td className="text-right py-2">
                            {code.usedCount}
                            {code.maxUses ? ` / ${code.maxUses}` : ""}
                          </td>
                          <td className="text-right py-2">${Number(code.totalRevenue || 0).toFixed(2)}</td>
                          <td className="text-right py-2">${Number(code.totalDiscount || 0).toFixed(2)}</td>
                          <td className="text-center py-2">
                            <Badge variant={code.isActive ? "default" : "secondary"}>
                              {code.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No promo codes yet</p>
                  <p className="text-sm mt-2">Create promo codes to track campaign effectiveness</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Campaigns</CardTitle>
              <CardDescription>Track spend and ROI by campaign</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns && campaigns.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Campaign</th>
                        <th className="text-left py-2">Platform</th>
                        <th className="text-right py-2">Spend</th>
                        <th className="text-right py-2">Revenue</th>
                        <th className="text-right py-2">ROAS</th>
                        <th className="text-right py-2">CPA</th>
                        <th className="text-center py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((c) => (
                        <tr key={c.id} className="border-b">
                          <td className="py-2 font-medium">{c.name}</td>
                          <td className="py-2">{c.platform.replace("_", " ")}</td>
                          <td className="text-right py-2">${Number(c.totalSpend).toFixed(2)}</td>
                          <td className="text-right py-2">${Number(c.revenue || 0).toFixed(2)}</td>
                          <td className="text-right py-2">
                            <span className={Number(c.roas) >= 1 ? "text-green-600" : "text-red-600"}>
                              {Number(c.roas || 0).toFixed(2)}x
                            </span>
                          </td>
                          <td className="text-right py-2">${Number(c.cpa || 0).toFixed(2)}</td>
                          <td className="text-center py-2">
                            <Badge
                              variant={c.status === "active" ? "default" : c.status === "paused" ? "secondary" : "outline"}
                            >
                              {c.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No campaigns yet</p>
                  <p className="text-sm mt-2">Create campaigns to track your marketing spend and ROI</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Lifetime value by customer segment</CardDescription>
            </CardHeader>
            <CardContent>
              {segments && segments.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-4">
                  {segments.map((seg) => (
                    <Card key={seg.segment}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg capitalize">{seg.segment}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{seg.count}</div>
                        <p className="text-xs text-muted-foreground">customers</p>
                        <div className="mt-2">
                          <div className="text-sm">
                            Avg LTV: <span className="font-semibold">${Number(seg.avg_lifetime_value || 0).toFixed(2)}</span>
                          </div>
                          <div className="text-sm">
                            Total Revenue: <span className="font-semibold">${Number(seg.total_revenue || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No customer segments yet</p>
                  <p className="text-sm mt-2">Customer segments are calculated after orders are placed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveys" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-avg-satisfaction">
                  {surveyStats?.avgSatisfaction?.toFixed(1) || "N/A"}/5
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Would Recommend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-would-recommend">
                  {surveyStats?.wouldRecommendPercent?.toFixed(0) || 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Survey Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-survey-count">
                  {surveyStats?.heardAboutUs?.reduce((sum, h) => sum + Number(h.count), 0) || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>"How did you hear about us?"</CardTitle>
              <CardDescription>Post-purchase survey responses</CardDescription>
            </CardHeader>
            <CardContent>
              {surveyStats?.heardAboutUs && surveyStats.heardAboutUs.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={surveyStats.heardAboutUs} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="source" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No survey responses yet</p>
                  <p className="text-sm mt-2">Surveys are collected after purchase confirmation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
