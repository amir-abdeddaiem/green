import { useState, useEffect } from "react";
import { Zap, Flame, Fuel, Trash2, TrendingUp, Calendar, X, DollarSign, BarChart3, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddEmissionModal } from "./AddEmissionModal";
import { CategoryChart } from "./CategoryChart";
import { MonthlyChart } from "./MonthlyChart";
import { transformCategoryData, transformMonthlyData, formatCO2 } from "./ChartUtils";

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
  const businessName = localStorage.getItem("business_name") || "Business";
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
    { id: "today", label: "Today", days: 1 },
    { id: "7d", label: "7D", days: 7 },
    { id: "month", label: "Month", days: 30 },
    { id: "6m", label: "6M", days: 180 },
    { id: "year", label: "Year", days: 365 },
    { id: "all", label: "All", days: null },
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
      const statsRes = await fetch(`http://127.0.0.1:8000/dashboard-stats/${businessId}?${statsParams}`);
      if (!statsRes.ok) throw new Error("Failed to fetch stats");
      const statsData = await statsRes.json();
      setStats(statsData);
      console.log("✅ Stats fetched:", statsData);

      // Fetch recent logs
      const logsRes = await fetch(`http://127.0.0.1:8000/recent-logs/${businessId}?${statsParams}`);
      if (!logsRes.ok) throw new Error("Failed to fetch logs");
      const logsData = await logsRes.json();
      setLogs(logsData);
      console.log("✅ Logs fetched:", logsData);

      // Fetch category breakdown
      const categoryRes = await fetch(`http://127.0.0.1:8000/category-breakdown/${businessId}?${statsParams}`);
      if (!categoryRes.ok) throw new Error("Failed to fetch category data");
      const categoryDataJson = await categoryRes.json();
      setCategoryData(categoryDataJson.data || []);
      console.log("✅ Category data fetched:", categoryDataJson.data);

      // Fetch monthly trends
      const monthlyRes = await fetch(`http://127.0.0.1:8000/monthly-trends/${businessId}?${statsParams}`);
      if (!monthlyRes.ok) throw new Error("Failed to fetch monthly data");
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
      label: "Electricity",
      value: formatCO2(stats.total_kwh),
      unit: "kg CO₂e",
      change: "+2.2%",
      positive: true,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Flame,
      label: "Natural Gas",
      value: formatCO2(stats.total_gas),
      unit: "kg CO₂e",
      change: "-2.2%",
      positive: false,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Fuel,
      label: "Fuel Usage",
      value: formatCO2(stats.total_co2 / 2),
      unit: "kg CO₂e",
      change: "-2.2%",
      positive: false,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Trash2,
      label: "Waste",
      value: formatCO2(stats.total_co2 / 3),
      unit: "kg CO₂e",
      change: "+2.2%",
      positive: true,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: TrendingUp,
      label: "Total Emissions",
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
              <p className="text-slate-500 text-sm font-semibold mb-2 tracking-widest">OVERVIEW</p>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">
                Welcome back,<br /><span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">{businessName}</span>
              </h1>
              <p className="text-slate-600 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data for: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}
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
                <Calendar className="w-4 h-4" /> Custom
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
                  💼 New
                </span>
              </div>
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">Financial Module</p>
              <p className="text-2xl font-black text-slate-900 mb-3">Carbon Costs</p>
              <p className="text-sm text-slate-600 mb-4">Track emissions costs in multiple currencies, set budgets, and monitor financial impact.</p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                <span>View Financial Dashboard</span>
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
                  📈 New
                </span>
              </div>
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">ROI Calculator</p>
              <p className="text-2xl font-black text-slate-900 mb-3">Savings Analysis</p>
              <p className="text-sm text-slate-600 mb-4">Compare month-over-month performance and see your environmental ROI and cost savings.</p>
              <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm group-hover:gap-3 transition-all">
                <span>View ROI Analysis</span>
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
                  🚚 New
                </span>
              </div>
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1">Supply Chain</p>
              <p className="text-lg font-black text-slate-900 mb-2">Scope 3</p>
              <p className="text-xs text-slate-600 mb-3 line-clamp-2">Track supplier emissions and manage sustainability ratings.</p>
              <div className="flex items-center gap-2 text-green-600 font-semibold text-xs group-hover:gap-3 transition-all">
                <span>Manage</span>
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
                    <p className="font-bold text-slate-900">⚡ Get Started with Billing & Tariffs</p>
                    <p className="text-xs text-slate-600">Set up your utility tariffs to track financial impact of emissions</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard/settings")}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all text-sm whitespace-nowrap"
              >
                Set Up Now
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
                  <h3 className="text-sm font-bold text-slate-900">Financial Trend</h3>
                  <p className="text-xs text-slate-500">Emissions Analysis</p>
                </div>
              </div>
              {chartsLoading ? (
                <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
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
                  <h3 className="text-sm font-bold text-slate-900">Emissions</h3>
                  <p className="text-xs text-slate-500">Status Distribution</p>
                </div>
              </div>
              {chartsLoading ? (
                <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
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
              <span className="hidden sm:inline text-sm">Electricity</span>
            </button>
            <button
              onClick={() => {
                setType("Natural Gas");
                setIsModalOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Gas</span>
            </button>
            <button
              onClick={() => {
                setType("Fuel");
                setIsModalOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Fuel className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Fuel</span>
            </button>
            <button
              onClick={() => {
                setType("Waste");
                setIsModalOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Waste</span>
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
            <h3 className="text-lg font-bold text-slate-900">Filters</h3>
            <button
              onClick={() => setIsFiltersOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Add</h3>
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
              <Zap className="w-4 h-4" /> Electricity
            </button>
            <button
              onClick={() => {
                setType("Natural Gas");
                setIsModalOpen(true);
                setIsFiltersOpen(false);
              }}
              className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-semibold transition-all text-sm flex items-center gap-2"
            >
              <Flame className="w-4 h-4" /> Gas
            </button>
            <button
              onClick={() => {
                setType("Fuel");
                setIsModalOpen(true);
                setIsFiltersOpen(false);
              }}
              className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-semibold transition-all text-sm flex items-center gap-2"
            >
              <Fuel className="w-4 h-4" /> Fuel
            </button>
            <button
              onClick={() => {
                setType("Waste");
                setIsModalOpen(true);
                setIsFiltersOpen(false);
              }}
              className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-semibold transition-all text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Waste
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Filters</h3>

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
                  <option>All Types</option>
                  <option>Electricity</option>
                  <option>Natural Gas</option>
                  <option>Fuel</option>
                  <option>Waste</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-2">Period</label>
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 bg-gray-50 text-gray-900 font-medium text-sm"
                >
                  <option value="today">Today</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="month">This Month</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* Team Filter */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-2">Team</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 bg-gray-50 text-gray-900 font-medium text-sm">
                  <option>{businessName}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-8">
            <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all text-sm">
              Apply
            </button>
            <button className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-all text-sm">
              Clear
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