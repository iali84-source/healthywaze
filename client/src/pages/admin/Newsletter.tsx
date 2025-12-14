import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Trash2, Eye, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Newsletter, InsertNewsletter } from "@shared/schema";

const NEWSLETTER_CATEGORIES = [
  "yoga",
  "lotion",
  "energy_drinks",
  "supplements",
  "skincare",
  "fitness",
  "all"
];

export default function Newsletter() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("yoga");
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    content: "",
    productIds: "",
  });

  // Fetch newsletters
  const { data: newsletters = [], isLoading } = useQuery<Newsletter[]>({
    queryKey: ["/api/newsletters"],
  });

  // Create newsletter mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertNewsletter) => {
      return apiRequest("POST", "/api/newsletters", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Newsletter created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/newsletters"] });
      setFormData({ title: "", subject: "", content: "", productIds: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create newsletter",
        variant: "destructive",
      });
    },
  });

  // Delete newsletter mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/newsletters/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Newsletter deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/newsletters"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete newsletter",
        variant: "destructive",
      });
    },
  });

  // AI content generation mutation
  const generateMutation = useMutation({
    mutationFn: async (data: { category: string; productIds?: string }) => {
      const res = await apiRequest("POST", "/api/ai/generate-newsletter-content", data);
      return res.json();
    },
    onSuccess: (data: { subject: string; content: string }) => {
      setFormData((prev) => ({
        ...prev,
        subject: data.subject,
        content: data.content,
        title: prev.title || `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Newsletter`,
      }));
      toast({
        title: "AI Content Generated",
        description: "Newsletter subject and content generated. Feel free to edit!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to generate newsletter content",
        variant: "destructive",
      });
    },
  });

  const handleCreateNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subject || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      title: formData.title,
      subject: formData.subject,
      content: formData.content,
      category: selectedCategory,
      productIds: formData.productIds || null,
      status: "draft",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: "outline",
      scheduled: "secondary",
      sent: "default",
    };
    return variants[status] || "outline";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Newsletter Management</h1>
        <p className="mt-2 text-muted-foreground">
          Create and manage product announcements by category
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Create Newsletter</TabsTrigger>
          <TabsTrigger value="list">Sent Newsletters</TabsTrigger>
        </TabsList>

        {/* Create Newsletter Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Newsletter</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateNewsletter} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Product Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category" data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NEWSLETTER_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1).replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => generateMutation.mutate({ category: selectedCategory, productIds: formData.productIds || undefined })}
                  disabled={generateMutation.isPending}
                  data-testid="button-generate-ai-content"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Content with AI
                    </>
                  )}
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="title">Newsletter Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Amazing New Yoga Mats"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    data-testid="input-newsletter-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Check Out Our New Yoga Collection"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    data-testid="input-newsletter-subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Email Content (HTML) *</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter HTML content for the email..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="min-h-64 font-mono text-sm"
                    data-testid="textarea-newsletter-content"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productIds">Featured Product IDs (optional)</Label>
                  <Input
                    id="productIds"
                    placeholder="e.g., prod1,prod2,prod3"
                    value={formData.productIds}
                    onChange={(e) => setFormData({ ...formData, productIds: e.target.value })}
                    data-testid="input-product-ids"
                  />
                  <p className="text-sm text-muted-foreground">Comma-separated list of product IDs to feature</p>
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full"
                  data-testid="button-create-newsletter"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {createMutation.isPending ? "Creating..." : "Create Newsletter Draft"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Newsletters List Tab */}
        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : newsletters.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No newsletters yet. Create one to get started!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {newsletters.map((newsletter) => (
                <Card key={newsletter.id} data-testid={`card-newsletter-${newsletter.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold" data-testid={`text-newsletter-title-${newsletter.id}`}>
                            {newsletter.title}
                          </h3>
                          <Badge variant={getStatusBadge(newsletter.status)}>
                            {newsletter.status}
                          </Badge>
                          <Badge variant="outline" data-testid={`badge-category-${newsletter.id}`}>
                            {newsletter.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{newsletter.subject}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          {newsletter.recipientCount !== null && (
                            <span data-testid={`text-recipients-${newsletter.id}`}>
                              {newsletter.recipientCount} recipients
                            </span>
                          )}
                          {newsletter.openRate && (
                            <span data-testid={`text-open-rate-${newsletter.id}`}>
                              Open rate: {newsletter.openRate}%
                            </span>
                          )}
                          <span data-testid={`text-date-${newsletter.id}`}>
                            {new Date(newsletter.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-view-${newsletter.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(newsletter.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${newsletter.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
