import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSiteSettingsSchema, type SiteSettings } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Save, Settings } from "lucide-react";
import { useEffect } from "react";

export default function SiteSettings() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });

  const form = useForm({
    resolver: zodResolver(insertSiteSettingsSchema),
    defaultValues: {
      siteName: "ShopAI",
      logoUrl: "",
      primaryColor: "22 163 74",
      secondaryColor: "234 88 12",
      accentColor: "20 184 166",
      promoBannerEnabled: true,
      promoBannerText: "Free Shipping on Orders Over $75 | 30-Day Money-Back Guarantee",
      heroHeadline: "Your Wellness Journey\nMade Simple",
      heroSubheadline: "Powerful products to help you stay energized, focused, and on track",
      heroButtonText: "Shop Now",
      trustBadgeEnabled: true,
      trustBadgeText: "13,000+ Happy Customers",
      benefitOneText: "Feel Amazing",
      benefitTwoText: "Stay Energized",
      benefitThreeText: "Live Better",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) => {
      return apiRequest("PATCH", "/api/site-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      toast({
        title: "Settings saved!",
        description: "Your site settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Customize your storefront's promotional banner, hero section, and trust indicators
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Branding & Theme</CardTitle>
              <CardDescription>
                Customize your site name, logo, and color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ShopAI" data-testid="input-site-name" />
                    </FormControl>
                    <FormDescription>Your store's name</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." data-testid="input-logo-url" />
                    </FormControl>
                    <FormDescription>Full URL to your logo image</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="H S% L%" data-testid="input-primary-color" />
                      </FormControl>
                      <FormDescription>Format: H S% L%</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="H S% L%" data-testid="input-secondary-color" />
                      </FormControl>
                      <FormDescription>Format: H S% L%</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent Color</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="H S% L%" data-testid="input-accent-color" />
                      </FormControl>
                      <FormDescription>Format: H S% L%</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Promotional Banner</CardTitle>
              <CardDescription>
                The banner appears at the very top of your storefront
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="promoBannerEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Show promotional banner</FormLabel>
                      <FormDescription>
                        Display the promotional banner at the top of your site
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-promo-banner"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="promoBannerText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner text</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Free Shipping on Orders Over $75 | 30-Day Money-Back Guarantee"
                        data-testid="input-promo-text"
                      />
                    </FormControl>
                    <FormDescription>
                      What message do you want to display in the banner?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                The main section customers see when they land on your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="heroHeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main headline</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Your Wellness Journey\nMade Simple"
                        rows={2}
                        data-testid="input-hero-headline"
                      />
                    </FormControl>
                    <FormDescription>
                      Use \n for line breaks (e.g., "Your Journey\nMade Simple")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="heroSubheadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subheadline</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Powerful products to help you stay energized, focused, and on track"
                        rows={2}
                        data-testid="input-hero-subheadline"
                      />
                    </FormControl>
                    <FormDescription>
                      Supporting text that describes your value proposition
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="heroButtonText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call-to-action button text</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Shop Now"
                        data-testid="input-hero-button"
                      />
                    </FormControl>
                    <FormDescription>
                      Text for the main button in the hero section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trust Indicators</CardTitle>
              <CardDescription>
                Build credibility with social proof and benefit messaging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="trustBadgeEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Show trust badge</FormLabel>
                      <FormDescription>
                        Display customer count badge in the hero section
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-trust-badge"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trustBadgeText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trust badge text</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="13,000+ Happy Customers"
                        data-testid="input-trust-text"
                      />
                    </FormControl>
                    <FormDescription>
                      Social proof message (e.g., customer count, reviews)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-semibold">Benefit Icons</h4>
                
                <FormField
                  control={form.control}
                  name="benefitOneText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefit 1 (Heart icon)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Feel Amazing"
                          data-testid="input-benefit-one"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="benefitTwoText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefit 2 (Zap icon)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Stay Energized"
                          data-testid="input-benefit-two"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="benefitThreeText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefit 3 (Sparkles icon)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Live Better"
                          data-testid="input-benefit-three"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={updateMutation.isPending}
              data-testid="button-save-settings"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
