import { Navigate, useLocation } from "react-router-dom";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  // Get user info from localStorage
  const isSuperAdmin = localStorage.getItem("is_super_admin") === "true";
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
  const location = useLocation();

  // Security Log: Track access attempts
  if (!token || !isSuperAdmin) {
    console.warn(`🔒 SECURITY: Unauthorized access attempt to ${location.pathname}`, {
      hasToken: !!token,
      isSuperAdmin: isSuperAdmin,
      timestamp: new Date().toISOString(),
    });
  }

  // Check authentication token first
  if (!token) {
    console.error("❌ Access Denied: No authentication token found");
    return <Navigate to="/login" replace />;
  }

  // Check super admin status
  if (!isSuperAdmin) {
    console.error("❌ Access Denied: User is not super admin");
    return <Navigate to="/dashboard" replace />;
  }

  // Check user ID exists (additional security layer)
  if (!userId) {
    console.error("❌ Access Denied: User ID not found");
    return <Navigate to="/login" replace />;
  }

  // All checks passed - user is authenticated and authorized
  console.log(`✅ Owner Dashboard access granted for user ${userId} to ${location.pathname}`);
  return <>{children}</>;
}
