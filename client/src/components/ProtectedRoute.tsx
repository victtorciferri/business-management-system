import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Don't do anything while still loading
    if (isLoading) return;

    // If user is not logged in, redirect to auth page
    if (!user) {
      setLocation("/auth");
      return;
    }

    // If requiredRole is specified, check if user has that role
    if (requiredRole && user.role !== requiredRole) {
      setAccessDenied(true);
    } else {
      setAccessDenied(false);
    }
  }, [user, isLoading, requiredRole, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  // If access is denied due to role
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-8 bg-destructive/10 rounded-lg">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="mb-4">You don't have permission to access this page.</p>
          <button 
            onClick={() => setLocation("/")} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // If user is not logged in, we'll handle redirect in useEffect
  // Just return null to avoid flashing content
  if (!user) {
    return null;
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
}