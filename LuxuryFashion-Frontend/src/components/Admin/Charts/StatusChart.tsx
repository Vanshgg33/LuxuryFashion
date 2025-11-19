import React from 'react';

interface StatusChartProps {
  data?: Array<{ status: string; count: number; color: string }>;
}

const StatusChart: React.FC<StatusChartProps> = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Status Distribution</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No order data available
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Status Distribution</h3>
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-40 h-40 rounded-full border-8 border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{total}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="absolute left-48 top-0 space-y-2">
            {data.map((item) => (
              <div key={item.status} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-700">{item.status}</span>
                <span className="text-sm font-medium text-gray-900">
                  {item.count} ({Math.round((item.count / total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusChart;