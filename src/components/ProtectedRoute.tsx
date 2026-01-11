import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const LoadingSpinner = () => (
  <div className="min-h-screen bg-midnight flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <p className="text-gray-400 text-sm">Authenticating...</p>
    </div>
  </div>
);

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();

  // Show loading while checking auth
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If admin is required, check admin status
  if (requireAdmin) {
    // Still loading admin status
    if (adminLoading) {
      return <LoadingSpinner />;
    }

    // Not an admin, redirect to dashboard
    if (!isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
