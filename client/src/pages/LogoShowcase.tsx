import healthyWazeLogo from "@assets/generated_images/healthywaze_professional_wellness_logo.png";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function LogoShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center">
          <img 
            src={healthyWazeLogo} 
            alt="Healthywaze Logo" 
            className="w-80 h-80 object-contain mb-8"
          />
          
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Your Brand
          </h1>
          
          <p className="text-xl text-muted-foreground text-center mb-8 max-w-xl">
            Professional Healthywaze logo. Modern, memorable, and yours to own.
          </p>
          
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg">
                Go to Admin
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-12 text-center text-muted-foreground">
          <p className="text-sm">
            Logo File: healthywaze_professional_wellness_logo.png
          </p>
          <p className="text-sm mt-2">
            Colors: Green (#22c55e) + Orange (#ff8c42) + Teal accent
          </p>
        </div>
      </div>
    </div>
  );
}
