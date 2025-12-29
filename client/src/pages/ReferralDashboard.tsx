import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Gift, Copy, Check, Share2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ReferralCode, Referral } from "@shared/schema";

export default function ReferralDashboard() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: referralCode } = useQuery<ReferralCode>({
    queryKey: ['/api/referral/code'],
  });

  const { data: referrals = [] } = useQuery<Referral[]>({
    queryKey: ['/api/referral/list'],
  });

  const copyReferralLink = () => {
    if (!referralCode) return;
    
    const link = `${window.location.origin}?ref=${referralCode.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share this link with friends to earn rewards.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralLink = () => {
    if (!referralCode) return;
    
    const link = `${window.location.origin}?ref=${referralCode.code}`;
    const text = `Check out HealthyWaze for trusted wellness products! Use my referral link: ${link}`;
    
    if (navigator.share) {
      navigator.share({ title: "HealthyWaze Referral", text, url: link });
    } else {
      copyReferralLink();
    }
  };

  const convertedCount = referrals.filter(r => r.status === "converted").length;
  const pendingCount = referrals.filter(r => r.status === "pending").length;
  const totalPoints = referralCode?.totalPointsEarned || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-referral-title">
            Refer Friends & Earn Rewards
          </h1>
          <p className="text-muted-foreground">
            Share HealthyWaze with friends and family. You both earn rewards!
          </p>
        </div>

        <Card className="mb-8 border-2 border-primary/20 bg-primary/5" data-testid="card-referral-invite">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Your Referral Code
            </CardTitle>
            <CardDescription>
              Share your unique code and earn 500 points when friends make their first purchase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
              <code className="text-2xl font-bold tracking-wider flex-1" data-testid="text-referral-code">
                {referralCode?.code || "Loading..."}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyReferralLink}
                data-testid="button-copy-code"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={shareReferralLink} className="flex-1 gap-2" data-testid="button-share">
                <Share2 className="h-4 w-4" />
                Share Link
              </Button>
              <Button variant="outline" onClick={copyReferralLink} className="gap-2" data-testid="button-copy">
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8" data-testid="card-how-it-works">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">1. Share Your Link</h3>
                <p className="text-sm text-muted-foreground">
                  Send your unique referral link to friends and family
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">2. They Sign Up</h3>
                <p className="text-sm text-muted-foreground">
                  Your friend creates an account using your link
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">3. Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  You get 500 points, they get 200 points on first purchase!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card data-testid="card-total-referrals">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-referrals">
                {referralCode?.timesUsed || 0}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-converted-referrals">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful Conversions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-converted">
                {convertedCount}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-points-earned">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary" data-testid="text-points-earned">
                {totalPoints}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-referral-history">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Referral History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground" data-testid="text-no-referrals">
                  No referrals yet. Share your link to start earning rewards!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    data-testid={`referral-${referral.id}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm" data-testid={`text-referral-email-${referral.id}`}>
                        {referral.referredEmail}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={referral.status === "converted" ? "default" : "secondary"}
                        data-testid={`badge-referral-status-${referral.id}`}
                      >
                        {referral.status === "converted" ? "Converted" : referral.status === "registered" ? "Signed Up" : "Pending"}
                      </Badge>
                      {referral.status === "converted" && (
                        <p className="text-xs text-primary mt-1">+500 pts</p>
                      )}
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
