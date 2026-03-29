import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, Settings, Users, BarChart3, AlertCircle } from "lucide-react";

interface NavLink {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

export const SuperAdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Security check - verify super admin access
  useEffect(() => {
    const isSuperAdmin = localStorage.getItem("is_super_admin") === "true";
    const token = localStorage.getItem("token");

    if (!token || !isSuperAdmin) {
      console.warn("⚠️ Unauthorized access attempt to Owner Dashboard");
      navigate("/dashboard");
      return;
    }

    setLoading(false);
  }, [navigate]);

  const navLinks: NavLink[] = [
    {
      id: "dashboard",
      label: "Tableau de bord",
      icon: <BarChart3 size={20} />,
      href: "/admin-dashboard",
    },
    {
      id: "user-management",
      label: "Gestion des utilisateurs",
      icon: <Users size={20} />,
      href: "/admin-dashboard/users",
    },
    {
      id: "settings",
      label: "Paramètres système",
      icon: <Settings size={20} />,
      href: "/admin-dashboard/settings",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord propriétaire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-green-700 to-green-800 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-green-600 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-2xl font-bold">Verdustry</h1>
              <p className="text-xs text-green-100">Tableau de bord propriétaire</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-green-600 rounded-lg transition"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => navigate(link.href)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-600 transition text-left"
            >
              {link.icon}
              {sidebarOpen && <span>{link.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-green-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition text-left"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Security Banner */}
        <div className="bg-blue-50 border-b border-blue-200 px-8 py-3 flex items-center gap-3">
          <AlertCircle size={18} className="text-blue-600" />
          <p className="text-sm text-blue-800 font-medium">
            🔒 Accès restreint : tableau de bord propriétaire — uniquement accessible au propriétaire de l’entreprise
          </p>
        </div>

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800">Tableau de bord propriétaire</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">Administrateur</p>
              <p className="text-xs text-gray-500">Accès super admin</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
              👑
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
};
