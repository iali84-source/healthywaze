import { Shield, Lock, Truck, RotateCcw, Star } from "lucide-react";
import { SiVisa, SiMastercard, SiAmericanexpress, SiDiscover, SiStripe } from "react-icons/si";

export function TrustBadges() {
  return (
    <div className="border-t border-border/40 bg-card/30 py-8">
      <div className="container mx-auto px-4">
        {/* Security & Payment Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* SSL Secure */}
          <div className="flex items-center gap-3 justify-center md:justify-start" data-testid="badge-ssl-secure">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-sm">SSL Encrypted</div>
              <div className="text-xs text-muted-foreground">Secure Checkout</div>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="flex items-center gap-3 justify-center md:justify-start" data-testid="badge-money-back">
            <div className="bg-primary/10 p-2 rounded-lg">
              <RotateCcw className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-sm">30-Day Guarantee</div>
              <div className="text-xs text-muted-foreground">Money Back Promise</div>
            </div>
          </div>

          {/* Secure Payments */}
          <div className="flex items-center gap-3 justify-center md:justify-start" data-testid="badge-secure-payment">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-sm">Secure Payments</div>
              <div className="text-xs text-muted-foreground">Powered by Stripe</div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-3 font-medium">We Accept</div>
          <div className="flex items-center justify-center gap-4 flex-wrap" data-testid="payment-methods">
            <SiStripe className="w-12 h-12 text-foreground/70" title="Stripe" />
            <SiVisa className="w-12 h-12 text-foreground/70" title="Visa" />
            <SiMastercard className="w-12 h-12 text-foreground/70" title="Mastercard" />
            <SiAmericanexpress className="w-12 h-12 text-foreground/70" title="American Express" />
            <SiDiscover className="w-12 h-12 text-foreground/70" title="Discover" />
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            All transactions are processed securely through Stripe with industry-leading encryption
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckoutTrustIndicators() {
  return (
    <div className="bg-muted/30 border border-border/40 rounded-lg p-4 mb-6" data-testid="checkout-trust-indicators">
      <div className="flex items-start gap-3 mb-3">
        <Shield className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <div className="font-semibold text-sm mb-1">Secure Checkout Guaranteed</div>
          <div className="text-xs text-muted-foreground">
            Your payment information is encrypted and secure. We never store your credit card details.
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 pt-3 border-t border-border/40">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">256-bit SSL</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">PCI Compliant</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">30-Day Returns</span>
        </div>
      </div>
    </div>
  );
}
