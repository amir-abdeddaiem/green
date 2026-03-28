import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  Leaf, BarChart3, Settings, Menu, X, Home, Wind, BarChart2, Target, 
  LifeBuoy, Bell, LogOut, ChevronLeft, Search, Crown, DollarSign, TrendingUp, Globe, Truck,
  Download,
  FileText,
  Plug2Icon
} from "lucide-react";
import { ChatWidget } from "./ChatWidget";
import { CurrencyProvider, useCurrency } from "../context/CurrencyContext";

export function DashboardLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const businessName = localStorage.getItem("business_name") || "CarbonPro";
  const businessId = localStorage.getItem("user_id");
  const profilePicture = localStorage.getItem("profile_picture") || "";
  const isSuperAdmin = localStorage.getItem("is_super_admin") === "true";

  useEffect(() => {
    if (!businessId || businessId === "undefined") {
      navigate("/login");
    }
  }, [businessId, navigate]);

  // Update date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: Home },
    { label: "integration", path: "/dashboard/integration", icon: Plug2Icon },
    { label: "docs", path: "/dashboard/docs", icon: Download },
   
    { label: "Analytics", path: "/dashboard/analytics", icon: Wind },
    { label: "Emissions", path: "/dashboard/emissions", icon: BarChart2 },
    { label: "Reports", path: "/dashboard/reports", icon: BarChart3 },
    { label: "Goals", path: "/dashboard/goals", icon: Target },
    { label: "Financial", path: "/dashboard/financial", icon: DollarSign },
    { label: "ROI", path: "/dashboard/roi", icon: TrendingUp },
    { label: "Supply Chain", path: "/dashboard/scope3", icon: Truck },
  ];

  return (
    <CurrencyProvider>
      <DashboardContent 
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        currentDateTime={currentDateTime}
        isProfileDropdownOpen={isProfileDropdownOpen}
        setIsProfileDropdownOpen={setIsProfileDropdownOpen}
        navigate={navigate}
        location={location}
        businessName={businessName}
        businessId={businessId}
        profilePicture={profilePicture}
        isSuperAdmin={isSuperAdmin}
        navItems={navItems}
      />
    </CurrencyProvider>
  );
}

interface DashboardContentProps {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (val: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (val: boolean) => void;
  currentDateTime: Date;
  isProfileDropdownOpen: boolean;
  setIsProfileDropdownOpen: (val: boolean) => void;
  navigate: any;
  location: any;
  businessName: string;
  businessId: string | null;
  profilePicture: string;
  isSuperAdmin: boolean;
  navItems: any[];
}

function DashboardContent({
  isSidebarExpanded,
  setIsSidebarExpanded,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  currentDateTime,
  isProfileDropdownOpen,
  setIsProfileDropdownOpen,
  navigate,
  location,
  businessName,
  businessId,
  profilePicture,
  isSuperAdmin,
  navItems,
}: DashboardContentProps) {
  return (
    <div className="flex h-screen bg-white">
      {/* ===== SIDEBAR - WHITE & GREEN PROFESSIONAL DESIGN ===== */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col ${
          isSidebarExpanded ? "w-64" : "w-20"
        } ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo & Hamburger */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
          {isSidebarExpanded && (
            <img
    src="/Verdustry.svg"
    alt="Verdustry Logo"
    className="h-9 w-auto object-contain"
  />
          )}
          {!isSidebarExpanded && (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10  rounded-md flex items-center justify-center">
                <img
    src="/verdusty.png"
    alt="Verdustry Logo"
    className="h-9 w-auto object-contain"
  />
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="hidden lg:flex text-gray-600 hover:text-green-600 transition-colors p-1"
            title={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${!isSidebarExpanded ? "rotate-180" : ""}`} />
          </button>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden text-gray-600 hover:text-black p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 relative group ${
                  isActive
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:text-black hover:bg-gray-100"
                }`}
                title={!isSidebarExpanded ? item.label : ""}
              >
                {/* Active indicator - left bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r"></div>
                )}
                
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? "text-white" : "group-hover:text-green-600"
                }`} />
                
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout - Footer */}
        <div className="px-3 py-4 border-t border-gray-200">
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR - WHITE/LIGHT GREY */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Search Bar */}
            <div className="hidden sm:flex flex-1 max-w-md items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search emissions, goals..."
                className="bg-transparent text-sm text-black placeholder-gray-500 outline-none flex-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Date and Time Display */}
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-semibold text-black">
                {currentDateTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-500">
                {currentDateTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-600 rounded-full"></span>
            </button>

            {/* Currency Selector */}
            <CurrencyToggle />            {/* Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition"
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-10 h-10 rounded-lg object-cover border-2 border-green-600"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                    {businessName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-black font-semibold text-sm">{businessName}</p>
                  <p className="text-gray-500 text-xs">Admin</p>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48 overflow-hidden">
                  {/* Admin Dashboard Option - Only for Super Admin */}
                  {isSuperAdmin && (
                    <button
                      onClick={() => {
                        navigate("/admin-dashboard");
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-yellow-700 hover:bg-yellow-50 transition border-b border-gray-100 font-semibold"
                    >
                      <Crown className="w-5 h-5 text-yellow-600" />
                      <span>👑 Owner Dashboard</span>
                    </button>
                  )}

                  {/* Settings Option */}
                  <button
                    onClick={() => {
                      navigate("/dashboard/settings");
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition border-b border-gray-100"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Settings</span>
                  </button>

                  {/* Support Option */}
                  <button
                    onClick={() => {
                      navigate("/dashboard/support");
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition border-b border-gray-100"
                  >
                    <LifeBuoy className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Support</span>
                  </button>

                  {/* Logout Option */}
                  <button
                    onClick={() => {
                      localStorage.clear();
                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CANVAS - MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-8 py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Chat Widget - Visible on All Dashboard Pages */}
      <ChatWidget businessId={businessId || "0"} userName={businessName} />

      {/* Profile Dropdown Overlay */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </div>
  );
}

// Currency Toggle Component
function CurrencyToggle() {
  const { displayCurrency, setDisplayCurrency, supportedCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{displayCurrency}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {supportedCurrencies.map((currency) => (
            <button
              key={currency}
              onClick={() => {
                setDisplayCurrency(currency);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition ${
                displayCurrency === currency
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {currency}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
