import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { CategoryChart } from "../CategoryChart";
import { MonthlyChart } from "../MonthlyChart";
import { transformCategoryData, transformMonthlyData } from "../ChartUtils";
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

export function AnalyticsTab() {
  const businessId = localStorage.getItem("user_id");
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 10000);
    return () => clearInterval(interval);
  }, [businessId]);

  const fetchAnalyticsData = async () => {
    if (!businessId || businessId === "undefined") {
      console.log("❌ No business ID for analytics");
      return;
    }

    setChartsLoading(true);
    try {
      // Fetch category breakdown
      const cRes = await fetch(apiUrl(`/category-breakdown/${businessId}`));
      if (cRes.ok) {
        const cData = await cRes.json();
        console.log("✅ Category analytics loaded:", cData);
        setCategoryData(cData.data || []);
      }

      // Fetch monthly trends
      const mRes = await fetch(apiUrl(`/monthly-trends/${businessId}`));
      if (mRes.ok) {
        const mData = await mRes.json();
        console.log("✅ Monthly analytics loaded:", mData);
        setMonthlyData(mData.data || []);
      }
    } catch (err) {
      console.error("❌ Analytics fetch error:", err);
    } finally {
      setChartsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8 lg:p-12 space-y-8 md:space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-green-900">Analytique & insights</h1>
        <p className="text-green-700 text-sm md:text-base">Analysez en profondeur vos données d’émissions avec des visualisations avancées</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Category Breakdown - Pie Chart */}
        <Card className="lg:col-span-1 p-6 rounded-lg shadow-lg bg-white border border-green-200 hover:border-green-300 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
              <BarChart3 className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-green-900">Répartition des émissions</h3>
              <p className="text-xs text-green-600">Par type de source</p>
            </div>
          </div>
          <CategoryChart data={transformCategoryData(categoryData)} loading={chartsLoading} />
        </Card>

        {/* Monthly Trends - Bar Chart */}
        <Card className="lg:col-span-2 p-6 rounded-lg shadow-lg bg-white border border-green-200 hover:border-green-300 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-green-900">Tendances sur 6 mois</h3>
              <p className="text-xs text-green-600">Impact CO₂ dans le temps</p>
            </div>
          </div>
          <MonthlyChart data={transformMonthlyData(monthlyData)} loading={chartsLoading} />
        </Card>
      </div>

      {/* Insights Section */}
      <Card className="p-6 rounded-lg shadow-lg bg-green-50 border border-green-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-green-900 mb-2">Points clés</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Votre principale source d’émissions est <span className="font-semibold">Électricité</span> ({categoryData.find(c => c.type === 'Electricity')?.impact || 0} kg CO2e)</li>
              <li>• Mois après mois, vos émissions sont restées <span className="font-semibold">relativement stables</span></li>
              <li>• Pensez à enregistrer la consommation de carburant pour obtenir une vision complète</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}