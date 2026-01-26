import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useUserPermission } from "../hooks/usePermissions";

interface ProtectedComponentProps {
  children: ReactNode;
  requiredPermission: string;
  userId: number;
  fallback?: ReactNode;
}

/**
 * Component that only renders if user has the required permission
 */
export function ProtectedComponent({
  children,
  requiredPermission,
  userId,
  fallback,
}: ProtectedComponentProps) {
  const { hasPermission, loading } = useUserPermission(userId, requiredPermission);

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!hasPermission) {
    return (
      fallback || (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <Lock className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-900">Access Denied</p>
            <p className="text-sm text-yellow-800">
              You don't have permission to access this feature.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

interface ProtectedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  requiredPermission: string;
  userId: number;
  children: ReactNode;
}

/**
 * Button that is disabled if user doesn't have required permission
 */
export function ProtectedButton({
  requiredPermission,
  userId,
  children,
  ...props
}: ProtectedButtonProps) {
  const { hasPermission, loading } = useUserPermission(userId, requiredPermission);

  return (
    <button
      {...props}
      disabled={!hasPermission || loading || props.disabled}
      title={!hasPermission ? "You don't have permission for this action" : ""}
      className={`${props.className} ${
        !hasPermission || loading
          ? "opacity-50 cursor-not-allowed"
          : ""
      }`}
    >
      {children}
    </button>
  );
}
