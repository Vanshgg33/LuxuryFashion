import React from 'react';

interface RevenueChartProps {
  data?: Array<{ month: string; revenue: number }>;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Monthly Revenue Trend</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No revenue data available
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Monthly Revenue Trend</h3>
      <div className="h-64 relative">
        <div className="absolute inset-0 flex items-end justify-between px-4 pb-8">
          {data.map((item, index) => (
            <div key={item.month} className="flex flex-col items-center flex-1 mx-1">
              <div 
                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-1000 hover:opacity-80 cursor-pointer"
                style={{ 
                  height: `${(item.revenue / maxRevenue) * 200}px`,
                  animationDelay: `${index * 100}ms`
                }}
                title={`${item.month}: ₹${item.revenue.toLocaleString()}`}
              ></div>
              <span className="text-sm text-gray-600 mt-2 font-medium">{item.month}</span>
            </div>
          ))}
        </div>
        
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-2 text-xs text-gray-500">
          <span>₹{(maxRevenue / 1000).toFixed(0)}k</span>
          <span>₹{(maxRevenue / 2000).toFixed(0)}k</span>
          <span>₹0</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;