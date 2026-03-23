import { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingDown, AlertCircle, Zap } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { apiUrl } from "@/config/api";

interface FinancialStatsData {
  month: number;
  year: number;
  total_emissions_kg: number;
  total_cost: number;
  currency: string;
  budget_status: {
    alert_level: string;
    percentage_used: number;
    remaining: number;
    limit: number;
  };
  emissions_by_type: Record<string, { kg: number; cost: number }>;
}

interface ChartDataPoint {
  name: string;
  emissions: number;
  cost: number;
}

export const FinancialTab: React.FC = () => {
  const { displayCurrency, getCurrencySymbol } = useCurrency();
  const [financialStats, setFinancialStats] = useState<FinancialStatsData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const businessId = localStorage.getItem('user_id');
  const currencySymbol = getCurrencySymbol(displayCurrency);

  // Fetch financial stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!businessId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          apiUrl(
            `/api/financial-stats?business_id=${businessId}&month=${selectedMonth}&year=${selectedYear}&currency=${displayCurrency}`
          )
        );

        if (!response.ok) {
          throw new Error('Failed to fetch financial stats');
        }

        const data: FinancialStatsData = await response.json();
        setFinancialStats(data);

        // Prepare chart data from emissions_by_type
        const chartPoints: ChartDataPoint[] = Object.entries(
          data.emissions_by_type
        ).map(([type, values]) => ({
          name: type,
          emissions: values.kg,
          cost: values.cost,
        }));

        setChartData(chartPoints);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('❌ Error fetching financial stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedMonth, selectedYear, displayCurrency, businessId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <div>
          <p className="font-semibold text-red-900">Error loading financial data</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!financialStats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-900">
          No financial data available. Please set up tariff rates in Settings.
        </p>
      </div>
    );
  }

  const { total_emissions_kg, total_cost, budget_status } = financialStats;
  const alertColor =
    budget_status.alert_level === 'EXCEEDED'
      ? 'red'
      : budget_status.alert_level === 'WARNING'
      ? 'orange'
      : budget_status.alert_level === 'CAUTION'
      ? 'yellow'
      : 'green';

  return (
    <div className="space-y-6">
      {/* Month/Year Selection */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow">
        <label className="font-medium text-gray-700">Select Month:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
            <option key={month} value={month}>
              {new Date(2025, month - 1).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>

        <label className="font-medium text-gray-700 ml-4">Year:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {[2023, 2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Emissions */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Emissions</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{total_emissions_kg.toFixed(2)}</p>
              <p className="text-gray-500 text-sm mt-1">kg CO₂e</p>
            </div>
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Spending</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {currencySymbol} {total_cost.toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm mt-1">{displayCurrency}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-green-400" />
          </div>
        </div>

        {/* Budget Status */}
        <div
          className={`bg-white rounded-lg shadow p-6 border-l-4 border-${alertColor}-500`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Budget Status</p>
              <p className={`text-3xl font-bold text-${alertColor}-600 mt-2`}>
                {budget_status.percentage_used?.toFixed(1) || 'N/A'}%
              </p>
              <p className={`text-gray-500 text-sm mt-1`}>
                {budget_status.alert_level || 'No budget set'}
              </p>
            </div>
            <AlertCircle className={`w-8 h-8 text-${alertColor}-400`} />
          </div>
        </div>
      </div>

      {/* Budget Details */}
      {budget_status.limit && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Monthly Budget</span>
                <span className="font-semibold">
                  {currencySymbol} {budget_status.limit?.toFixed(2)} {displayCurrency}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full bg-${alertColor}-500`}
                  style={{ width: `${Math.min(budget_status.percentage_used, 100)}%` }}
                ></div>
              </div>
            </div>

            {budget_status.remaining !== undefined && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-gray-600 text-sm">Spent</p>
                  <p className="text-xl font-bold text-gray-900">
                    {currencySymbol} {total_cost.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Remaining</p>
                  <p className="text-xl font-bold text-green-600">
                    {currencySymbol} {budget_status.remaining.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dual-Axis Chart: Emissions vs Cost */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Emissions vs Spending by Type
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                yAxisId="left"
                label={{ value: 'CO₂ Emissions (kg)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: `Spending (${displayCurrency})`, angle: 90, position: 'insideRight' }}
              />
              <Tooltip
                formatter={(value: any) => typeof value === 'number' ? value.toFixed(2) : value}
                contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="emissions" fill="#3b82f6" name="CO₂ (kg)" />
              <Bar yAxisId="right" dataKey="cost" fill="#10b981" name={`Cost (${displayCurrency})`} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Emissions Breakdown Table */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Emissions Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Emissions (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Cost ({displayCurrency})
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {row.emissions.toFixed(2)} kg
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {currencySymbol} {row.cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {(
                        (row.emissions /
                          chartData.reduce((sum, d) => sum + d.emissions, 0)) *
                        100
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialTab;
