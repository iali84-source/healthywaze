import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ShoppingBag, TrendingUp, Zap } from "lucide-react";
import healthyWazeLogo from "@assets/generated_images/healthywaze_professional_wellness_logo.png";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginError, setLoginError] = useState<string>("");
  const [registerError, setRegisterError] = useState<string>("");

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    return <Redirect to="/admin" />;
  }

  const handleLogin = (data: z.infer<typeof loginSchema>) => {
    setLoginError("");
    loginMutation.mutate(data, {
      onError: (error) => {
        setLoginError(error.message || "Login didn't work. Please try again.");
      }
    });
  };

  const handleRegister = (data: z.infer<typeof insertUserSchema>) => {
    setRegisterError("");
    registerMutation.mutate(data, {
      onError: (error) => {
        setRegisterError(error.message || "Registration didn't work. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <img 
                src={healthyWazeLogo} 
                alt="Healthywaze Logo" 
                className="h-12 w-12 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold mb-2">Healthywaze</h1>
            <p className="text-muted-foreground">
              Admin Dashboard
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>
                    Enter your credentials to access the admin panel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      {loginError && (
                        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm" data-testid="text-login-error">
                          {loginError}
                        </div>
                      )}
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter your username"
                                data-testid="input-username"
                                autoComplete="username"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Enter your password"
                                data-testid="input-password"
                                autoComplete="current-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                      >
                        {loginMutation.isPending ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Admin Account</CardTitle>
                  <CardDescription>
                    Register a new admin account to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                      {registerError && (
                        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm" data-testid="text-register-error">
                          {registerError}
                        </div>
                      )}
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Choose a username"
                                data-testid="input-register-username"
                                autoComplete="username"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Choose a password (min 6 characters)"
                                data-testid="input-register-password"
                                autoComplete="new-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <h2 className="text-4xl font-bold mb-6">
            Trusted Wellness, Made Simple
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Bring your family's wellness story to the world with a platform built on trust, not hype
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-foreground/10 rounded-lg">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Family-Tested Products</h3>
                <p className="text-primary-foreground/80">
                  Curate and sell products your family and community actually trusts
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-foreground/10 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Real-Time Analytics</h3>
                <p className="text-primary-foreground/80">
                  See what resonates with customers and scale what works
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-foreground/10 rounded-lg">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Streamlined Operations</h3>
                <p className="text-primary-foreground/80">
                  Focus on what matters—your customers—we handle the rest
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
