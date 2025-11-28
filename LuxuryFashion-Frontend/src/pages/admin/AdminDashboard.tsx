import { Users, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { demoUsers, topSellingItems, revenueData, orderStatusData } from "@/data/adminData";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminDashboard = () => {
  const totalUsers = demoUsers.length;
  const totalOrders = 305;
  const totalRevenue = 336000;

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(142, 25%, 35%)",
    },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${Math.round(totalRevenue / totalOrders)}`}
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Revenue</h3>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="hsl(142, 25%, 35%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Order Status</h3>
          <div className="flex items-center justify-center h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top Selling Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Item</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Orders</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topSellingItems.map((item, index) => (
                <tr key={item.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 text-foreground">{item.orders}</td>
                  <td className="text-right py-4 px-4 font-semibold text-primary">₹{item.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
