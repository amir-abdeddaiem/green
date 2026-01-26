import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Award, Trash2 } from 'lucide-react';

interface Supplier {
  id: number;
  name: string;
  industry_type: string;
  total_co2: number;
  carbon_intensity: number;
  sustainability_rating: number;
  has_warning: boolean;
  created_at: string;
}

interface SupplierLeaderboardProps {
  businessId?: string;
  onRefresh?: () => void;
}

export function SupplierLeaderboard({ businessId: propBusinessId, onRefresh }: SupplierLeaderboardProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'co2' | 'rating' | 'intensity'>('co2');
  const [industryFilter, setIndustryFilter] = useState<string>('All');
  const [avgIntensity, setAvgIntensity] = useState<number>(0);

  const businessId = propBusinessId || localStorage.getItem("user_id");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `http://127.0.0.1:8000/api/scope3/leaderboard?business_id=${businessId}`
      );

      if (!response.ok) throw new Error('Failed to fetch leaderboard');

      const data = await response.json();
      setSuppliers(data || []);

      // Calculate average intensity
      if (data && data.length > 0) {
        const avg = data.reduce((sum: number, s: Supplier) => sum + s.carbon_intensity, 0) / data.length;
        setAvgIntensity(avg);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSupplier = async (supplierId: number) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/scope3/suppliers/${supplierId}?business_id=${businessId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete supplier');

      // Refresh list
      fetchLeaderboard();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to delete supplier');
    }
  };

  const getSortedSuppliers = () => {
    let filtered = [...suppliers];

    // Apply industry filter
    if (industryFilter !== 'All') {
      filtered = filtered.filter(s => s.industry_type === industryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'co2':
          return b.total_co2 - a.total_co2;
        case 'rating':
          return b.sustainability_rating - a.sustainability_rating;
        case 'intensity':
          return a.carbon_intensity - b.carbon_intensity; // Lower is better
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getRatingStars = (rating: number) => {
    const stars = '⭐'.repeat(Math.floor(rating));
    return <span className="text-lg">{stars}</span>;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-50 text-green-700';
    if (rating >= 3.5) return 'bg-blue-50 text-blue-700';
    if (rating >= 2.5) return 'bg-yellow-50 text-yellow-700';
    return 'bg-red-50 text-red-700';
  };

  const getIntensityTrend = (intensity: number, avg: number) => {
    if (intensity < avg * 0.8) return { icon: TrendingDown, color: 'text-green-600', label: '↓ Excellent' };
    if (intensity < avg * 1.2) return { icon: TrendingUp, color: 'text-blue-600', label: '= Average' };
    return { icon: TrendingUp, color: 'text-red-600', label: '↑ High' };
  };

  const sortedSuppliers = getSortedSuppliers();
  const industries = ['All', ...new Set(suppliers.map(s => s.industry_type))];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900 font-semibold">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No suppliers yet</p>
          <p className="text-gray-400 text-sm">Add suppliers to track their sustainability performance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Supplier Leaderboard</h3>
          <p className="text-xs text-slate-500">Ranked by carbon emissions & sustainability</p>
        </div>
        <Award className="w-6 h-6 text-amber-500" />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 font-medium text-sm"
          >
            <option value="co2">Total Emissions ⬇️</option>
            <option value="rating">Sustainability Rating ⬇️</option>
            <option value="intensity">Carbon Intensity ⬆️ (Lower is better)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 block mb-2">Industry</label>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 font-medium text-sm"
          >
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 block mb-2">Stats</label>
          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs">
            <p className="text-blue-900 font-semibold">{sortedSuppliers.length} suppliers</p>
            <p className="text-blue-700">Avg Intensity: {avgIntensity.toFixed(3)}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Industry</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">Total CO₂</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Intensity</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Rating</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedSuppliers.map((supplier, idx) => {
              const trend = getIntensityTrend(supplier.carbon_intensity, avgIntensity);
              const TrendIcon = trend.icon;
              const isAboveAvg = supplier.carbon_intensity > avgIntensity * 1.2;

              return (
                <tr
                  key={supplier.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                    supplier.sustainability_rating >= 4 ? 'bg-green-50/30' : ''
                  }`}
                >
                  {/* Rank */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                      {idx + 1}
                    </div>
                  </td>

                  {/* Supplier Name */}
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{supplier.name}</p>
                    <p className="text-xs text-slate-500">ID: {supplier.id}</p>
                  </td>

                  {/* Industry */}
                  <td className="px-4 py-4">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {supplier.industry_type}
                    </span>
                  </td>

                  {/* Total CO2 */}
                  <td className="px-4 py-4 text-right">
                    <p className="font-bold text-slate-900">{supplier.total_co2.toFixed(1)}</p>
                    <p className="text-xs text-slate-500">kg CO₂e</p>
                  </td>

                  {/* Carbon Intensity */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <TrendIcon className={`w-4 h-4 ${trend.color}`} />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {supplier.carbon_intensity.toFixed(4)}
                        </p>
                        <p className="text-xs text-slate-500 whitespace-nowrap">{trend.label}</p>
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-4 text-center">
                    <div className={`px-3 py-2 rounded-lg ${getRatingColor(supplier.sustainability_rating)}`}>
                      <div className="flex items-center justify-center gap-1">
                        {getRatingStars(supplier.sustainability_rating)}
                        <span className="font-bold ml-1">{supplier.sustainability_rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 text-center">
                    {isAboveAvg ? (
                      <div className="flex items-center justify-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full w-fit mx-auto">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs font-semibold">⚠️ Warning</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center px-2 py-1 bg-green-50 text-green-700 rounded-full">
                        <span className="text-xs font-semibold">✅ Good</span>
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      title="Delete supplier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs font-bold text-slate-600 mb-3">Legend</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 text-xs">
            <TrendingDown className="w-4 h-4 text-green-600" />
            <span>Excellent</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Average</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>High Emissions</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Top Performer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
