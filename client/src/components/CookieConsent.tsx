import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { Cookie, X } from "lucide-react";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = "healthywaze_cookie_consent";
const COOKIE_PREFERENCES_KEY = "healthywaze_cookie_preferences";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    if (prefs.analytics && typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
    if (prefs.marketing && typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        ad_storage: "granted",
      });
    }
  };

  const acceptAll = () => {
    saveConsent({ essential: true, analytics: true, marketing: true });
  };

  const rejectNonEssential = () => {
    saveConsent({ essential: true, analytics: false, marketing: false });
  };

  const saveCustom = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4" data-testid="cookie-consent-banner">
      <div className="container mx-auto max-w-4xl">
        {showSettings ? (
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cookie className="h-5 w-5" />
                  <CardTitle className="text-lg">Cookie Settings</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)} data-testid="button-close-settings">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Manage your cookie preferences. See our <Link href="/legal/cookies" className="underline">Cookie Policy</Link> for details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="essential">Essential Cookies</Label>
                  <p className="text-xs text-muted-foreground">Required for the site to function (cart, login)</p>
                </div>
                <Switch id="essential" checked={true} disabled data-testid="switch-essential" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Analytics Cookies</Label>
                  <p className="text-xs text-muted-foreground">Help us improve by tracking usage</p>
                </div>
                <Switch 
                  id="analytics" 
                  checked={preferences.analytics} 
                  onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
                  data-testid="switch-analytics"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing">Marketing Cookies</Label>
                  <p className="text-xs text-muted-foreground">Personalized ads and campaign tracking</p>
                </div>
                <Switch 
                  id="marketing" 
                  checked={preferences.marketing} 
                  onCheckedChange={(checked) => setPreferences({ ...preferences, marketing: checked })}
                  data-testid="switch-marketing"
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button onClick={saveCustom} className="flex-1" data-testid="button-save-preferences">
                  Save Preferences
                </Button>
                <Button onClick={acceptAll} variant="outline" data-testid="button-accept-all-settings">
                  Accept All
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-2">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Cookie className="h-6 w-6 shrink-0 text-primary" />
                  <p className="text-sm">
                    We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{" "}
                    <Link href="/legal/cookies" className="underline">Learn more</Link>
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} data-testid="button-customize-cookies">
                    Customize
                  </Button>
                  <Button variant="outline" size="sm" onClick={rejectNonEssential} data-testid="button-reject-cookies">
                    Reject
                  </Button>
                  <Button size="sm" onClick={acceptAll} data-testid="button-accept-cookies">
                    Accept All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
