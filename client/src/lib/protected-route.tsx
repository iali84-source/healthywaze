import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  requireRole,
}: {
  path: string;
  component: () => React.JSX.Element;
  requireRole?: 'admin' | 'customer';
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (requireRole && user.role !== requireRole) {
    return (
      <Route path={path}>
        <Redirect to={user.role === 'admin' ? '/admin' : '/'} />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
