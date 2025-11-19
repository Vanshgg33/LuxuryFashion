import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  TrendingUp,
  IndianRupee,
  Users,
  ShoppingBag,
  Clock,
  RefreshCw,
  Download
} from 'lucide-react';
import { fetchAnalyticsApi, type AdminOrder } from '../../api/AdminApi';
import RevenueChart from './Charts/RevenueChart';
import StatusChart from './Charts/StatusChart';

interface AnalyticsContextType {
  showNotification: (type: 'success' | 'error' | 'warning', message: string) => void;
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  pendingOrders: number;
  averageOrderValue: number;
}

const Analytics: React.FC = () => {
  const { showNotification } = useOutletContext<AnalyticsContextType>();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number }>>([]);
  const [statusData, setStatusData] = useState<Array<{ status: string; count: number; color: string }>>([]);
  const [topProducts, setTopProducts] = useState<Array<{ name: string; sold: number }>>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { orders, users } = await fetchAnalyticsApi();
      
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum: number, order: AdminOrder) => sum + (order.totalPrice || 0), 0);
      const pendingOrders = orders.filter((order: AdminOrder) => order.status === 'PENDING').length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      setStats({
        totalOrders,
        totalRevenue,
        totalUsers: users.length,
        pendingOrders,
        averageOrderValue
      });

      // Process revenue data by month
      const monthlyRevenue = processMonthlyRevenue(orders);
      setRevenueData(monthlyRevenue);

      // Process status distribution
      const statusDistribution = processStatusDistribution(orders);
      setStatusData(statusDistribution);

      // Process top products
      const topProductsData = processTopProducts(orders);
      setTopProducts(topProductsData);
    } catch (error) {
      showNotification('error', 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyRevenue = (orders: AdminOrder[]) => {
    const monthlyData: { [key: string]: number } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    orders.forEach(order => {
      const date = new Date(order.orderDate);
      const monthKey = months[date.getMonth()];
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (order.totalPrice || 0);
    });

    return months.map(month => ({
      month,
      revenue: monthlyData[month] || 0
    })).filter(item => item.revenue > 0);
  };

  const processStatusDistribution = (orders: AdminOrder[]) => {
    const statusColors: { [key: string]: string } = {
      'DELIVERED': '#10b981',
      'SHIPPED': '#f59e0b',
      'CONFIRMED': '#3b82f6',
      'PENDING': '#eab308',
      'CANCELLED': '#ef4444'
    };

    const statusCounts: { [key: string]: number } = {};
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: statusColors[status] || '#6b7280'
    }));
  };

  const processTopProducts = (orders: AdminOrder[]) => {
    const productCounts: { [key: string]: number } = {};
    
    orders.forEach(order => {
      order.items?.forEach((item) => {
        const productName = item.product?.prod_name || 'Unknown Product';
        productCounts[productName] = (productCounts[productName] || 0) + item.quantity;
      });
    });

    return Object.entries(productCounts)
      .map(([name, sold]) => ({ name, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    showNotification('success', 'Analytics data refreshed');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: any) => (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
          <Icon className={`w-6 h-6 ${color === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-80 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">


      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Business insights and metrics</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          icon={ShoppingBag}
          title="Total Orders"
          value={formatNumber(stats.totalOrders)}
          subtitle="All time orders"
        />
        <StatCard
          icon={IndianRupee}
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="Gross revenue"
        />
        <StatCard
          icon={Users}
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          subtitle="Registered customers"
        />
        <StatCard
          icon={Clock}
          title="Pending Orders"
          value={formatNumber(stats.pendingOrders)}
          subtitle="Awaiting processing"
          color={stats.pendingOrders > 0 ? 'warning' : 'blue'}
        />
        <StatCard
          icon={TrendingUp}
          title="Avg Order Value"
          value={formatCurrency(stats.averageOrderValue)}
          subtitle="Per order average"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <RevenueChart data={revenueData} />

        {/* Order Status Distribution */}
        <StatusChart data={statusData} />

        {/* Top Products */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? topProducts.map((product) => {
              const maxSold = Math.max(...topProducts.map(p => p.sold));
              return (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium truncate flex-1 mr-4">{product.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(product.sold / maxSold) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 min-w-[2rem] text-right">{product.sold}</span>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-gray-500">
                No product data available
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">System Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Last Updated</span>
                <span className="text-sm text-gray-600">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              View Detailed Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;