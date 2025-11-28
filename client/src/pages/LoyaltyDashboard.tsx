import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Gift, TrendingUp, History } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { LoyaltyAccount, LoyaltyTransaction } from "@shared/schema";

export default function LoyaltyDashboard() {
  const { user } = useAuth();

  const { data: loyaltyAccount } = useQuery<LoyaltyAccount>({
    queryKey: ['/api/loyalty/account'],
  });

  const { data: transactions } = useQuery<LoyaltyTransaction[]>({
    queryKey: ['/api/loyalty/transactions'],
  });

  const tierConfig = {
    bronze: { color: "bg-amber-900/20 text-amber-800 border-amber-800/30", icon: "🥉", nextTier: 1000 },
    silver: { color: "bg-slate-400/20 text-slate-700 border-slate-400/30", icon: "🥈", nextTier: 2500 },
    gold: { color: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30", icon: "🥇", nextTier: 5000 },
    platinum: { color: "bg-cyan-400/20 text-cyan-700 border-cyan-400/30", icon: "👑", nextTier: Infinity },
  };

  const currentTier = (loyaltyAccount?.tier || 'bronze') as keyof typeof tierConfig;
  const tierInfo = tierConfig[currentTier];
  const currentPoints = loyaltyAccount?.totalPoints || 0;
  const nextTierPoints = tierInfo.nextTier;
  const progressPercent = Math.min((currentPoints / nextTierPoints) * 100, 100);

  const getTierBenefits = (tier: string) => {
    const benefits = {
      bronze: ["1 point per $1 spent", "Birthday bonus"],
      silver: ["1.2 points per $1 spent", "Birthday bonus", "Free shipping on orders over $50"],
      gold: ["1.5 points per $1 spent", "Birthday bonus", "Free shipping all orders", "10% off select items"],
      platinum: ["2 points per $1 spent", "Birthday bonus", "Free shipping all orders", "15% off all items", "Priority support"],
    };
    return benefits[tier as keyof typeof benefits] || benefits.bronze;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-loyalty-title">
            Your Loyalty Rewards
          </h1>
          <p className="text-muted-foreground">
            Earn points on every purchase and unlock exclusive benefits
          </p>
        </div>

        {/* Current Tier Card */}
        <Card className="mb-8 border-2" data-testid="card-current-tier">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Current Tier: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-6 rounded-lg border-2 ${tierInfo.color}`}>
              <div className="text-5xl mb-2">{tierInfo.icon}</div>
              <p className="text-sm font-medium">
                You're in the {currentTier.toUpperCase()} tier
              </p>
            </div>

            {/* Progress Bar */}
            <div data-testid="loyalty-progress">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progress to next tier</span>
                <span className="text-sm text-muted-foreground">
                  {currentPoints} / {nextTierPoints === Infinity ? '∞' : nextTierPoints} points
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Tier Benefits */}
            <div data-testid="loyalty-benefits">
              <h3 className="font-medium mb-3">Your Benefits</h3>
              <ul className="space-y-2">
                {getTierBenefits(currentTier).map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Gift className="h-4 w-4 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Total Points */}
          <Card data-testid="card-total-points">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-points">
                {currentPoints}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentPoints > 0 ? `Redeemable for rewards` : 'Make a purchase to start earning'}
              </p>
            </CardContent>
          </Card>

          {/* Redeemed Points */}
          <Card data-testid="card-redeemed-points">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Redeemed Points</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-redeemed-points">
                {loyaltyAccount?.redeemedPoints || 0}
              </div>
            </CardContent>
          </Card>

          {/* Next Milestone */}
          <Card data-testid="card-next-milestone">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-next-milestone">
                {nextTierPoints === Infinity ? '∞' : nextTierPoints - currentPoints}
              </div>
              <p className="text-xs text-muted-foreground mt-1">points away</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card data-testid="card-transaction-history">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!transactions || transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground" data-testid="text-no-transactions">
                  No transactions yet. Start earning points with your first purchase!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    data-testid={`transaction-${transaction.id}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium capitalize text-sm" data-testid={`text-transaction-type-${transaction.id}`}>
                        {transaction.type}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-transaction-desc-${transaction.id}`}>
                        {transaction.description || 'Points transaction'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={transaction.pointsEarned > 0 ? 'default' : 'secondary'}
                        data-testid={`badge-transaction-${transaction.id}`}
                      >
                        {transaction.pointsEarned > 0 ? '+' : '-'}
                        {transaction.pointsEarned || transaction.pointsRedeemed}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
