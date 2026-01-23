import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Leaf, BarChart3, Settings, Menu, X, ChevronRight, ChevronLeft, Home, Clock, Wind, BarChart2, Target, LifeBuoy, Bell, LogOut, Sparkles } from "lucide-react";

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const businessName = localStorage.getItem("business_name") || "CarbonPro";
  const businessId = localStorage.getItem("user_id");

  // Protect route - redirect if not logged in
  useEffect(() => {
    if (!businessId || businessId === "undefined") {
      navigate("/login");
    }
  }, [businessId, navigate]);

  useEffect(() => {
    const handleScroll = (e: any) => {
      setIsScrolled(e.target.scrollLeft > 10);
    };
    const section = document.querySelector("section");
    section?.addEventListener("scroll", handleScroll);
    return () => section?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex h-screen bg-white font-sans antialiased overflow-hidden">
      {/* ===== SIDEBAR - PREMIUM BLACK & WHITE ===== */}
      <aside className={`${
        isSidebarCollapsed ? "lg:w-20" : "lg:w-72"
      } fixed lg:static inset-y-0 left-0 w-72 bg-white text-gray-900 flex flex-col shadow-2xl border-r border-gray-200 transition-all duration-500 transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } z-50`}>
        
        {/* ===== PREMIUM HEADER ===== */}
        <div className={`relative ${isSidebarCollapsed ? "lg:px-2" : "px-6"} py-8 border-b border-gray-200 transition-all duration-500`}>
          <div className="relative flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-3 flex-1 animate-in fade-in duration-500">
                {/* Premium Logo */}
                <div className="relative group/logo">
                  <div className="relative w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg transition-all duration-500">
                    <Leaf className="w-5 h-5" />
                  </div>
                </div>

                {/* Company Branding */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-900 leading-none">CarbonPro</p>
                  <p className="text-xs text-gray-600 font-medium">Enterprise Platform</p>
                </div>

                {/* Premium Badge */}
                <div className="px-2.5 py-1 bg-black border border-gray-800 rounded-full">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    PRO
                  </span>
                </div>
              </div>
            )}

            {/* Mobile Close Button */}
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-700 hover:text-gray-900 transition-all duration-300 p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              className="hidden lg:flex p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-300"
              title={isSidebarCollapsed ? "Expand" : "Collapse"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ===== NAVIGATION MENU - PREMIUM DESIGN ===== */}
        <nav className={`flex-1 overflow-y-auto custom-scrollbar ${isSidebarCollapsed ? "lg:px-2" : "px-4"} py-6 space-y-2 scroll-smooth`}>
          {/* Main Navigation */}
          <div className="space-y-1">
            <p className={`text-xs uppercase tracking-wider font-bold text-gray-600 ${isSidebarCollapsed ? "lg:hidden" : "block"} mb-3 px-3`}>Main</p>
            <NavItem 
              icon={<Home className="w-5 h-5" />} 
              label="Dashboard" 
              active={location.pathname === "/dashboard"}
              collapsed={isSidebarCollapsed}
              onClick={() => { navigate("/dashboard"); setIsSidebarOpen(false); }}
              badge="Core"
              onHover={() => setHoveredItem("dashboard")}
              isHovered={hoveredItem === "dashboard"}
            />
          </div>

          {/* Analytics Section */}
          <div className="space-y-1 pt-4">
            <p className={`text-xs uppercase tracking-wider font-bold text-gray-600 ${isSidebarCollapsed ? "lg:hidden" : "block"} px-3`}>Analytics</p>
            <NavItem 
              icon={<Wind className="w-5 h-5" />} 
              label="Analytics" 
              active={location.pathname === "/dashboard/analytics"}
              collapsed={isSidebarCollapsed}
              onClick={() => { navigate("/dashboard/analytics"); setIsSidebarOpen(false); }}
              onHover={() => setHoveredItem("analytics")}
              isHovered={hoveredItem === "analytics"}
            />
            <NavItem 
              icon={<BarChart2 className="w-5 h-5" />} 
              label="Emissions Log" 
              active={location.pathname === "/dashboard/emissions"}
              collapsed={isSidebarCollapsed}
              onClick={() => { navigate("/dashboard/emissions"); setIsSidebarOpen(false); }}
              onHover={() => setHoveredItem("emissions")}
              isHovered={hoveredItem === "emissions"}
            />
          </div>

          {/* Operations Section */}
          <div className="space-y-1 pt-4">
            <p className={`text-xs uppercase tracking-wider font-bold text-gray-600 ${isSidebarCollapsed ? "lg:hidden" : "block"} px-3`}>Operations</p>
            <NavItem 
              icon={<BarChart3 className="w-5 h-5" />} 
              label="Reports" 
              active={location.pathname === "/dashboard/reports"}
              collapsed={isSidebarCollapsed}
              onClick={() => { navigate("/dashboard/reports"); setIsSidebarOpen(false); }}
              badge="NEW"
              badgeColor="black"
              onHover={() => setHoveredItem("reports")}
              isHovered={hoveredItem === "reports"}
            />
            <NavItem 
              icon={<Target className="w-5 h-5" />} 
              label="Goals" 
              active={location.pathname === "/dashboard/goals"}
              collapsed={isSidebarCollapsed}
              onClick={() => { navigate("/dashboard/goals"); setIsSidebarOpen(false); }}
              onHover={() => setHoveredItem("goals")}
              isHovered={hoveredItem === "goals"}
            />
          </div>

          {/* System Section */}
          <div className="space-y-1 pt-4 border-t border-gray-200">
            <p className={`text-xs uppercase tracking-wider font-bold text-gray-600 ${isSidebarCollapsed ? "lg:hidden" : "block"} px-3 pt-4`}>System</p>
            <NavItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Settings" 
              active={location.pathname === "/dashboard/settings"}
              collapsed={isSidebarCollapsed}
              onClick={() => { navigate("/dashboard/settings"); setIsSidebarOpen(false); }}
              onHover={() => setHoveredItem("settings")}
              isHovered={hoveredItem === "settings"}
            />
            <NavItem 
              icon={<LifeBuoy className="w-5 h-5" />} 
              label="Support" 
              active={location.pathname === "/dashboard/support"}
              collapsed={isSidebarCollapsed}
              onClick={() => { navigate("/dashboard/support"); setIsSidebarOpen(false); }}
              onHover={() => setHoveredItem("support")}
              isHovered={hoveredItem === "support"}
            />
          </div>
        </nav>

        {/* ===== PREMIUM FOOTER ===== */}
        <div className={`relative border-t border-gray-200 ${isSidebarCollapsed ? "lg:px-2" : "px-4"} py-6 transition-all duration-500`}>
          <div className="relative">
            {!isSidebarCollapsed ? (
              <div className="space-y-3 animate-in fade-in duration-500">
                {/* Status Indicator */}
                <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-300">
                  <div className="w-2.5 h-2.5 bg-black rounded-full" />
                  <span className="text-xs font-semibold text-gray-900">Active Session</span>
                </div>

                {/* Profile Card */}
                <button 
                  onClick={() => navigate("/dashboard/settings")} 
                  className="w-full group/profile relative overflow-hidden rounded-lg p-3 bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-300"
                >
                  <div className="relative flex items-center gap-3">
                    {(() => {
                      const profilePicture = localStorage.getItem("profile_picture");
                      return profilePicture ? (
                        <img 
                          src={profilePicture} 
                          alt={businessName}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-300"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center font-bold text-white text-sm border border-gray-800">
                          {businessName[0]?.toUpperCase()}
                        </div>
                      );
                    })()}
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{businessName}</p>
                      <p className="text-xs text-gray-600">Business Admin</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover/profile:text-gray-700 transition-all duration-300" />
                  </div>
                </button>

                {/* Logout Button */}
                <button 
                  onClick={() => { localStorage.clear(); navigate("/login"); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-300 text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button 
                  onClick={() => navigate("/dashboard/settings")} 
                  className="w-full flex items-center justify-center p-3 bg-black border border-gray-800 rounded-lg transition-all duration-300 text-white font-bold hover:bg-gray-900"
                  title={businessName}
                >
                  {businessName[0]?.toUpperCase()}
                </button>
                <button 
                  onClick={() => { localStorage.clear(); navigate("/login"); }}
                  className="w-full flex items-center justify-center p-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-300"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-40" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP HEADER - PREMIUM MINIMALIST */}
        <header className={`h-16 bg-white border-b transition-all duration-300 ${
          isScrolled ? "border-gray-300 shadow-sm" : "border-gray-200"
        } px-6 lg:px-8 flex items-center justify-between z-40`}>
          
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 font-semibold">
              <Clock className="w-4 h-4" />
              <span>Real-time Dashboard</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Live Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-900 rounded-full border border-gray-200 text-sm font-semibold">
              <div className="h-2 w-2 bg-black rounded-full" />
              <span>Live</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-black rounded-full" />
            </button>

            {/* User Profile Avatar */}
            <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center font-bold text-white text-sm cursor-pointer hover:bg-gray-900 transition-all group relative">
              {businessName[0]?.toUpperCase()}
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-3 hidden group-hover:flex flex-col gap-1 bg-white rounded-lg shadow-xl border border-gray-200 p-2 text-sm text-gray-700 z-50 whitespace-nowrap w-48">
                <div className="px-3 py-2 border-b border-gray-100 font-bold text-gray-900">{businessName}</div>
                <button className="text-left px-3 py-2 hover:bg-gray-100 rounded text-xs font-medium">Profile Settings</button>
                <button className="text-left px-3 py-2 hover:bg-gray-100 rounded text-xs font-medium">Help & Support</button>
                <button className="text-left px-3 py-2 hover:bg-gray-100 rounded text-xs font-medium border-t border-gray-100 text-gray-900">Account Settings</button>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT SECTION */}
        <section className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50">
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, collapsed = false, onClick, badge, badgeColor = "gray", onHover, isHovered }: any) {
  const badgeColors = {
    black: "bg-black text-white",
    gray: "bg-gray-200 text-gray-900",
  };

  return (
    <button 
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={() => onHover(null)}
      className={`w-full flex items-center gap-3 ${collapsed ? "px-2.5" : "px-4"} py-3.5 rounded-lg transition-all duration-300 text-sm font-semibold group relative ${
        active 
          ? "bg-black text-white shadow-lg" 
          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
      }`}
      title={collapsed ? label : ""}
    >
      {/* Active Indicator Line */}
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
      )}
      
      {/* Icon Container */}
      <span className={`flex-shrink-0 transition-all duration-300 ${active ? "text-white" : "text-gray-600 group-hover:text-gray-900"}`}>
        {icon}
      </span>
      
      {!collapsed && (
        <>
          <span className="flex-1 text-left relative z-10 transition-all duration-300">{label}</span>
          {badge && (
            <span className={`px-2 py-0.5 text-xs font-bold rounded ${badgeColors[badgeColor as keyof typeof badgeColors]}`}>
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}