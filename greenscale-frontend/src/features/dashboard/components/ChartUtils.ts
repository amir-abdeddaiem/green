/**
 * Data transformation utilities for chart components
 * Formats backend data into recharts-compatible structure
 */

export interface CategoryData {
  type: string;
  impact: number;
}

export interface MonthlyData {
  month: string;
  impact: number;
  year: number;
}

/**
 * Transform category breakdown data for Pie Chart
 * Converts backend format to recharts format with 'name' and 'value' keys
 */
export const transformCategoryData = (data: CategoryData[]) => {
  return data.map(item => ({
    name: item.type,
    value: item.impact,
    type: item.type
  }));
};

/**
 * Transform monthly trends data for Bar Chart
 * Ensures chronological order and consistent formatting
 */
export const transformMonthlyData = (data: MonthlyData[]) => {
  // Sort by year and month
  const monthMap = { 'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12 };
  
  return data
    .sort((a, b) => {
      const aMonth = monthMap[a.month as keyof typeof monthMap] || 0;
      const bMonth = monthMap[b.month as keyof typeof monthMap] || 0;
      return a.year - b.year || aMonth - bMonth;
    })
    .map(item => ({
      month: item.month,
      impact: item.impact,
      year: item.year
    }));
};

/**
 * Calculate total CO2 from category data
 */
export const getTotalCO2 = (data: CategoryData[]): number => {
  return data.reduce((sum, item) => sum + item.impact, 0);
};

/**
 * Get category with highest impact
 */
export const getTopCategory = (data: CategoryData[]): CategoryData | null => {
  return data.length > 0 ? data.reduce((max, item) => item.impact > max.impact ? item : max) : null;
};

/**
 * Format CO2 value for display (with unit)
 */
export const formatCO2 = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} t CO2e`;
  }
  return `${value.toFixed(2)} kg CO2e`;
};
