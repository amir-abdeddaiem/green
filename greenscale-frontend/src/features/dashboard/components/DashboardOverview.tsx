import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Zap, Flame, BarChart3, History, Layers, AlertCircle, CheckCircle2, Download, Loader } from "lucide-react";
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
  const businessName = localStorage.getItem("business_name") || "Business";
  const businessId = localStorage.getItem("user_id");
  const [isLoading, setIsLoading] = useState(true);

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
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchData = async () => {
    if (!businessId || businessId === "undefined") {
      console.log("❌ No business ID found:", businessId);
      return;
    }
    
    console.log("📊 Fetching data for business ID:", businessId);
    setIsLoading(true);
    setChartsLoading(true);
    
    try {
      // Fetch dashboard stats
      const statsRes = await fetch(`http://127.0.0.1:8001/dashboard-stats/${businessId}`);
      if (!statsRes.ok) throw new Error("Failed to fetch stats");
      const statsData = await statsRes.json();
      setStats(statsData);
      console.log("✅ Stats fetched:", statsData);

      // Fetch recent logs
      const logsRes = await fetch(`http://127.0.0.1:8001/recent-logs/${businessId}`);
      if (!logsRes.ok) throw new Error("Failed to fetch logs");
      const logsData = await logsRes.json();
      setLogs(logsData);
      console.log("✅ Logs fetched:", logsData);

      // Fetch category breakdown
      const categoryRes = await fetch(`http://127.0.0.1:8001/category-breakdown/${businessId}`);
      if (!categoryRes.ok) throw new Error("Failed to fetch category data");
      const categoryDataJson = await categoryRes.json();
      setCategoryData(categoryDataJson);
      console.log("✅ Category data fetched:", categoryDataJson);

      // Fetch monthly trends
      const monthlyRes = await fetch(`http://127.0.0.1:8001/monthly-trends/${businessId}`);
      if (!monthlyRes.ok) throw new Error("Failed to fetch monthly data");
      const monthlyDataJson = await monthlyRes.json();
      setMonthlyData(monthlyDataJson);
      console.log("✅ Monthly data fetched:", monthlyDataJson);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setIsLoading(false);
      setChartsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [businessId]);

  const handleExportData = async () => {
    if (!businessId || businessId === "undefined") {
      alert("Please log in first");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8001/export-data/${businessId}`);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carbon_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Error exporting data:", error);
      alert("Failed to export data");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
      {/* ===== HEADER SECTION ===== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Carbon Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, <span className="font-bold text-gray-900">{businessName}</span>
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all active:scale-95 whitespace-nowrap shadow-lg"
        >
          + Add Emission
        </button>
      </div>

      {/* ===== KEY METRICS GRID (4 CARDS) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total CO2 Impact */}
        <Card className="bg-white border-gray-200 p-6 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white">
              <Flame className="w-6 h-6" />
            </div>
            <span className="text-xs bg-gray-100 text-gray-900 px-2.5 py-1 rounded-full font-bold">
              TOTAL
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total CO₂ Impact</h3>
          <div className="text-3xl font-black text-gray-900">
            {formatCO2(stats.total_co2)}
            <span className="text-lg text-gray-500 font-bold ml-1">kg</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Carbon footprint tracked</p>
        </Card>

        {/* Electricity Usage */}
        <Card className="bg-white border-gray-200 p-6 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xs bg-gray-100 text-gray-900 px-2.5 py-1 rounded-full font-bold">
              ENERGY
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Electricity Usage</h3>
          <div className="text-3xl font-black text-gray-900">
            {formatCO2(stats.total_kwh)}
            <span className="text-lg text-gray-500 font-bold ml-1">kWh</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Current period total</p>
        </Card>

        {/* Natural Gas Usage */}
        <Card className="bg-white border-gray-200 p-6 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs bg-gray-100 text-gray-900 px-2.5 py-1 rounded-full font-bold">
              GAS
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Natural Gas Usage</h3>
          <div className="text-3xl font-black text-gray-900">
            {formatCO2(stats.total_gas)}
            <span className="text-lg text-gray-500 font-bold ml-1">m³</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Volume consumed</p>
        </Card>

        {/* Emission Count */}
        <Card className="bg-white border-gray-200 p-6 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-xs bg-gray-100 text-gray-900 px-2.5 py-1 rounded-full font-bold">
              COUNT
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Emissions Logged</h3>
          <div className="text-3xl font-black text-gray-900">
            {stats.log_count}
            <span className="text-lg text-gray-500 font-bold ml-1">entries</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Total records tracked</p>
        </Card>
      </div>

      {/* ===== ANALYTICS SECTION (2 CHARTS) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emissions by Category */}
        <Card className="bg-white border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-gray-900">Emissions by Category</h2>
              <p className="text-sm text-gray-500 mt-1">Breakdown of carbon impact by type</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-gray-900" />
            </div>
          </div>
          {chartsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : categoryData.length > 0 ? (
            <CategoryChart data={transformCategoryData(categoryData)} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p className="text-center">No category data available</p>
            </div>
          )}
        </Card>

        {/* Monthly Trends */}
        <Card className="bg-white border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-gray-900">Monthly Trends</h2>
              <p className="text-sm text-gray-500 mt-1">Carbon impact over time</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-gray-900" />
            </div>
          </div>
          {chartsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : monthlyData.length > 0 ? (
            <MonthlyChart data={transformMonthlyData(monthlyData)} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p className="text-center">No monthly data available</p>
            </div>
          )}
        </Card>
      </div>

      {/* ===== RECENT EMISSIONS SECTION ===== */}
      <Card className="bg-white border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-gray-900">Recent Emissions</h2>
            <p className="text-sm text-gray-500 mt-1">Latest 5 emissions logged to your account</p>
          </div>
          <button
            onClick={handleExportData}
            disabled={isDownloading}
            className="px-4 py-2 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50 border border-gray-300"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? "Downloading..." : "Export CSV"}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.map((log: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      log.type === "Electricity"
                        ? "bg-gray-700"
                        : log.type === "Natural Gas"
                        ? "bg-gray-900"
                        : "bg-black"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{log.type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.recorded_at).toLocaleDateString()} at{" "}
                      {new Date(log.recorded_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">
                    {formatCO2(log.co2_impact)} kg CO₂
                  </p>
                  <p className="text-xs text-gray-500">
                    {log.value} {log.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <AlertCircle className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold mb-1">No emissions logged yet</p>
            <p className="text-gray-400 text-sm">Start tracking your carbon footprint by clicking "Add Emission"</p>
          </div>
        )}
      </Card>

      {/* ===== MODALS ===== */}
      <AddEmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        type={type}
      />
    </div>
  );
}