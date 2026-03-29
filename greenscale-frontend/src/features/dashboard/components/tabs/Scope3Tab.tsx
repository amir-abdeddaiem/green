import { useState, useEffect } from 'react';
import { Truck, TrendingUp, Building2, AlertTriangle, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { Scope3LogForm } from './Scope3LogForm';
import { SupplierLeaderboard } from './SupplierLeaderboard';
import { AddSupplierModal } from '../modals/AddSupplierModal';
import { apiUrl } from "@/config/api";

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
        apiUrl(`/api/scope3/stats?business_id=${businessId}`)
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
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin'];
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
              <h1 className="text-3xl font-black text-slate-900">Périmètre 3 : chaîne d’approvisionnement</h1>
              <p className="text-slate-600 text-sm">Suivez les émissions des fournisseurs, de la logistique et des déplacements professionnels</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddSupplierOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Nouveau fournisseur
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
              Émissions
            </span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Total périmètre 3 CO₂
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
              Suivi
            </span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Fournisseurs actifs
          </p>
          <p className="text-3xl font-black text-slate-900 mb-1">
            {stats?.supplier_count || 0}
          </p>
          <p className="text-xs text-slate-400">enregistrés</p>
        </div>

        {/* Activity Count */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              Enregistrées
            </span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Activités
          </p>
          <p className="text-3xl font-black text-slate-900 mb-1">
            {stats?.activity_count || 0}
          </p>
          <p className="text-xs text-slate-400">entrées</p>
        </div>

        {/* Average Carbon Intensity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
              Intensité
            </span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Intensité carbone moyenne
          </p>
          <p className="text-3xl font-black text-slate-900 mb-1">
            {stats?.avg_carbon_intensity.toFixed(3) || 0}
          </p>
          <p className="text-xs text-slate-400">kg CO₂e / unité</p>
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
            <h3 className="text-sm font-bold text-slate-900">Répartition carbone mensuelle</h3>
            <p className="text-xs text-slate-500">Périmètre 1 (gaz) + périmètre 2 (électricité) + périmètre 3 (chaîne d’approvisionnement)</p>
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
              <Bar dataKey="Scope 1 (Gas)" name="Périmètre 1 (gaz)" stackId="a" fill="#ef4444" />
              <Bar dataKey="Scope 2 (Electricity)" name="Périmètre 2 (électricité)" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Scope 3 (Supply Chain)" name="Périmètre 3 (chaîne d’approvisionnement)" stackId="a" fill="#3b82f6" />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Aucune donnée pour le moment
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
            <h3 className="text-sm font-bold text-slate-900">Activités récentes</h3>
            <p className="text-xs text-slate-500">Dernières émissions de la chaîne d’approvisionnement enregistrées</p>
          </div>
        </div>

        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="font-semibold text-sm text-slate-900">
                    {activity.supplier?.name || 'Activité sans nom'}
                  </p>
                  {activity.source_reference && (
                    <p className="text-xs text-slate-500">Réf. : {activity.source_reference}</p>
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
            <p className="text-gray-500 font-medium">Aucune activité enregistrée</p>
            <p className="text-gray-400 text-sm">Enregistrez votre première activité ci-dessus pour commencer</p>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
        <h3 className="font-bold text-slate-900 mb-3">💡 Catégories du périmètre 3</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-sm text-slate-900">🏭 Biens achetés</p>
            <p className="text-xs text-slate-600">Suivez des matériaux comme l’acier, le plastique ou le papier auprès des fournisseurs</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">🚚 Logistique & fret</p>
            <p className="text-xs text-slate-600">Enregistrez des expéditions avec distance et poids (calculs en tonne-km)</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">✈️ Déplacements professionnels</p>
            <p className="text-xs text-slate-600">Enregistrez vols, hôtels et train avec des multiplicateurs selon la classe</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">🚗 Trajets domicile-travail</p>
            <p className="text-xs text-slate-600">Suivez les trajets en voiture, VE, bus ou train sur les jours travaillés</p>
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
