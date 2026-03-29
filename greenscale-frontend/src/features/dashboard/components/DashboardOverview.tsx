import { useState, useEffect } from "react";
import { Zap, Flame, Fuel, Trash2, TrendingUp, Calendar, X, DollarSign, BarChart3, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddEmissionModal } from "./AddEmissionModal";
import { CategoryChart } from "./CategoryChart";
import { MonthlyChart } from "./MonthlyChart";
import { transformCategoryData, transformMonthlyData, formatCO2 } from "./ChartUtils";
import { apiUrl } from "@/config/api";

interface CategoryData {
  type: string;
  impact: number;
}

interface MonthlyData {
  month: string;
  impact: number;
  year: number;
}

export function DashboardOverview() {
  const navigate = useNavigate();
  const businessName = localStorage.getItem("business_name") || "Entreprise";
  const businessId = localStorage.getItem("user_id");
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [stats, setStats] = useState({ 
    total_co2: 0, 
    total_kwh: 0, 
    total_gas: 0, 
    log_count: 0 
  });
  const [logs, setLogs] = useState([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<'Electricity' | 'Natural Gas' | 'Fuel' | 'Waste'>('Electricity');
  const [chartsLoading, setChartsLoading] = useState(true);

  // Filter states
  const [filterEmissionType, setFilterEmissionType] = useState("All");
  const [filterDateRange, setFilterDateRange] = useState("month");

  const dateRangeOptions = [
    { id: "today", label: "Aujourd’hui", days: 1 },
    { id: "7d", label: "7j", days: 7 },
    { id: "month", label: "Mois", days: 30 },
    { id: "6m", label: "6m", days: 180 },
    { id: "year", label: "Année", days: 365 },
    { id: "all", label: "Tout", days: null },
  ];

  const getDateRangeParams = (rangeId: string) => {
    const today = new Date();
    const option = dateRangeOptions.find(o => o.id === rangeId);
    
    if (!option || option.days === null) {
      return { start_date: null, end_date: null }; // All time
    }

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - option.days);
    
    return {
      start_date: startDate.toISOString().split("T")[0],
      end_date: today.toISOString().split("T")[0],
    };
  };

  const fetchData = async (selectedRange?: string) => {
    if (!businessId || businessId === "undefined") {
      console.log("❌ No business ID found:", businessId);
      return;
    }

    const range = selectedRange || filterDateRange;
    const dateParams = getDateRangeParams(range);
    
    console.log("📊 Fetching data for business ID:", businessId, "Range:", range, "Dates:", dateParams);
    setIsLoading(true);
    setChartsLoading(true);

    try {
      // Build query params
      const statsParams = new URLSearchParams();
      if (dateParams.start_date) statsParams.append("start_date", dateParams.start_date);
      if (dateParams.end_date) statsParams.append("end_date", dateParams.end_date);

      // Fetch dashboard stats
      const statsRes = await fetch(apiUrl(`/dashboard-stats/${businessId}?${statsParams}`));
      if (!statsRes.ok) throw new Error("Impossible de récupérer les statistiques");
      const statsData = await statsRes.json();
      setStats(statsData);
      console.log("✅ Stats fetched:", statsData);

      // Fetch recent logs
      const logsRes = await fetch(apiUrl(`/recent-logs/${businessId}?${statsParams}`));
      if (!logsRes.ok) throw new Error("Impossible de récupérer les journaux");
      const logsData = await logsRes.json();
      setLogs(logsData);
      console.log("✅ Logs fetched:", logsData);

      // Fetch category breakdown
      const categoryRes = await fetch(apiUrl(`/category-breakdown/${businessId}?${statsParams}`));
      if (!categoryRes.ok) throw new Error("Impossible de récupérer les données par catégorie");
      const categoryDataJson = await categoryRes.json();
      setCategoryData(categoryDataJson.data || []);
      console.log("✅ Category data fetched:", categoryDataJson.data);

      // Fetch monthly trends
      const monthlyRes = await fetch(apiUrl(`/monthly-trends/${businessId}?${statsParams}`));
      if (!monthlyRes.ok) throw new Error("Impossible de récupérer les données mensuelles");
      const monthlyDataJson = await monthlyRes.json();
      setMonthlyData(monthlyDataJson.data || []);
      console.log("✅ Monthly data fetched:", monthlyDataJson.data);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setIsLoading(false);
      setChartsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [businessId, filterDateRange]);

  const statCards = [
    {
      icon: Zap,
      label: "Électricité",
      value: formatCO2(stats.total_kwh),
      unit: "kg CO₂e",
      change: "+2.2%",
      positive: true,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Flame,
      label: "Gaz naturel",
      value: formatCO2(stats.total_gas),
      unit: "kg CO₂e",
      change: "-2.2%",
      positive: false,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Fuel,
      label: "Carburant",
      value: formatCO2(stats.total_co2 / 2),
      unit: "kg CO₂e",
      change: "-2.2%",
      positive: false,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Trash2,
      label: "Déchets",
      value: formatCO2(stats.total_co2 / 3),
      unit: "kg CO₂e",
      change: "+2.2%",
      positive: true,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: TrendingUp,
      label: "Émissions totales",
      value: formatCO2(stats.total_co2),
      unit: "kg CO₂e",
      change: "+1.5%",
      positive: true,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="min-h-screen pb-12 bg-white">
      {/* Premium Minimalist Header Section */}
      <div className="mb-12">
        <div className="bg-gradient-to-r from-white via-green-50 to-white rounded-3xl p-8 md:p-12 mb-8 border border-green-200/50">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-2 tracking-widest">APERÇU</p>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">
                Bon retour,<br /><span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">{businessName}</span>
              </h1>
              <p className="text-slate-600 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Données pour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" })}
              </p>
            </div>

            {/* Date Range Filter Buttons */}
            <div className="flex flex-wrap gap-2 md:flex-nowrap">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFilterDateRange(option.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterDateRange === option.id
                      ? "bg-green-600 text-white shadow-md"
                      : "text-slate-500 hover:text-slate-900 border border-gray-200 hover:border-green-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button className="px-4 py-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors flex items-center gap-1 border border-gray-200 rounded-lg hover:border-green-300">
                <Calendar className="w-4 h-4" /> Personnalisé
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stat Cards Section */}
        <div className="lg:col-span-3">
          {/* Premium Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`${card.bgColor} ${card.color} w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${card.positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {card.positive ? "+" : ""}{card.change}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">{card.label}</p>
                  <p className="text-3xl font-black text-slate-900 mb-1">{card.value}</p>
                  <p className="text-xs text-slate-400">{card.unit}</p>
                </div>
              );
            })}
          </div>

          {/* New Financial & ROI Modules Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Financial Module Card */}
            <div 
              onClick={() => navigate("/dashboard/financial")}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-blue-200 cursor-pointer group hover:scale-105"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="bg-blue-500/10 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  💼 Nouveau
                </span>
              </div>
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">Module financier</p>
              <p className="text-2xl font-black text-slate-900 mb-3">Coûts carbone</p>
              <p className="text-sm text-slate-600 mb-4">Suivez les coûts liés aux émissions dans plusieurs devises, définissez des budgets et mesurez l’impact financier.</p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                <span>Voir le tableau financier</span>
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            {/* ROI Calculator Card */}
            <div 
              onClick={() => navigate("/dashboard/roi")}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-purple-200 cursor-pointer group hover:scale-105"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="bg-purple-500/10 text-purple-600 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                  📈 Nouveau
                </span>
              </div>
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">Calculateur de ROI</p>
              <p className="text-2xl font-black text-slate-900 mb-3">Analyse des économies</p>
              <p className="text-sm text-slate-600 mb-4">Comparez les performances mois par mois et visualisez votre ROI environnemental ainsi que les économies réalisées.</p>
              <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm group-hover:gap-3 transition-all">
                <span>Voir l’analyse ROI</span>
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            {/* Supply Chain Card */}
            <div 
              onClick={() => navigate("/dashboard/scope3")}
              className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-green-200/60 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="bg-green-100 text-green-600 w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                  🚚 Nouveau
                </span>
              </div>
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1">Chaîne d’approvisionnement</p>
              <p className="text-lg font-black text-slate-900 mb-2">Périmètre 3</p>
              <p className="text-xs text-slate-600 mb-3 line-clamp-2">Suivez les émissions des fournisseurs et gérez les notations de durabilité.</p>
              <div className="flex items-center gap-2 text-green-600 font-semibold text-xs group-hover:gap-3 transition-all">
                <span>Gérer</span>
                <Truck className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Billing Setup Card */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-8 border border-amber-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-amber-100 text-amber-600 w-10 h-10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">⚡ Commencer avec la facturation & les tarifs</p>
                    <p className="text-xs text-slate-600">Configurez vos tarifs d’énergie pour suivre l’impact financier des émissions</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard/settings")}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all text-sm whitespace-nowrap"
              >
                Configurer
              </button>
            </div>
          </div>

          {/* Charts Grid - Premium Design */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Trend Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tendance financière</h3>
                  <p className="text-xs text-slate-500">Analyse des émissions</p>
                </div>
              </div>
              {chartsLoading ? (
                <div className="h-64 flex items-center justify-center text-gray-400">Chargement...</div>
              ) : (
                <MonthlyChart data={transformMonthlyData(monthlyData)} />
              )}
            </div>

            {/* Category Breakdown Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Émissions</h3>
                  <p className="text-xs text-slate-500">Répartition</p>
                </div>
              </div>
              {chartsLoading ? (
                <div className="h-64 flex items-center justify-center text-gray-400">Chargement...</div>
              ) : (
                <CategoryChart data={transformCategoryData(categoryData)} />
              )}
            </div>
          </div>

          {/* Quick Add Buttons - Minimal Design */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => {
                setType("Electricity");
                setIsModalOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Électricité</span>
            </button>
            <button
              onClick={() => {
                setType("Natural Gas");
                setIsModalOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Gaz</span>
            </button>
            <button
              onClick={() => {
                setType("Fuel");
                setIsModalOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Fuel className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Carburant</span>
            </button>
            <button
              onClick={() => {
                setType("Waste");
                setIsModalOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Déchets</span>
            </button>
          </div>
        </div>

        {/* Filters Sidebar - Premium Minimal */}
        <div
          className={`${
            isFiltersOpen ? "fixed inset-0 z-50 lg:static lg:z-0" : "hidden lg:block"
          } bg-white rounded-2xl p-6 shadow-sm border border-gray-100`}
        >
          {/* Close button for mobile */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h3 className="text-lg font-bold text-slate-900">Filtres</h3>
            <button
              onClick={() => setIsFiltersOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Ajout rapide</h3>
          </div>

          {/* Quick Add in Sidebar */}
          <div className="space-y-2 mb-8 lg:flex lg:flex-col gap-2">
            <button
              onClick={() => {
                setType("Electricity");
                setIsModalOpen(true);
                setIsFiltersOpen(false);
              }}
              className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-semibold transition-all text-sm flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> Électricité
            </button>
            <button
              onClick={() => {
                setType("Natural Gas");
                setIsModalOpen(true);
                setIsFiltersOpen(false);
              }}
              className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-semibold transition-all text-sm flex items-center gap-2"
            >
              <Flame className="w-4 h-4" /> Gaz
            </button>
            <button
              onClick={() => {
                setType("Fuel");
                setIsModalOpen(true);
                setIsFiltersOpen(false);
              }}
              className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-semibold transition-all text-sm flex items-center gap-2"
            >
              <Fuel className="w-4 h-4" /> Carburant
            </button>
            <button
              onClick={() => {
                setType("Waste");
                setIsModalOpen(true);
                setIsFiltersOpen(false);
              }}
              className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-semibold transition-all text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Déchets
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Filtres</h3>

            {/* Filter Groups */}
            <div className="space-y-4">
              {/* Emission Type Filter */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-2">Type</label>
                <select
                  value={filterEmissionType}
                  onChange={(e) => setFilterEmissionType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 bg-gray-50 text-gray-900 font-medium text-sm"
                >
                  <option value="All">Tous les types</option>
                  <option value="Electricity">Électricité</option>
                  <option value="Natural Gas">Gaz naturel</option>
                  <option value="Fuel">Carburant</option>
                  <option value="Waste">Déchets</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-2">Période</label>
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 bg-gray-50 text-gray-900 font-medium text-sm"
                >
                  <option value="today">Aujourd’hui</option>
                  <option value="7d">7 derniers jours</option>
                  <option value="month">Ce mois-ci</option>
                  <option value="6m">6 derniers mois</option>
                  <option value="year">Cette année</option>
                  <option value="all">Depuis le début</option>
                </select>
              </div>

              {/* Team Filter */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-2">Équipe</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 bg-gray-50 text-gray-900 font-medium text-sm">
                  <option>{businessName}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-8">
            <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all text-sm">
              Appliquer
            </button>
            <button className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-all text-sm">
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {isFiltersOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={() => setIsFiltersOpen(false)} />
      )}

      {/* Add Emission Modal */}
      <AddEmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}