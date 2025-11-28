import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { demoAdminOrders, AdminOrder } from "@/data/adminData";
import { cn } from "@/lib/utils";

const statusColors: Record<AdminOrder["status"], string> = {
  Pending: "bg-terracotta-light text-terracotta",
  Preparing: "bg-gold/20 text-gold",
  Delivered: "bg-sage-light text-sage",
};

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminOrder["status"] | "All">("All");

  const filteredOrders = demoAdminOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Orders</h2>
          <p className="text-muted-foreground">Manage all customer orders</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-styled pl-10 w-full sm:w-64"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AdminOrder["status"] | "All")}
              className="input-styled pl-10 pr-8 appearance-none cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Preparing">Preparing</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Order ID</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Items</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-mono font-medium text-foreground">{order.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-foreground">{order.userName}</p>
                    <p className="text-xs text-muted-foreground">{order.userId}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-muted-foreground max-w-xs truncate">
                      {order.items.join(", ")}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold",
                      statusColors[order.status]
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-primary">
                    ₹{order.total}
                  </td>
                  <td className="py-4 px-6 text-right text-sm text-muted-foreground">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No orders found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
