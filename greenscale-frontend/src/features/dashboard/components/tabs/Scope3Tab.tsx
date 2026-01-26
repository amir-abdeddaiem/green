import { useState, useEffect } from 'react';
import { Truck, TrendingUp, Building2, AlertTriangle, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { Scope3LogForm } from './Scope3LogForm';
import { SupplierLeaderboard } from './SupplierLeaderboard';
import { AddSupplierModal } from '../modals/AddSupplierModal';

interface Scope3Stats {
  total_scope3_co2_kg: number;
  supplier_count: number;
  activity_count: number;
  avg_carbon_intensity: number;
}

interface Scope3Activity {
  id: number;
  calculated_co2: number;
  calculated_cost?: number;
  currency_code: string;
  source_reference?: string;
  date_of_activity: string;
  supplier?: { name: string };
}

export function Scope3Tab() {
  const businessId = localStorage.getItem("user_id");
  const [stats, setStats] = useState<Scope3Stats | null>(null);
  const [recentActivities, setRecentActivities] = useState<Scope3Activity[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch stats
      const statsRes = await fetch(
        `http://127.0.0.1:8000/api/scope3/stats?business_id=${businessId}`
      );
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch recent activities (from emission logs)
      // Note: This would need a dedicated endpoint to be fully implemented
      // For now, we'll show a placeholder
      setRecentActivities([]);

      // Generate monthly chart data (combining Scope 1, 2, and 3)
      generateMonthlyData();
    } catch (err) {
      console.error('Failed to fetch Scope 3 data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMonthlyData = () => {
    // Generate placeholder monthly data
    // In production, this would fetch actual data from the backend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map(month => ({
      month,
      'Scope 1 (Gas)': Math.random() * 500 + 100,
      'Scope 2 (Electricity)': Math.random() * 300 + 50,
      'Scope 3 (Supply Chain)': Math.random() * 2000 + 500,
    }));
    setMonthlyData(data);
  };

  const handleFormSuccess = () => {
    // Trigger refresh
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading && !stats) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-blue-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Scope 3: Supply Chain</h1>
              <p className="text-slate-600 text-sm">Track emissions from suppliers, logistics, and business travel</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddSupplierOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            New Supplier
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scope 3 CO2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              Emissions
            </span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Total Scope 3 CO₂
          </p>
          <p className="text-3xl font-black text-slate-900 mb-1">
            {stats?.total_scope3_co2_kg.toFixed(1) || 0}
          </p>
          <p className="text-xs text-slate-400">kg CO₂e</p>
        </div>

        {/* Supplier Count */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
              Tracking
            </span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Active Suppliers
          </p>
          <p className="text-3xl font-black text-slate-900 mb-1">
            {stats?.supplier_count || 0}
          </p>
          <p className="text-xs text-slate-400">registered</p>
        </div>

        {/* Activity Count */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              Logged
            </span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Activities
          </p>
          <p className="text-3xl font-black text-slate-900 mb-1">
            {stats?.activity_count || 0}
          </p>
          <p className="text-xs text-slate-400">entries</p>
        </div>

        {/* Average Carbon Intensity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
              Intensity
            </span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Avg Carbon Intensity
          </p>
          <p className="text-3xl font-black text-slate-900 mb-1">
            {stats?.avg_carbon_intensity.toFixed(3) || 0}
          </p>
          <p className="text-xs text-slate-400">kg CO₂e / unit</p>
        </div>
      </div>

      {/* Add Activity Form & Leaderboard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log New Activity */}
        <div className="lg:col-span-1">
          <Scope3LogForm onSuccess={handleFormSuccess} />
        </div>

        {/* Supplier Leaderboard (Preview) */}
        <div className="lg:col-span-2">
          <SupplierLeaderboard onRefresh={handleFormSuccess} />
        </div>
      </div>

      {/* Stacked Chart: Scope 1, 2, 3 Monthly Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Carbon Breakdown</h3>
            <p className="text-xs text-slate-500">Scope 1 (Gas) + Scope 2 (Electricity) + Scope 3 (Supply Chain)</p>
          </div>
        </div>

        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="Scope 1 (Gas)" stackId="a" fill="#ef4444" />
              <Bar dataKey="Scope 2 (Electricity)" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Scope 3 (Supply Chain)" stackId="a" fill="#3b82f6" />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            No data available yet
          </div>
        )}
      </div>

      {/* Recent Activities Feed */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
            <p className="text-xs text-slate-500">Latest supply chain emissions logged</p>
          </div>
        </div>

        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="font-semibold text-sm text-slate-900">
                    {activity.supplier?.name || 'Unnamed Activity'}
                  </p>
                  {activity.source_reference && (
                    <p className="text-xs text-slate-500">Ref: {activity.source_reference}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">
                    {activity.calculated_co2.toFixed(2)} kg CO₂e
                  </p>
                  {activity.calculated_cost && (
                    <p className="text-xs text-slate-500">
                      {activity.calculated_cost.toFixed(0)} {activity.currency_code}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No activities logged yet</p>
            <p className="text-gray-400 text-sm">Log your first activity above to get started</p>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
        <h3 className="font-bold text-slate-900 mb-3">💡 Scope 3 Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-sm text-slate-900">🏭 Purchased Goods</p>
            <p className="text-xs text-slate-600">Track materials like steel, plastic, paper from suppliers</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">🚚 Logistics & Freight</p>
            <p className="text-xs text-slate-600">Log shipments with distance and weight (ton-km calculations)</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">✈️ Business Travel</p>
            <p className="text-xs text-slate-600">Record flights, hotels, and rail with class multipliers</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">🚗 Employee Commute</p>
            <p className="text-xs text-slate-600">Track commuting by car, EV, bus, or train over work days</p>
          </div>
        </div>
      </div>

      {/* Add Supplier Modal */}
      <AddSupplierModal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        onSuccess={() => {
          setRefreshKey(prev => prev + 1);
        }}
      />
    </div>
  );
}
