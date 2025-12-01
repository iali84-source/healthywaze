import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Gift, TrendingUp, Users, DollarSign } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";

interface LoyaltyStat {
  totalMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  averagePointsPerCustomer: number;
  tierDistribution: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  monthlyRevenue: number;
}

export default function LoyaltyProgram() {
  const { data: stats, isLoading } = useQuery<LoyaltyStat>({
    queryKey: ["/api/admin/loyalty-stats"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Loyalty Program</h1>
        <p className="text-muted-foreground">
          Manage customer loyalty tiers, points, and email campaigns
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMembers || 0}</div>
            <p className="text-xs text-muted-foreground">Active loyalty members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
            <Gift className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPointsIssued || 0}</div>
            <p className="text-xs text-muted-foreground">Total points distributed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPointsRedeemed || 0}</div>
            <p className="text-xs text-muted-foreground">Total points redeemed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.monthlyRevenue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From loyalty members</p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Distribution</CardTitle>
          <CardDescription>Customer breakdown by loyalty tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Bronze</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.tierDistribution.bronze || 0}</p>
              <p className="text-xs text-muted-foreground">0-999 points</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Silver</p>
              <p className="text-2xl font-bold text-slate-400">{stats?.tierDistribution.silver || 0}</p>
              <p className="text-xs text-muted-foreground">1000-2499 points</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Gold</p>
              <p className="text-2xl font-bold text-yellow-500">{stats?.tierDistribution.gold || 0}</p>
              <p className="text-xs text-muted-foreground">2500-4999 points</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Platinum</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.tierDistribution.platinum || 0}</p>
              <p className="text-xs text-muted-foreground">5000+ points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Program Settings & Campaigns */}
      <Tabs defaultValue="tiers" className="w-full">
        <TabsList>
          <TabsTrigger value="tiers">Tier Benefits</TabsTrigger>
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
          <TabsTrigger value="abandoned">Abandoned Carts</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Tier Benefits</CardTitle>
              <CardDescription>Configure rewards and perks for each tier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {["bronze", "silver", "gold", "platinum"].map((tier) => (
                <div key={tier} className="space-y-2 pb-4 border-b last:border-0">
                  <h3 className="font-semibold capitalize">{tier} Tier</h3>
                  <p className="text-sm text-muted-foreground">Configure benefits for {tier} tier members</p>
                  <Button variant="outline" size="sm">
                    Edit {tier} benefits
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>Manage automated email sequences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="default" className="w-full md:w-auto">
                Create New Campaign
              </Button>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No campaigns created yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abandoned">
          <Card>
            <CardHeader>
              <CardTitle>Abandoned Cart Recovery</CardTitle>
              <CardDescription>Manage cart recovery automation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="default" className="w-full md:w-auto">
                View Abandoned Carts
              </Button>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Recovery emails: 1hr, 24hr, 72hr sequences</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
