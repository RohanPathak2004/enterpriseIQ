import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

export function RoleGate({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { hasRole } = useAuth();
  if (!hasRole(...roles)) return null;
  return <>{children}</>;
}
