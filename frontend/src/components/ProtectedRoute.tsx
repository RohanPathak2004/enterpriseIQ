import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import type { UserRole } from "@/types";

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner label="Checking your session…" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !hasRole(...roles)) return <Navigate to="/" replace />;

  return <Outlet />;
}
