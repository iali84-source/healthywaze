import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { BlogPost, InsertBlogPost } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, Calendar, ExternalLink, FileText } from "lucide-react";
import { format } from "date-fns";

export default function BlogManager() {
  const { toast } = useToast();
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InsertBlogPost>) => {
      return await apiRequest("POST", "/api/admin/blog", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setIsCreateOpen(false);
      toast({ title: "Blog post created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create blog post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertBlogPost>) => {
      return await apiRequest("PATCH", `/api/admin/blog/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setEditingPost(null);
      toast({ title: "Blog post updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update blog post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/blog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Blog post deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete blog post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Blog Manager</h1>
          <p className="text-muted-foreground">
            Create and manage blog posts and newsletter archives
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-post">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <BlogPostForm
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
              generateSlug={generateSlug}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} data-testid={`card-post-${post.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg truncate" data-testid={`text-post-title-${post.id}`}>
                        {post.title}
                      </h3>
                      <Badge variant={post.isPublished ? "default" : "secondary"}>
                        {post.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {post.isFromNewsletter && (
                        <Badge variant="outline">Newsletter</Badge>
                      )}
                    </div>
                    
                    {post.excerpt && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {post.category && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {post.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.isPublished && (
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        data-testid={`button-view-${post.id}`}
                      >
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    
                    <Dialog open={editingPost?.id === post.id} onOpenChange={(open) => !open && setEditingPost(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingPost(post)}
                          data-testid={`button-edit-${post.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <BlogPostForm
                          post={post}
                          onSubmit={(data) => updateMutation.mutate({ id: post.id, ...data })}
                          isLoading={updateMutation.isPending}
                          generateSlug={generateSlug}
                        />
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-delete-${post.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{post.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(post.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-testid="button-confirm-delete"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Blog Posts Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first blog post or convert newsletters into articles
              </p>
              <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface BlogPostFormProps {
  post?: BlogPost;
  onSubmit: (data: Partial<InsertBlogPost>) => void;
  isLoading: boolean;
  generateSlug: (title: string) => string;
}

function BlogPostForm({ post, onSubmit, isLoading, generateSlug }: BlogPostFormProps) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [category, setCategory] = useState(post?.category || "");
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || "");
  const [author, setAuthor] = useState(post?.author || "Healthywaze Team");
  const [isPublished, setIsPublished] = useState(post?.isPublished || false);
  const [isFromNewsletter, setIsFromNewsletter] = useState(post?.isFromNewsletter || false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!post) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      slug,
      excerpt: excerpt || undefined,
      content,
      category: category || undefined,
      featuredImage: featuredImage || undefined,
      author,
      isPublished,
      isFromNewsletter,
      publishedAt: isPublished ? new Date() : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{post ? "Edit Blog Post" : "Create Blog Post"}</DialogTitle>
        <DialogDescription>
          {post
            ? "Update your blog post content"
            : "Create a new blog post or convert a newsletter into an article"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter post title"
            required
            data-testid="input-title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="post-url-slug"
            required
            data-testid="input-slug"
          />
          <p className="text-xs text-muted-foreground">
            /blog/{slug || "your-post-slug"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Nutrition, Fitness"
              data-testid="input-category"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name"
              data-testid="input-author"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary of the post (displayed in listings)"
            rows={2}
            data-testid="input-excerpt"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog post content here..."
            rows={10}
            required
            data-testid="input-content"
          />
          <p className="text-xs text-muted-foreground">
            Write in plain text. Use blank lines to separate paragraphs.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="featuredImage">Featured Image URL (optional)</Label>
          <Input
            id="featuredImage"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            data-testid="input-featured-image"
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="isPublished"
              checked={isPublished}
              onCheckedChange={setIsPublished}
              data-testid="switch-published"
            />
            <Label htmlFor="isPublished">Published</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isFromNewsletter"
              checked={isFromNewsletter}
              onCheckedChange={setIsFromNewsletter}
              data-testid="switch-newsletter"
            />
            <Label htmlFor="isFromNewsletter">From Newsletter</Label>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading} data-testid="button-submit">
          {isLoading ? "Saving..." : post ? "Update Post" : "Create Post"}
        </Button>
      </DialogFooter>
    </form>
  );
}
