import { useState, useEffect } from "react";
import { Shield, Plus, Edit2, Trash2, Users } from "lucide-react";

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  user_count: number;
  created_at: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface CreateRoleData {
  name: string;
  description: string;
  permission_ids: number[];
}

export function RoleManagementTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<CreateRoleData>({
    name: "",
    description: "",
    permission_ids: [],
  });

  const API_BASE = "http://localhost:8000/api/roles";

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (err) {
      setError("Failed to fetch roles");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch(`${API_BASE}/permissions/`);
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      }
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
    }
  };

  const handleCreateRole = async () => {
    try {
      if (!formData.name.trim()) {
        setError("Role name is required");
        return;
      }

      const response = await fetch(`${API_BASE}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: "", description: "", permission_ids: [] });
        setIsModalOpen(false);
        fetchRoles();
      } else {
        setError("Failed to create role");
      }
    } catch (err) {
      setError("Error creating role");
      console.error(err);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      const response = await fetch(`${API_BASE}/${editingRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formData.description,
          permission_ids: formData.permission_ids,
        }),
      });

      if (response.ok) {
        setFormData({ name: "", description: "", permission_ids: [] });
        setIsEditMode(false);
        setEditingRole(null);
        setIsModalOpen(false);
        fetchRoles();
      }
    } catch (err) {
      setError("Error updating role");
      console.error(err);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      const response = await fetch(`${API_BASE}/${roleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchRoles();
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to delete role");
      }
    } catch (err) {
      setError("Error deleting role");
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingRole(null);
    setFormData({ name: "", description: "", permission_ids: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setIsEditMode(true);
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permission_ids: role.permissions.map((p) => p.id),
    });
    setIsModalOpen(true);
  };

  const togglePermission = (permissionId: number) => {
    setFormData((prev) => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter((id) => id !== permissionId)
        : [...prev.permission_ids, permissionId],
    }));
  };

  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-600" />
            Role Management
          </h1>
          <p className="text-gray-600 mt-1">Manage roles and permissions</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          <Plus className="w-5 h-5" />
          Create Role
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">⏳</div>
          <p className="text-gray-600 mt-2">Loading roles...</p>
        </div>
      ) : (
        /* Roles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-black">{role.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{role.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(role)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title="Edit role"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete role"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Users Count */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Users className="w-4 h-4" />
                <span>{role.user_count} users have this role</span>
              </div>

              {/* Permissions */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Permissions ({role.permissions.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.slice(0, 3).map((perm) => (
                    <span
                      key={perm.id}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                    >
                      {perm.name}
                    </span>
                  ))}
                  {role.permissions.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      +{role.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-black">
                {isEditMode ? "Edit Role" : "Create New Role"}
              </h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Role Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  disabled={isEditMode}
                  placeholder="e.g., Manager, Analyst"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe this role..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Permissions by Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Permissions
                </label>
                <div className="space-y-4">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 capitalize mb-3">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permission_ids.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 mt-0.5"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">
                                {perm.name}
                              </p>
                              <p className="text-gray-600 text-xs">{perm.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={isEditMode ? handleUpdateRole : handleCreateRole}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
              >
                {isEditMode ? "Update Role" : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
