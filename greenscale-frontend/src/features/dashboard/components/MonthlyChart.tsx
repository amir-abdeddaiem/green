import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCO2 } from './ChartUtils';

interface MonthlyChartProps {
  data: Array<{ month: string; impact: number; year: number }>;
  loading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="font-semibold text-slate-900">{data.month} {data.year}</p>
        <p className="text-green-600 font-bold">{formatCO2(data.impact)}</p>
      </div>
    );
  }
  return null;
};

export function MonthlyChart({ data, loading }: MonthlyChartProps) {
  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-slate-50 rounded-lg">
        <div className="text-center">
          <p className="text-slate-500 font-medium">No data available</p>
          <p className="text-slate-400 text-sm">Monthly trends will appear here after logging emissions</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="month" 
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#64748b"
          style={{ fontSize: '12px' }}
          label={{ value: 'CO2 (kg)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={() => 'CO2 Impact'}
        />
        <Bar
          dataKey="impact"
          fill="#10b981"
          name="CO2 Impact"
          radius={[8, 8, 0, 0]}
          animationBegin={0}
          animationDuration={800}
          isAnimationActive={true}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
