import { useState, useEffect } from "react";

interface PermissionCheckResponse {
  user_id: number;
  permission: string;
  has_permission: boolean;
  roles: string[];
}

const API_BASE = "http://localhost:8000/api/roles";

/**
 * Hook to check if user has a specific permission
 */
export function useUserPermission(userId: number, permission: string) {
  const [hasPermission, setHasPermission] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/user/${userId}/check-permission?permission=${permission}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (response.ok) {
          const data: PermissionCheckResponse = await response.json();
          setHasPermission(data.has_permission);
          setRoles(data.roles);
        }
      } catch (err) {
        console.error("Error checking permission:", err);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [userId, permission]);

  return { hasPermission, roles, loading };
}

/**
 * Hook to get all permissions for a user
 */
export function useUserPermissions(userId: number) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(`${API_BASE}/user/${userId}/permissions`);
        if (response.ok) {
          const data = await response.json();
          setPermissions(data);
        }
      } catch (err) {
        console.error("Error fetching permissions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId]);

  return { permissions, loading };
}

/**
 * Hook to get all roles for a user
 */
export function useUserRoles(userId: number) {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${API_BASE}/user/${userId}/roles`);
        if (response.ok) {
          const data = await response.json();
          setRoles(data);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [userId]);

  return { roles, loading };
}

/**
 * Helper function to check if user has any of the given permissions
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((perm) => userPermissions.includes(perm));
}

/**
 * Helper function to check if user has all of the given permissions
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((perm) => userPermissions.includes(perm));
}
