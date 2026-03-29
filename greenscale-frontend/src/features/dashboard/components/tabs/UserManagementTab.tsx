import { useState, useEffect } from "react";
import { Users, Shield, Trash2, Plus, X } from "lucide-react";
import { API_URL } from "@/config/api";

interface User {
  id: number;
  business_name: string;
  email: string;
  roles: Role[];
  created_at: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

export function UserManagementTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleIds: [] as number[],
  });

  const API_BASE = API_URL;

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/super-admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
      setError("");
    } catch (err) {
      setError("Impossible de récupérer les utilisateurs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/roles/`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/super-admin/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          business_name: formData.name,
          email: formData.email,
          password: formData.password,
          role_ids: formData.roleIds,
        }),
      });

      if (response.ok) {
        setSuccess("Utilisateur créé avec succès !");
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          roleIds: [],
        });
        setIsCreateUserModalOpen(false);
        fetchUsers();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.detail || "Impossible de créer l’utilisateur");
      }
    } catch (err) {
      setError("Erreur lors de la création de l’utilisateur");
      console.error(err);
    }
  };

  const openRoleAssignModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles.map((r) => r.id));
    setIsRoleModalOpen(true);
  };

  const handleAssignRoles = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${API_BASE}/api/roles/assign-role/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          role_ids: selectedRoles,
        }),
      });

      if (response.ok) {
        setSuccess("Rôles attribués avec succès !");
        setIsRoleModalOpen(false);
        setSelectedUser(null);
        fetchUsers();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Erreur lors de l’attribution des rôles");
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

    try {
      const response = await fetch(`${API_BASE}/api/super-admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setSuccess("Utilisateur supprimé avec succès !");
        fetchUsers();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Erreur lors de la suppression de l’utilisateur");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-600 mt-1">Créez et gérez des utilisateurs, attribuez des rôles</p>
        </div>
        <button
          onClick={() => setIsCreateUserModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
        >
          <Plus size={20} />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="text-green-600 hover:text-green-800">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-600 hover:text-red-800">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement des utilisateurs...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun utilisateur pour l’instant</h3>
            <p className="text-gray-600 mb-4">Créez votre premier utilisateur pour commencer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rôles</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Créé le</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.business_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.roles.length === 0 ? (
                          <span className="text-xs text-gray-500">Aucun rôle</span>
                        ) : (
                          user.roles.map((role) => (
                            <span
                              key={role.id}
                              className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                            >
                              {role.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => openRoleAssignModal(user)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition"
                      >
                        <Shield size={14} className="inline mr-1" />
                        Rôles
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition"
                      >
                        <Trash2 size={14} className="inline mr-1" />
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-black">Créer un nouvel utilisateur</h2>
              <button
                onClick={() => {
                  setIsCreateUserModalOpen(false);
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    roleIds: [],
                  });
                  setError("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Jean Dupont"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  E-mail / identifiant
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 caractères
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Attribuer des rôles
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {roles.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucun rôle disponible</p>
                  ) : (
                    roles.map((role) => (
                      <label
                        key={role.id}
                        className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.roleIds.includes(role.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                roleIds: [...formData.roleIds, role.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                roleIds: formData.roleIds.filter(
                                  (id) => id !== role.id
                                ),
                              });
                            }
                          }}
                          className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {role.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {role.description}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateUserModalOpen(false);
                    setFormData({
                      name: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                      roleIds: [],
                    });
                    setError("");
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                >
                  Créer l’utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-black">Attribuer des rôles</h2>
              <p className="text-gray-600 mt-1">{selectedUser.business_name}</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRoles([...selectedRoles, role.id]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter((id) => id !== role.id)
                        );
                      }
                    }}
                    className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{role.name}</p>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsRoleModalOpen(false);
                  setSelectedUser(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleAssignRoles}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
              >
                Enregistrer les rôles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
