import { StorefrontHeader } from "@/components/StorefrontHeader";
import { StorefrontFooter } from "@/components/StorefrontFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StorefrontHeader cartItemCount={0} onCartClick={() => {}} searchQuery="" onSearchChange={() => {}} />
      
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg md:text-xl text-primary font-semibold mb-4">
            Your Wellness Journey Made Simple
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Coming Soon</h1>
          <p className="text-xl text-muted-foreground max-w-md">
            We're working hard to bring you something amazing. Check back soon!
          </p>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
