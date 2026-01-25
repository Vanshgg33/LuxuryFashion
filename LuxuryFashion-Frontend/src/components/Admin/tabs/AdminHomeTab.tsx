import { useState, useEffect } from "react";
import { Power, DollarSign, ShoppingBag, Clock, TrendingUp, Bell, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAdminOrders, fetchAnalyticsSummary, toggleRestaurantOpen } from "@/lib/api";
import { toast } from "sonner";

interface AdminHomeTabProps {
  settings: any;
  setSettings: (settings: any) => void;
  onNavigate: (tab: "home" | "orders" | "menu" | "settings") => void;
}

export const AdminHomeTab = ({ settings, setSettings, onNavigate }: AdminHomeTabProps) => {
  const [summary, setSummary] = useState<any>({});
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryData, ordersData] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchAdminOrders(),
        ]);
        setSummary(summaryData || {});
        // Get recent orders (last 5)
        const orders = Array.isArray(ordersData) ? ordersData.slice(0, 5) : [];
        setRecentOrders(orders);
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggleRestaurant = async () => {
    setIsToggling(true);
    try {
      const newValue = !settings.isOpen;
      await toggleRestaurantOpen(newValue, "");
      setSettings({ ...settings, isOpen: newValue });
      toast.success(newValue ? "Restaurant is now OPEN!" : "Restaurant is now CLOSED");
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle restaurant");
    } finally {
      setIsToggling(false);
    }
  };

  const pendingOrders = recentOrders.filter(o => o.status === "placed" || o.status === "preparing").length;
  const todayRevenue = summary.todayRevenue || summary.totalRevenue || 0;
  const todayOrders = summary.todayOrders || summary.totalOrders || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed": return "bg-blue-100 text-blue-700";
      case "preparing": return "bg-amber-100 text-amber-700";
      case "ready_for_pickup": return "bg-purple-100 text-purple-700";
      case "out_for_delivery": return "bg-indigo-100 text-indigo-700";
      case "delivered": return "bg-emerald-100 text-emerald-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "placed": return "New";
      case "preparing": return "Prep";
      case "ready_for_pickup": return "Ready";
      case "out_for_delivery": return "Out";
      case "delivered": return "Done";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Big Status Card */}
      <div
        className={cn(
          "p-5 rounded-2xl border-2 transition-all shadow-sm",
          settings.isOpen
            ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-300"
            : "bg-gradient-to-br from-red-50 to-red-100/50 border-red-300"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              settings.isOpen ? "bg-emerald-500" : "bg-red-500"
            )}>
              <Power className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={cn(
                "text-xl font-bold",
                settings.isOpen ? "text-emerald-800" : "text-red-800"
              )}>
                {settings.isOpen ? "OPEN" : "CLOSED"}
              </h2>
              <p className={cn(
                "text-sm",
                settings.isOpen ? "text-emerald-600" : "text-red-600"
              )}>
                {settings.isOpen
                  ? `${pendingOrders} pending orders`
                  : "Not accepting orders"}
              </p>
            </div>
          </div>
          {pendingOrders > 0 && settings.isOpen && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-full text-sm font-semibold animate-pulse">
              <Bell className="w-4 h-4" />
              {pendingOrders}
            </div>
          )}
        </div>

        <button
          onClick={handleToggleRestaurant}
          disabled={isToggling}
          className={cn(
            "w-full py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50",
            settings.isOpen
              ? "bg-red-500 hover:bg-red-600 active:scale-[0.98]"
              : "bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98]"
          )}
        >
          {isToggling ? "..." : settings.isOpen ? "Close Restaurant" : "Open Restaurant"}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">Today</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            ₹{todayRevenue.toLocaleString()}
          </p>
        </div>
        <div
          className="bg-white p-4 rounded-xl border border-border shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => onNavigate("orders")}
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-medium">Orders</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {todayOrders}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Recent Orders</h3>
          <button
            onClick={() => onNavigate("orders")}
            className="text-sm text-primary font-medium flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => onNavigate("orders")}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      #{order._id?.slice(-4).toUpperCase()}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      getStatusColor(order.status)
                    )}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(order.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {order.user?.name || "Guest"} • {order.items?.length || 0} items
                  </p>
                  <p className="font-semibold text-foreground">
                    ₹{order.totalAmount || order.total || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Quick Tip</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use the + button for quick actions like closing shop or toggling delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
