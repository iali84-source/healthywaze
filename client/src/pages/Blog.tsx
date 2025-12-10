import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { BlogPost, CartItem } from "@shared/schema";
import { Calendar, User, ChevronRight, ArrowLeft, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { StorefrontFooter } from "@/components/StorefrontFooter";
import { CartDrawer } from "@/components/CartDrawer";
import { format } from "date-fns";

function useCartState() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load cart:", e);
      }
    }
  }, []);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartOpen,
    setCartOpen,
    cartItems,
    setCartItems,
    searchQuery,
    setSearchQuery,
    cartItemCount,
  };
}

function BlogListPage() {
  const cart = useCartState();
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StorefrontHeader 
        cartItemCount={cart.cartItemCount}
        onCartClick={() => cart.setCartOpen(true)}
        searchQuery={cart.searchQuery}
        onSearchChange={cart.setSearchQuery}
      />
      
      <main className="flex-1">
        <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-blog-title">
                Wellness Insights
              </h1>
              <p className="text-lg text-muted-foreground" data-testid="text-blog-subtitle">
                Tips, stories, and guidance from our family to yours. Stay informed about health, nutrition, and living well.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-20 mb-3" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <Card 
                      className="overflow-hidden hover-elevate cursor-pointer h-full flex flex-col"
                      data-testid={`card-blog-${post.id}`}
                    >
                      {post.featuredImage && (
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={post.featuredImage} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          {post.category && (
                            <Badge variant="secondary" data-testid={`badge-category-${post.id}`}>
                              {post.category}
                            </Badge>
                          )}
                          {post.isFromNewsletter && (
                            <Badge variant="outline">Newsletter</Badge>
                          )}
                        </div>
                        
                        <h2 
                          className="text-xl font-semibold mb-2 line-clamp-2"
                          data-testid={`text-post-title-${post.id}`}
                        >
                          {post.title}
                        </h2>
                        
                        {post.excerpt && (
                          <p 
                            className="text-muted-foreground mb-4 line-clamp-3 flex-1"
                            data-testid={`text-post-excerpt-${post.id}`}
                          >
                            {post.excerpt}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-4 border-t">
                          <div className="flex items-center gap-4">
                            {post.author && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {post.author}
                              </span>
                            )}
                            {post.publishedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(post.publishedAt), "MMM d, yyyy")}
                              </span>
                            )}
                          </div>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
                  <p className="text-muted-foreground mb-6">
                    We're preparing helpful wellness content for you. Check back soon for articles, tips, and archived newsletters.
                  </p>
                  <Link href="/">
                    <Button data-testid="button-back-home">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Store
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <StorefrontFooter />
      
      <CartDrawer
        open={cart.cartOpen}
        onClose={() => cart.setCartOpen(false)}
        items={cart.cartItems}
        onUpdateQuantity={(productId, quantity) => {
          cart.setCartItems(cart.cartItems.map(item =>
            item.productId === productId ? { ...item, quantity } : item
          ).filter(item => item.quantity > 0));
        }}
        onRemoveItem={(productId) => {
          cart.setCartItems(cart.cartItems.filter(item => item.productId !== productId));
        }}
      />
    </div>
  );
}

function BlogPostPage({ slug }: { slug: string }) {
  const cart = useCartState();
  
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
  });

  const headerProps = {
    cartItemCount: cart.cartItemCount,
    onCartClick: () => cart.setCartOpen(true),
    searchQuery: cart.searchQuery,
    onSearchChange: cart.setSearchQuery,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <StorefrontHeader {...headerProps} />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-full max-w-2xl mb-4" />
          <Skeleton className="h-6 w-64 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
        <StorefrontFooter />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <StorefrontHeader {...headerProps} />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center py-16">
            <h1 className="text-2xl font-semibold mb-2">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/blog">
              <Button data-testid="button-back-blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StorefrontHeader {...headerProps} />
      
      <main className="flex-1">
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back-blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {post.category && (
                <Badge variant="secondary" data-testid="badge-post-category">
                  {post.category}
                </Badge>
              )}
              {post.isFromNewsletter && (
                <Badge variant="outline">Newsletter Archive</Badge>
              )}
            </div>

            <h1 
              className="text-3xl md:text-4xl font-bold mb-4"
              data-testid="text-post-title"
            >
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              {post.author && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.author}
                </span>
              )}
              {post.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views} views
              </span>
            </div>
          </header>

          {post.featuredImage && (
            <div className="aspect-video rounded-lg overflow-hidden mb-8">
              <img 
                src={post.featuredImage} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            data-testid="content-post-body"
          >
            {post.content.split('\n').map((paragraph, index) => (
              paragraph.trim() ? (
                <p key={index}>{paragraph}</p>
              ) : (
                <br key={index} />
              )
            ))}
          </div>

          <footer className="mt-12 pt-8 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/blog">
                <Button variant="outline" data-testid="button-more-articles">
                  <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                  More Articles
                </Button>
              </Link>
              <Link href="/">
                <Button data-testid="button-shop-now">
                  Shop Wellness Products
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </footer>
        </article>
      </main>

      <StorefrontFooter />
      
      <CartDrawer
        open={cart.cartOpen}
        onClose={() => cart.setCartOpen(false)}
        items={cart.cartItems}
        onUpdateQuantity={(productId, quantity) => {
          cart.setCartItems(cart.cartItems.map(item =>
            item.productId === productId ? { ...item, quantity } : item
          ).filter(item => item.quantity > 0));
        }}
        onRemoveItem={(productId) => {
          cart.setCartItems(cart.cartItems.filter(item => item.productId !== productId));
        }}
      />
    </div>
  );
}

export default function Blog({ params }: { params?: { slug?: string } }) {
  if (params?.slug) {
    return <BlogPostPage slug={params.slug} />;
  }
  return <BlogListPage />;
}
