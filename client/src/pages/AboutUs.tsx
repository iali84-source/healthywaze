import { Heart, Shield, Users, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { StorefrontFooter } from "@/components/StorefrontFooter";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover-elevate rounded-md px-2 sm:px-3 py-2" data-testid="link-home">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-xs sm:text-sm font-bold">HW</span>
              </div>
              <span className="hidden text-base sm:text-lg font-bold md:inline">HealthyWaze</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-shop">Shop</Link>
              <Link href="/about" className="text-sm font-medium text-primary hover-elevate px-3 py-2 rounded-md" data-testid="link-about">About</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto mb-16 sm:mb-20">
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Our Story: Family Wellness, One Product at a Time
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              We're a family-driven company committed to bringing trusted, natural wellness solutions to families like yours.
            </p>
          </div>
        </div>

        {/* Our Mission */}
        <div className="max-w-4xl mx-auto mb-16 sm:mb-20">
          <div className="bg-card rounded-lg border p-8 sm:p-10 md:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Our Promise to You</h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 leading-relaxed">
              At HealthyWaze, we believe that wellness shouldn't be complicated—or toxic. We started this company because we wanted to offer our own families products we could actually trust. Every single product in our collection has been personally tested and approved by our family members, friends, neighbors, colleagues, and their families.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              We don't just sell products. We sell peace of mind.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="max-w-4xl mx-auto mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-12 text-center">What Drives Us</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Value 1 */}
            <div className="bg-card rounded-lg border p-8 hover-elevate transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">No Toxins, No Bad Chemicals</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every product is carefully screened to ensure it's free from harmful chemicals, artificial additives, and unnecessary preservatives. We believe natural wellness means truly natural ingredients.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-card rounded-lg border p-8 hover-elevate transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 mb-4">
                <Heart className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Safe for Your Whole Family</h3>
              <p className="text-muted-foreground leading-relaxed">
                From children to grandparents, our products are formulated to be gentle and safe for sensitive skin and growing bodies. If it's not safe for a child, it's not on our shelves.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-card rounded-lg border p-8 hover-elevate transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real People, Real Testing</h3>
              <p className="text-muted-foreground leading-relaxed">
                We don't rely on marketing hype. Our products are tested by real families—our own families, friends, neighbors, colleagues, and classmates. If they don't approve it, we don't sell it.
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-card rounded-lg border p-8 hover-elevate transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Trusted by Community</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every product has been approved by diverse groups of people we trust—from our families to our extended community network. This is how we build trust that lasts.
              </p>
            </div>
          </div>
        </div>

        {/* How We Choose */}
        <div className="max-w-4xl mx-auto mb-16 sm:mb-20">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border p-8 sm:p-10 md:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">How We Choose Our Products</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Research & Sourcing</h3>
                  <p className="text-muted-foreground">We identify products that align with natural wellness principles and have strong ingredient transparency.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary text-secondary-foreground font-bold text-sm">2</div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Real-World Testing</h3>
                  <p className="text-muted-foreground">Our team, families, friends, neighbors, colleagues, and their families try the products. We ask for honest feedback—the good, the bad, and the surprising.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-accent-foreground font-bold text-sm">3</div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Satisfaction Confirmation</h3>
                  <p className="text-muted-foreground">We only feature products that receive consistent approval from our community testers. Satisfaction isn't just preferred—it's required.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">4</div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Safety & Quality Check</h3>
                  <p className="text-muted-foreground">We verify ingredients, certifications, and safety standards. No toxins, no bad chemicals, no compromises.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-card rounded-lg border p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Experience the Difference?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of families who trust HealthyWaze for their natural wellness journey.
            </p>
            <Link href="/">
              <Button size="lg" data-testid="button-shop-from-about">
                Shop Our Collection
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
