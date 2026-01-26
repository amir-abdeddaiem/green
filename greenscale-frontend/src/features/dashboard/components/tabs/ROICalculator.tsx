import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Target } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

interface ROIData {
  current_month: {
    emissions: number;
    cost: number;
  };
  previous_month: {
    emissions: number;
    cost: number;
  };
  savings: {
    emissions_reduction_kg: number;
    emissions_reduction_percent: number;
    cost_saved: number;
    cost_saved_percent: number;
  };
}

export const ROICalculator: React.FC = () => {
  const { displayCurrency, getCurrencySymbol } = useCurrency();
  const [roiData, setROIData] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const businessId = localStorage.getItem('user_id');
  const currencySymbol = getCurrencySymbol(displayCurrency);

  // Fetch ROI data comparing current and previous months
  useEffect(() => {
    const fetchROIData = async () => {
      if (!businessId) return;

      setLoading(true);
      setError(null);

      try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = selectedYear;

        // Calculate previous month/year
        let previousMonth = currentMonth - 1;
        let previousYear = currentYear;
        if (previousMonth === 0) {
          previousMonth = 12;
          previousYear = currentYear - 1;
        }

        // Fetch both months' data
        const [currentRes, previousRes] = await Promise.all([
          fetch(
            `http://localhost:8000/api/financial-stats?business_id=${businessId}&month=${currentMonth}&year=${currentYear}&currency=${displayCurrency}`
          ),
          fetch(
            `http://localhost:8000/api/financial-stats?business_id=${businessId}&month=${previousMonth}&year=${previousYear}&currency=${displayCurrency}`
          ),
        ]);

        if (!currentRes.ok || !previousRes.ok) {
          throw new Error('Failed to fetch ROI data');
        }

        const currentData = await currentRes.json();
        const previousData = await previousRes.json();

        // Calculate savings
        const emissionsReduction =
          previousData.total_emissions_kg - currentData.total_emissions_kg;
        const emissionsReductionPercent =
          previousData.total_emissions_kg > 0
            ? (emissionsReduction / previousData.total_emissions_kg) * 100
            : 0;

        const costSaved = previousData.total_cost - currentData.total_cost;
        const costSavedPercent =
          previousData.total_cost > 0 ? (costSaved / previousData.total_cost) * 100 : 0;

        setROIData({
          current_month: {
            emissions: currentData.total_emissions_kg,
            cost: currentData.total_cost,
          },
          previous_month: {
            emissions: previousData.total_emissions_kg,
            cost: previousData.total_cost,
          },
          savings: {
            emissions_reduction_kg: emissionsReduction,
            emissions_reduction_percent: emissionsReductionPercent,
            cost_saved: costSaved,
            cost_saved_percent: costSavedPercent,
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('❌ Error fetching ROI data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchROIData();
  }, [selectedYear, displayCurrency, businessId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-900">⚠️ {error}</p>
      </div>
    );
  }

  if (!roiData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-900">No ROI data available yet. Check back next month!</p>
      </div>
    );
  }

  const { savings } = roiData;
  const hasPositiveSavings = savings.emissions_reduction_kg > 0 || savings.cost_saved > 0;

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow">
        <label className="font-medium text-gray-700">Select Year:</label>
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

      {/* Main ROI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emissions Savings Card */}
        <div
          className={`rounded-lg shadow p-6 border-l-4 ${
            hasPositiveSavings ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">💨 Emissions Reduced</p>
              <p
                className={`text-4xl font-bold mt-2 ${
                  hasPositiveSavings ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {savings.emissions_reduction_kg.toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm mt-1">kg CO₂e</p>
            </div>
            <Target
              className={`w-10 h-10 ${
                hasPositiveSavings ? 'text-blue-400' : 'text-gray-400'
              }`}
            />
          </div>

          <div className="bg-white rounded p-3">
            <p className="text-sm text-gray-700">
              <span
                className={`font-bold ${
                  savings.emissions_reduction_percent > 0
                    ? 'text-blue-600'
                    : 'text-red-600'
                }`}
              >
                {savings.emissions_reduction_percent > 0 ? '+' : ''}
                {savings.emissions_reduction_percent.toFixed(1)}%
              </span>{' '}
              compared to last month
            </p>
          </div>
        </div>

        {/* Cost Savings Card */}
        <div
          className={`rounded-lg shadow p-6 border-l-4 ${
            hasPositiveSavings ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">💰 Money Saved</p>
              <p
                className={`text-4xl font-bold mt-2 ${
                  hasPositiveSavings ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                {currencySymbol} {savings.cost_saved.toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm mt-1">{displayCurrency}</p>
            </div>
            <TrendingUp
              className={`w-10 h-10 ${
                hasPositiveSavings ? 'text-green-400' : 'text-gray-400'
              }`}
            />
          </div>

          <div className="bg-white rounded p-3">
            <p className="text-sm text-gray-700">
              <span
                className={`font-bold ${
                  savings.cost_saved_percent > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {savings.cost_saved_percent > 0 ? '+' : ''}
                {savings.cost_saved_percent.toFixed(1)}%
              </span>{' '}
              compared to last month
            </p>
          </div>
        </div>
      </div>

      {/* Month Comparison Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            Month-over-Month Comparison
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Previous Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Current Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Total Emissions</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {roiData.previous_month.emissions.toFixed(2)} kg CO₂e
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {roiData.current_month.emissions.toFixed(2)} kg CO₂e
                </td>
                <td
                  className={`px-6 py-4 text-sm font-bold ${
                    savings.emissions_reduction_kg > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {savings.emissions_reduction_kg > 0 ? '↓' : '↑'}{' '}
                  {Math.abs(savings.emissions_reduction_kg).toFixed(2)} kg
                </td>
              </tr>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Total Spending</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {currencySymbol} {roiData.previous_month.cost.toFixed(2)} {displayCurrency}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {currencySymbol} {roiData.current_month.cost.toFixed(2)} {displayCurrency}
                </td>
                <td
                  className={`px-6 py-4 text-sm font-bold ${
                    savings.cost_saved > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {savings.cost_saved > 0 ? '↓' : '↑'} {currencySymbol}{' '}
                  {Math.abs(savings.cost_saved).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insight */}
      <div
        className={`rounded-lg p-6 border-l-4 ${
          hasPositiveSavings
            ? 'bg-green-50 border-green-500'
            : 'bg-yellow-50 border-yellow-500'
        }`}
      >
        <p className={`font-semibold ${hasPositiveSavings ? 'text-green-900' : 'text-yellow-900'}`}>
          📊 Key Insight
        </p>
        <p className={`mt-2 ${hasPositiveSavings ? 'text-green-800' : 'text-yellow-800'}`}>
          {hasPositiveSavings ? (
            <>
              By reducing your carbon emissions by <strong>{savings.emissions_reduction_percent.toFixed(1)}%</strong> this month,
              you've saved <strong>{currencySymbol} {savings.cost_saved.toFixed(2)} {displayCurrency}</strong>.
              <br />
              <span className="text-sm mt-2 block">
                Keep up this trend! You're making both environmental and financial progress! 🌱
              </span>
            </>
          ) : (
            <>
              Your emissions and spending increased this month compared to last month.
              <br />
              <span className="text-sm mt-2 block">
                Review your tariff settings and consider ways to optimize your energy consumption. 💡
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default ROICalculator;
