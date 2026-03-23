import { useState, useEffect } from "react";
import {
  Crown,
  Users,
  Shield,
  Settings,
  Trash2,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiUrl } from "@/config/api";

interface SuperAdminUser {
  id: number;
  email: string;
  business_name: string;
  is_super_admin: boolean;
  roles: string[];
  permissions: string[];
  created_at: string;
}

interface DashboardStats {
  total_users: number;
  total_super_admins: number;
  total_roles: number;
  total_permissions: number;
}

export function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [superAdmins, setSuperAdmins] = useState<SuperAdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<SuperAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"stats" | "super-admins" | "users">("stats");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const API_BASE = apiUrl("/api/super-admin");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch stats
      const statsRes = await fetch(`${API_BASE}/dashboard/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch super admins
      const superAdminsRes = await fetch(`${API_BASE}/users/super-admins`);
      if (superAdminsRes.ok) {
        const superAdminsData = await superAdminsRes.json();
        setSuperAdmins(superAdminsData);
      }

      // Fetch all users
      const usersRes = await fetch(`${API_BASE}/users`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setAllUsers(usersData);
      }
    } catch (err) {
      setError("Failed to fetch super admin data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const promoteUser = async (userId: number) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE}/users/${userId}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requester_id: 1 }),
      });

      if (response.ok) {
        setSuccessMessage("User promoted to super admin");
        setTimeout(() => {
          fetchData();
          setSuccessMessage("");
        }, 1500);
      } else {
        setError("Failed to promote user");
      }
    } catch (err) {
      setError("Error promoting user");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const demoteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to demote this user?")) {
      try {
        setActionLoading(true);
        const response = await fetch(`${API_BASE}/users/${userId}/demote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requester_id: 1 }),
        });

        if (response.ok) {
          setSuccessMessage("User demoted successfully");
          setTimeout(() => {
            fetchData();
            setSuccessMessage("");
          }, 1500);
        } else {
          setError("Failed to demote user");
        }
      } catch (err) {
        setError("Error demoting user");
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const deleteUser = async (userId: number, email: string) => {
    if (window.confirm(`Are you sure you want to delete ${email}? This cannot be undone.`)) {
      try {
        setActionLoading(true);
        const response = await fetch(`${API_BASE}/users/${userId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requester_id: 1 }),
        });

        if (response.ok) {
          setSuccessMessage("User deleted successfully");
          setTimeout(() => {
            fetchData();
            setSuccessMessage("");
          }, 1500);
        } else {
          setError("Failed to delete user");
        }
      } catch (err) {
        setError("Error deleting user");
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Crown className="w-8 h-8 text-yellow-600" />
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-3 gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-gap-3 gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "stats"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Dashboard Stats
          </div>
        </button>
        <button
          onClick={() => setActiveTab("super-admins")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "super-admins"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Super Admins
          </div>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "users"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            All Users
          </div>
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold">{stats.total_users}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Super Admins</p>
                <p className="text-3xl font-bold">{stats.total_super_admins}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Total Roles</p>
                <p className="text-3xl font-bold">{stats.total_roles}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Settings className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Total Permissions</p>
                <p className="text-3xl font-bold">{stats.total_permissions}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Super Admins Tab */}
      {activeTab === "super-admins" && (
        <Card>
          <CardHeader>
            <CardTitle>Super Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            {superAdmins.length === 0 ? (
              <p className="text-gray-600">No super admins found</p>
            ) : (
              <div className="space-y-4">
                {superAdmins.map((admin) => (
                  <div key={admin.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-600" />
                        <p className="font-semibold">{admin.business_name}</p>
                      </div>
                      <p className="text-gray-600 text-sm">{admin.email}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Created: {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {admin.roles.map((role) => (
                          <span key={role} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => demoteUser(admin.id)}
                      disabled={actionLoading}
                      className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors disabled:opacity-50"
                      title="Demote from super admin"
                    >
                      <UserPlus className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {allUsers.length === 0 ? (
              <p className="text-gray-600">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Business Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Roles</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{user.business_name}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">
                          {user.is_super_admin ? (
                            <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs w-fit">
                              <Crown className="w-3 h-3" />
                              Super Admin
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs w-fit">
                              Regular User
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1 flex-wrap">
                            {user.roles.slice(0, 2).map((role) => (
                              <span key={role} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                                {role}
                              </span>
                            ))}
                            {user.roles.length > 2 && (
                              <span className="text-gray-500 text-xs">+{user.roles.length - 2} more</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            {!user.is_super_admin && (
                              <button
                                onClick={() => promoteUser(user.id)}
                                disabled={actionLoading}
                                className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors disabled:opacity-50"
                                title="Promote to super admin"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                            )}
                            {user.is_super_admin && (
                              <button
                                onClick={() => demoteUser(user.id)}
                                disabled={actionLoading}
                                className="text-orange-600 hover:bg-orange-50 p-1 rounded transition-colors disabled:opacity-50"
                                title="Demote from super admin"
                              >
                                <UserPlus className="w-4 h-4 rotate-180" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteUser(user.id, user.email)}
                              disabled={actionLoading}
                              className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors disabled:opacity-50"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
