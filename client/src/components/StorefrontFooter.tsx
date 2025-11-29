import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function StorefrontFooter() {
  const [, setLocation] = useLocation();
  return (
    <footer className="border-t bg-muted/30 py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-sm font-bold">HW</span>
              </div>
              <span className="font-bold">HealthyWaze</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Natural wellness solutions trusted by families
            </p>
          </div>

          {/* Customer Links */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Customer</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-home">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-dashboard">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@healthywaze.com" className="text-muted-foreground hover:text-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-contact">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-faq">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-shipping">
                  Shipping Info
                </a>
              </li>
            </ul>
          </div>

          {/* Admin Section */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Administration</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Access your admin dashboard
            </p>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full"
              data-testid="button-footer-admin"
              onClick={() => setLocation("/auth")}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Admin Portal
            </Button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2025 HealthyWaze. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground hover-elevate" data-testid="link-footer-privacy">Privacy</a>
            <a href="#" className="hover:text-foreground hover-elevate" data-testid="link-footer-terms">Terms</a>
            <a href="#" className="hover:text-foreground hover-elevate" data-testid="link-footer-cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
