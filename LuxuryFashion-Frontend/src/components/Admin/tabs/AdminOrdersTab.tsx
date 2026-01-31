import { useState, useEffect } from "react";
import { Package, Clock, Phone, MapPin, ChevronDown, ChevronUp, Check, X, Truck, ShoppingBag, RefreshCw, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAdminOrders, updateOrderStatus } from "@/lib/api";
import { toast } from "sonner";

type FilterType = "all" | "placed" | "preparing" | "ready_for_pickup" | "out_for_delivery" | "delivered" | "cancelled";

export const AdminOrdersTab = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const loadOrders = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const data = await fetchAdminOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => loadOrders(), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, status: newStatus } : o
      ));
      toast.success(`Order updated to ${getStatusLabel(newStatus)}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filters: { id: FilterType; label: string; color: string }[] = [
    { id: "all", label: "All", color: "bg-gray-100 text-gray-700" },
    { id: "placed", label: "New", color: "bg-blue-100 text-blue-700" },
    { id: "preparing", label: "Prep", color: "bg-amber-100 text-amber-700" },
    { id: "ready_for_pickup", label: "Ready", color: "bg-purple-100 text-purple-700" },
    { id: "out_for_delivery", label: "Out", color: "bg-indigo-100 text-indigo-700" },
    { id: "delivered", label: "Done", color: "bg-emerald-100 text-emerald-700" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "preparing": return "bg-amber-100 text-amber-700 border-amber-200";
      case "ready_for_pickup": return "bg-purple-100 text-purple-700 border-purple-200";
      case "out_for_delivery": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "delivered": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "placed": return "New Order";
      case "preparing": return "Preparing";
      case "ready_for_pickup": return "Ready";
      case "out_for_delivery": return "Out for Delivery";
      case "delivered": return "Delivered";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  const getNextStatus = (status: string) => {
    switch (status) {
      case "placed": return "preparing";
      case "preparing": return "ready_for_pickup";
      case "ready_for_pickup": return "out_for_delivery";
      case "out_for_delivery": return "delivered";
      default: return null;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter(o => o.status === filter);

  const statusCounts = {
    all: orders.length,
    placed: orders.filter(o => o.status === "placed").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    ready_for_pickup: orders.filter(o => o.status === "ready_for_pickup").length,
    out_for_delivery: orders.filter(o => o.status === "out_for_delivery").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Orders</h2>
        <button
          onClick={() => loadOrders(true)}
          disabled={refreshing}
          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <RefreshCw className={cn("w-5 h-5 text-muted-foreground", refreshing && "animate-spin")} />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              filter === f.id
                ? cn(f.color, "ring-2 ring-offset-1 ring-current")
                : "bg-secondary text-muted-foreground"
            )}
          >
            {f.label}
            {statusCounts[f.id] > 0 && (
              <span className={cn(
                "min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center",
                filter === f.id ? "bg-white/30" : "bg-primary/10 text-primary"
              )}>
                {statusCounts[f.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order._id;
            const nextStatus = getNextStatus(order.status);

            return (
              <div
                key={order._id}
                className={cn(
                  "bg-white rounded-xl border shadow-sm overflow-hidden transition-all",
                  getStatusColor(order.status)
                )}
              >
                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-lg">
                          #{order._id?.slice(-4).toUpperCase()}
                        </span>
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-semibold",
                          getStatusColor(order.status)
                        )}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {order.user?.name || "Guest"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        ₹{order.totalAmount || order.total || 0}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4" />
                        {order.items?.length || 0} items
                      </span>
                      <span className="flex items-center gap-1">
                        {order.orderType === "delivery" ? (
                          <Truck className="w-4 h-4" />
                        ) : (
                          <ShoppingBag className="w-4 h-4" />
                        )}
                        {order.orderType === "delivery" ? "Delivery" : "Takeaway"}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border/50 bg-white">
                    {/* Items */}
                    <div className="p-4 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Items</p>
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-foreground">
                            {item.quantity}× {item.name || item.dish?.name}
                            {item.isHalfPortion && " (Half)"}
                            {item.isFree && " (Free)"}
                          </span>
                          <span className="text-muted-foreground">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Customer Info */}
                    {order.orderType === "delivery" && order.address && (
                      <div className="px-4 pb-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Delivery Address</p>
                          {order.address?.label && (
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {order.address.label}
                            </span>
                          )}
                        </div>

                        <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-foreground space-y-0.5">
                              {(order.address?.houseNumber || order.address?.apartment || order.address?.floor) && (
                                <p>
                                  {order.address?.houseNumber && `${order.address.houseNumber}`}
                                  {order.address?.apartment && `, ${order.address.apartment}`}
                                  {order.address?.floor && `, Floor ${order.address.floor}`}
                                </p>
                              )}
                              <p>
                                {order.address?.street}
                                {order.address?.area && `, ${order.address.area}`}
                              </p>
                              <p className="text-muted-foreground">
                                {order.address?.city}
                                {order.address?.state && `, ${order.address.state}`}
                                {order.address?.zipCode && ` - ${order.address.zipCode}`}
                              </p>
                            </div>
                          </div>

                          {order.address?.landmark && (
                            <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded ml-6">
                              📍 Landmark: {order.address.landmark}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {order.address?.phoneNumber && (
                            <a
                              href={`tel:${order.address?.phoneNumber}`}
                              className="flex-1 flex items-center justify-center gap-2 text-sm text-white bg-primary hover:bg-primary/90 py-2 px-3 rounded-lg transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                              {order.address?.phoneNumber}
                            </a>
                          )}
                          <button
                            onClick={() => {
                              const fullAddress = [
                                order.address?.houseNumber,
                                order.address?.apartment,
                                order.address?.street,
                                order.address?.area,
                                order.address?.city,
                                order.address?.state,
                                order.address?.zipCode
                              ].filter(Boolean).join(', ');
                              navigator.clipboard.writeText(fullAddress);
                              toast.success("Address copied!");
                            }}
                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                            title="Copy address"
                          >
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => {
                              const fullAddress = [
                                order.address?.street,
                                order.address?.city,
                                order.address?.state
                              ].filter(Boolean).join(', ');
                              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`, '_blank');
                            }}
                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                            title="Open in Maps"
                          >
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Special Instructions */}
                    {order.specialInstructions && (
                      <div className="px-4 pb-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                        <p className="text-sm text-foreground bg-amber-50 p-2 rounded-lg border border-amber-200">
                          {order.specialInstructions}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <div className="p-4 pt-0 flex gap-2">
                        {nextStatus && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, nextStatus)}
                            disabled={updatingOrder === order._id}
                            className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {updatingOrder === order._id ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <Check className="w-5 h-5" />
                                Mark as {getStatusLabel(nextStatus)}
                              </>
                            )}
                          </button>
                        )}
                        {order.status === "placed" && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, "cancelled")}
                            disabled={updatingOrder === order._id}
                            className="py-3 px-4 rounded-xl bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
