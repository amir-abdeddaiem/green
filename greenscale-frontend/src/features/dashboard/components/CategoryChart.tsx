import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCO2 } from './ChartUtils';

interface CategoryChartProps {
  data: Array<{ name: string; value: number; type: string }>;
  loading?: boolean;
}

const COLORS = {
  'Electricity': '#10b981',    // Emerald
  'Natural Gas': '#f97316',    // Orange
  'Fuel': '#8b5cf6',           // Violet
  'Waste': '#06b6d4'           // Cyan
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="font-semibold text-slate-900">{data.name}</p>
        <p className="text-emerald-600 font-bold">{formatCO2(data.value)}</p>
        <p className="text-xs text-slate-500">
          {((data.value / payload[0].payload.total) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export function CategoryChart({ data, loading }: CategoryChartProps) {
  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-slate-50 rounded-lg">
        <div className="text-center">
          <p className="text-slate-500 font-medium">No data available</p>
          <p className="text-slate-400 text-sm">Start logging emissions to see the breakdown</p>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={dataWithTotal}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.type as keyof typeof COLORS] || '#64748b'}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(_value, entry: any) => `${entry.payload.name}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
