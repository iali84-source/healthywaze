import { useState, useEffect } from "react";
import { X, ShoppingBag, TrendingUp, Eye, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Social Proof Notification
export function SocialProofNotification() {
  const [visible, setVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(0);

  const notifications = [
    { name: "Sarah M.", location: "New York", product: "Premium Collagen", time: "2 minutes ago" },
    { name: "Mike R.", location: "Los Angeles", product: "Protein Powder", time: "5 minutes ago" },
    { name: "Emma L.", location: "Chicago", product: "Vitamin Bundle", time: "8 minutes ago" },
    { name: "David K.", location: "Miami", product: "Pre-Workout", time: "12 minutes ago" },
  ];

  useEffect(() => {
    const showInterval = setInterval(() => {
      setCurrentNotification((prev) => (prev + 1) % notifications.length);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }, 15000);

    // Show first one after 3 seconds
    setTimeout(() => setVisible(true), 3000);

    return () => clearInterval(showInterval);
  }, []);

  const notification = notifications[currentNotification];

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-50 max-w-sm animate-in slide-in-from-left"
      data-testid="social-proof-notification"
    >
      <Card className="bg-card border-primary/20 shadow-lg">
        <div className="flex items-start gap-3 p-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <ShoppingBag className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm truncate">{notification.name}</span>
              <span className="text-xs text-muted-foreground">from {notification.location}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              Just purchased <span className="font-medium text-foreground">{notification.product}</span>
            </p>
            <p className="text-xs text-muted-foreground">{notification.time}</p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-close-notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}

// Free Shipping Progress Bar
interface FreeShippingBarProps {
  currentTotal: number;
  threshold?: number;
}

export function FreeShippingBar({ currentTotal, threshold = 50 }: FreeShippingBarProps) {
  const remaining = Math.max(0, threshold - currentTotal);
  const progress = Math.min(100, (currentTotal / threshold) * 100);
  const isEligible = currentTotal >= threshold;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4" data-testid="free-shipping-bar">
      <div className="flex items-center gap-2 mb-2">
        <Package className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">
          {isEligible ? (
            <span className="text-primary">🎉 You qualify for FREE shipping!</span>
          ) : (
            <>Add ${remaining.toFixed(2)} more for FREE shipping</>
          )}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

// People Viewing Counter
interface ViewingCounterProps {
  productId: string;
}

export function ViewingCounter({ productId }: ViewingCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Random count between 3-12
    const randomCount = Math.floor(Math.random() * 10) + 3;
    setCount(randomCount);

    // Fluctuate slightly every 30 seconds
    const interval = setInterval(() => {
      setCount((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(2, Math.min(15, prev + change));
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [productId]);

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground" data-testid="viewing-counter">
      <Eye className="w-3.5 h-3.5" />
      <span className="font-medium text-primary">{count}</span>
      <span>people viewing</span>
    </div>
  );
}

// Urgency Timer
interface UrgencyTimerProps {
  endTime?: Date;
  label?: string;
}

export function UrgencyTimer({ endTime, label = "Flash Sale Ends In" }: UrgencyTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = endTime || new Date(now.getTime() + 4 * 60 * 60 * 1000); // Default 4 hours from now
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        return "Ended";
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${hours}h ${minutes}m ${seconds}s`;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (timeLeft === "Ended") return null;

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4" data-testid="urgency-timer">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-destructive" />
        <span className="text-sm font-semibold">{label}:</span>
        <span className="text-sm font-bold text-destructive tabular-nums">{timeLeft}</span>
      </div>
    </div>
  );
}

// Exit Intent Popup
interface ExitIntentPopupProps {
  onEmailCapture?: (email: string) => void;
}

export function ExitIntentPopup({ onEmailCapture }: ExitIntentPopupProps) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkDismissed = localStorage.getItem("exitPopupDismissed");
    if (checkDismissed) {
      setDismissed(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissed) {
        setShow(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [dismissed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && onEmailCapture) {
      onEmailCapture(email);
    }
    handleClose();
  };

  const handleClose = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("exitPopupDismissed", "true");
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in" data-testid="exit-intent-popup">
      <Card className="max-w-md w-full bg-card border-2 border-primary animate-in zoom-in-95 relative">
        <div className="p-6">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-foreground hover:text-primary z-10 bg-background rounded-full p-1"
            data-testid="button-close-exit-popup"
            aria-label="Close popup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Wait! Don't Go!</h2>
            <p className="text-muted-foreground">
              Get <span className="text-primary font-bold">15% OFF</span> your first order
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                data-testid="input-exit-email"
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg" data-testid="button-claim-discount">
              Claim My 15% Discount
            </Button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground underline"
              data-testid="button-skip-offer"
            >
              No thanks, I'll pay full price
            </button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              One-time offer. Code will be sent to your email.
            </p>
          </form>
        </div>
      </Card>
    </div>
  );
}

// Low Stock Urgency Badge (Enhanced)
interface LowStockBadgeProps {
  stock: number;
  threshold?: number;
}

export function LowStockBadge({ stock, threshold = 5 }: LowStockBadgeProps) {
  if (stock > threshold) return null;

  return (
    <Badge variant="destructive" className="animate-pulse" data-testid="badge-low-stock">
      🔥 Only {stock} left in stock!
    </Badge>
  );
}
