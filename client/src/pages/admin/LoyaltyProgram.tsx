import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Gift, TrendingUp, Users, DollarSign, Mail, ShoppingCart, Send, Clock } from "lucide-react";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EmailSequence, AbandonedCart } from "@shared/schema";

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

const tierBenefits = {
  bronze: ["1 point per $1 spent", "Birthday bonus points"],
  silver: ["1.2 points per $1 spent", "Birthday bonus", "Free shipping on orders over $50"],
  gold: ["1.5 points per $1 spent", "Birthday bonus", "Free shipping all orders", "10% off select items"],
  platinum: ["2 points per $1 spent", "Birthday bonus", "Free shipping all orders", "15% off all items", "Priority support"],
};

export default function LoyaltyProgram() {
  const { toast } = useToast();
  
  const { data: stats, isLoading: statsLoading } = useQuery<LoyaltyStat>({
    queryKey: ["/api/admin/loyalty-stats"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: emailSequences, isLoading: sequencesLoading } = useQuery<EmailSequence[]>({
    queryKey: ["/api/admin/email-sequences"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: abandonedCarts, isLoading: cartsLoading } = useQuery<AbandonedCart[]>({
    queryKey: ["/api/admin/abandoned-carts"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const sendRecoveryEmail = useMutation({
    mutationFn: async (cartId: number) => {
      return await apiRequest("POST", `/api/admin/abandoned-carts/${cartId}/send-recovery`);
    },
    onSuccess: () => {
      toast({ title: "Recovery email sent", description: "Customer will receive the cart recovery email shortly." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/abandoned-carts"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send email", description: error.message, variant: "destructive" });
    },
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2" data-testid="text-loyalty-title">Loyalty Program</h1>
        <p className="text-muted-foreground">
          Manage customer loyalty tiers, points, and email campaigns
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-members">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMembers || 0}</div>
            <p className="text-xs text-muted-foreground">Active loyalty members</p>
          </CardContent>
        </Card>

        <Card data-testid="card-points-issued">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
            <Gift className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPointsIssued?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total points distributed</p>
          </CardContent>
        </Card>

        <Card data-testid="card-points-redeemed">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPointsRedeemed?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total points redeemed</p>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-revenue">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.monthlyRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From loyalty members</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tier Distribution</CardTitle>
          <CardDescription>Customer breakdown by loyalty tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20" data-testid="tier-bronze">
              <p className="text-sm font-medium">Bronze</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.tierDistribution?.bronze || 0}</p>
              <p className="text-xs text-muted-foreground">0-999 points</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-slate-100 dark:bg-slate-800/20" data-testid="tier-silver">
              <p className="text-sm font-medium">Silver</p>
              <p className="text-2xl font-bold text-slate-500">{stats?.tierDistribution?.silver || 0}</p>
              <p className="text-xs text-muted-foreground">1000-2499 points</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20" data-testid="tier-gold">
              <p className="text-sm font-medium">Gold</p>
              <p className="text-2xl font-bold text-yellow-500">{stats?.tierDistribution?.gold || 0}</p>
              <p className="text-xs text-muted-foreground">2500-4999 points</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20" data-testid="tier-platinum">
              <p className="text-sm font-medium">Platinum</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.tierDistribution?.platinum || 0}</p>
              <p className="text-xs text-muted-foreground">5000+ points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tiers" className="w-full">
        <TabsList>
          <TabsTrigger value="tiers" data-testid="tab-tiers">Tier Benefits</TabsTrigger>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">Email Campaigns</TabsTrigger>
          <TabsTrigger value="abandoned" data-testid="tab-abandoned">Abandoned Carts</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Tier Benefits</CardTitle>
              <CardDescription>Current rewards and perks for each tier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(["bronze", "silver", "gold", "platinum"] as const).map((tier) => (
                <div key={tier} className="space-y-3 pb-4 border-b last:border-0" data-testid={`tier-benefits-${tier}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold capitalize text-lg">{tier} Tier</h3>
                    <Badge variant={tier === "platinum" ? "default" : "outline"} className="capitalize">
                      {tier}
                    </Badge>
                  </div>
                  <ul className="space-y-1">
                    {tierBenefits[tier].map((benefit, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Gift className="h-3 w-3 text-primary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Campaigns
              </CardTitle>
              <CardDescription>Manage automated email sequences for customer engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sequencesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : emailSequences && emailSequences.length > 0 ? (
                <div className="space-y-3">
                  {emailSequences.map((sequence) => (
                    <div key={sequence.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`email-sequence-${sequence.id}`}>
                      <div>
                        <p className="font-medium">{sequence.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{sequence.type.replace('_', ' ')}</p>
                      </div>
                      <Badge variant={sequence.isActive ? "default" : "secondary"}>
                        {sequence.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">No email campaigns created yet</p>
                  <p className="text-sm text-muted-foreground">
                    Email campaigns help you automatically engage with customers through welcome emails, 
                    post-purchase follow-ups, and re-engagement sequences.
                  </p>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Available Email Types</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {["Welcome Series", "Post-Purchase", "Re-engagement", "Abandoned Cart"].map((type) => (
                    <div key={type} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Send className="h-3 w-3" />
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abandoned">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Abandoned Cart Recovery
              </CardTitle>
              <CardDescription>View and recover abandoned shopping carts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : abandonedCarts && abandonedCarts.length > 0 ? (
                <div className="space-y-3">
                  {abandonedCarts.map((cart) => (
                    <div key={cart.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`abandoned-cart-${cart.id}`}>
                      <div className="space-y-1">
                        <p className="font-medium">{cart.customerEmail}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${cart.cartTotal}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(cart.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={cart.status === "abandoned" ? "destructive" : "default"}>
                          {cart.status}
                        </Badge>
                        {cart.status === "abandoned" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => sendRecoveryEmail.mutate(cart.id)}
                            disabled={sendRecoveryEmail.isPending}
                            data-testid={`send-recovery-${cart.id}`}
                          >
                            {sendRecoveryEmail.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1" />
                                Send Recovery
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-2">No abandoned carts found</p>
                  <p className="text-sm text-muted-foreground">
                    When customers leave items in their cart without completing checkout, 
                    they'll appear here for recovery.
                  </p>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Recovery Email Schedule</h4>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    1st reminder: 1 hour after abandonment
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    2nd reminder: 24 hours after abandonment
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Final reminder: 72 hours after abandonment (with discount offer)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
