import { Search, Filter, CheckCircle, Clock, Truck, ArrowUpDown, Package, XCircle, Loader2, Printer, Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { fetchAdminOrders, updateOrderStatus } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminOrderNotifications, NewOrderData } from "@/hooks/useAdminOrderNotifications";
import { OrderReceipt, OrderReceiptData, printReceipt } from "@/components/OrderReceipt";

const statusColors: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  preparing: "bg-amber-100 text-amber-700",
  ready_for_pickup: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  placed: "Placed",
  preparing: "Preparing",
  ready_for_pickup: "Ready for Pickup",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "All">("All");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const [newOrderPopupOpen, setNewOrderPopupOpen] = useState(false);
  const [selectedNewOrder, setSelectedNewOrder] = useState<NewOrderData | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { refreshOrders, clearNewOrdersIndicator, newOrders, dismissNewOrders, toggleSound, isSoundEnabled } = useAdminOrderNotifications();

  const loadOrders = async () => {
    try {
      const res = await fetchAdminOrders();
      const ordersArray = Array.isArray(res) ? res : [];
      
      // Detect new orders
      const currentOrderIds = new Set(
        ordersArray.map((o: any) => (o._id || o.id)?.toString()).filter(Boolean)
      );
      
      // Find newly added orders
      const newlyAdded = Array.from(currentOrderIds).filter(
        (id) => !previousOrderIdsRef.current.has(id)
      );
      
      if (newlyAdded.length > 0 && previousOrderIdsRef.current.size > 0) {
        setNewOrderIds(new Set(newlyAdded));
        // Clear the "new" indicator after 5 seconds
        setTimeout(() => {
          setNewOrderIds(new Set());
        }, 5000);
      }
      
      previousOrderIdsRef.current = currentOrderIds;
      setOrders(ordersArray);
    } catch (err) {
      console.error("Failed to fetch admin orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Clear notification indicator when page loads
    clearNewOrdersIndicator();

    // Refresh orders every 5 seconds
    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Show popup when new orders arrive
  useEffect(() => {
    if (newOrders.length > 0) {
      setSelectedNewOrder(newOrders[0]);
      setNewOrderPopupOpen(true);
    }
  }, [newOrders]);

  const handleDismissNewOrder = () => {
    setNewOrderPopupOpen(false);
    setSelectedNewOrder(null);
    dismissNewOrders();
  };

  const handlePrintReceipt = () => {
    if (receiptRef.current) {
      printReceipt(receiptRef.current);
    }
  };

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundEnabled(newState);
  };

  const getReceiptData = (order: NewOrderData): OrderReceiptData => ({
    orderId: order._id || order.id || "",
    orderDate: order.createdAt
      ? new Date(order.createdAt).toLocaleString("en-IN")
      : new Date().toLocaleString("en-IN"),
    customerName: order.user?.name || order.userName || "Guest",
    customerEmail: order.user?.email,
    customerPhone: order.address?.phoneNumber,
    orderType: order.orderType || "delivery",
    address: order.address,
    items: (order.items || []).map(item => ({
      name: item.name || item.dish?.name || "Unknown Item",
      quantity: item.quantity || 1,
      price: item.price || 0,
    })),
    subtotal: order.subtotal || order.totalAmount || order.total || 0,
    discountAmount: order.discountAmount,
    couponCode: order.couponCode,
    totalAmount: order.totalAmount || order.total || 0,
  });

  // Function to print receipt for any order in the table
  const handlePrintOrderReceipt = (order: any) => {
    const receiptData: OrderReceiptData = {
      orderId: order._id || order.id || "",
      orderDate: order.createdAt
        ? new Date(order.createdAt).toLocaleString("en-IN")
        : new Date().toLocaleString("en-IN"),
      customerName: order.user?.name || order.userName || "Guest",
      customerEmail: order.user?.email,
      customerPhone: order.address?.phoneNumber,
      orderType: order.orderType || "delivery",
      address: order.address,
      items: (order.items || []).map((item: any) => ({
        name: item.name || item.dish?.name || "Unknown Item",
        quantity: item.quantity || 1,
        price: item.price || 0,
      })),
      subtotal: order.subtotal || order.totalAmount || order.total || 0,
      discountAmount: order.discountAmount,
      couponCode: order.couponCode,
      totalAmount: order.totalAmount || order.total || 0,
    };

    // Create a temporary element to render the receipt
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = `
      <div style="width: 80mm; padding: 10mm; font-family: monospace; font-size: 12px; background-color: white; color: black;">
        <div style="text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px;">
          <h1 style="font-size: 18px; font-weight: bold; margin: 0 0 5px 0;">Rangeela Dhaba</h1>
        </div>
        <div style="margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px;">
          <p style="margin: 3px 0;"><strong>Order #:</strong> ${receiptData.orderId.slice(-8).toUpperCase()}</p>
          <p style="margin: 3px 0;"><strong>Date:</strong> ${receiptData.orderDate}</p>
          <p style="margin: 3px 0;"><strong>Type:</strong> ${receiptData.orderType === "delivery" ? "DELIVERY" : "TAKEAWAY"}</p>
        </div>
        <div style="margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px;">
          <p style="margin: 3px 0; font-weight: bold;">Customer:</p>
          <p style="margin: 3px 0;">${receiptData.customerName}</p>
          ${receiptData.customerPhone ? `<p style="margin: 3px 0;">Phone: ${receiptData.customerPhone}</p>` : ""}
          ${receiptData.orderType === "delivery" && receiptData.address ? `
            <div style="margin-top: 5px;">
              <p style="margin: 3px 0; font-weight: bold;">Delivery Address:</p>
              <p style="margin: 3px 0; font-size: 11px;">
                ${receiptData.address.street || ""}<br/>
                ${receiptData.address.city || ""}, ${receiptData.address.state || ""} ${receiptData.address.zipCode || ""}
              </p>
            </div>
          ` : ""}
        </div>
        <div style="margin-bottom: 10px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th style="text-align: left; padding: 5px 0; font-size: 11px;">Item</th>
                <th style="text-align: center; padding: 5px 0; font-size: 11px;">Qty</th>
                <th style="text-align: right; padding: 5px 0; font-size: 11px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${receiptData.items.map(item => `
                <tr style="border-bottom: 1px dotted #ccc;">
                  <td style="padding: 5px 0; font-size: 11px;">${item.name}</td>
                  <td style="text-align: center; padding: 5px 0; font-size: 11px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 5px 0; font-size: 11px;">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        <div style="border-top: 1px dashed #000; padding-top: 10px;">
          <div style="display: flex; justify-content: space-between; margin: 3px 0;">
            <span>Subtotal:</span>
            <span>₹${receiptData.subtotal.toFixed(2)}</span>
          </div>
          ${receiptData.discountAmount && receiptData.discountAmount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin: 3px 0; color: green;">
              <span>Discount ${receiptData.couponCode ? `(${receiptData.couponCode})` : ""}:</span>
              <span>-₹${receiptData.discountAmount.toFixed(2)}</span>
            </div>
          ` : ""}
          <div style="display: flex; justify-content: space-between; margin: 8px 0 0 0; padding-top: 8px; border-top: 1px solid #000; font-weight: bold; font-size: 14px;">
            <span>TOTAL:</span>
            <span>₹${receiptData.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        <div style="text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000;">
          <p style="margin: 5px 0; font-size: 11px;">Thank you for your order!</p>
          <p style="margin: 3px 0; font-size: 10px; color: #666;">${new Date().toLocaleString("en-IN")}</p>
        </div>
      </div>
    `;

    printReceipt(tempDiv.firstElementChild as HTMLElement);
  };

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sortKey, setSortKey] = useState<"date" | "total" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{ id: string; status: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const orderId = order.id || order._id || "";
    const userName = order.user?.name || order.userName || "";
    const matchesSearch =
      orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filteredOrders].sort((a, b) => {
    const va =
      sortKey === "date"
        ? new Date(a.createdAt || a.date || 0).getTime()
        : sortKey === "total"
        ? a.totalAmount || a.total || 0
        : (a.status || "").localeCompare(b.status || "");
    const vb =
      sortKey === "date"
        ? new Date(b.createdAt || b.date || 0).getTime()
        : sortKey === "total"
        ? b.totalAmount || b.total || 0
        : (b.status || "").localeCompare(a.status || "");
    return sortDir === "asc" ? va - vb : vb - va;
  });

  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  const confirmStatusChange = (orderId: string, status: string) => {
    setPendingChange({ id: orderId, status });
    setCancelReason("");
    setConfirmOpen(true);
  };

  const handleStatusChange = async () => {
    if (!pendingChange) return;
    const { id, status } = pendingChange;
    setIsUpdatingStatus(true);
    try {
      await updateOrderStatus(id, status, status === "cancelled" ? cancelReason : undefined);
      setOrders((prev) => prev.map((o) => (o._id === id || o.id === id ? { ...o, status } : o)));
      setConfirmOpen(false);
      setPendingChange(null);
      setCancelReason("");
    } catch (err: any) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Orders</h2>
          <p className="text-muted-foreground">Manage all customer orders</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Sound Toggle Button */}
          <button
            onClick={handleToggleSound}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm font-medium",
              soundEnabled
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
            )}
            title={soundEnabled ? "Sound notifications ON" : "Sound notifications OFF"}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Sound ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">Sound OFF</span>
              </>
            )}
          </button>
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-styled pl-10 pr-8 appearance-none cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="placed">Placed</option>
              <option value="preparing">Preparing</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
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
                <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">
                  <button
                    className="inline-flex items-center gap-1"
                    onClick={() => {
                      setSortKey("status");
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    }}
                  >
                    Status <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">
                  <button
                    className="inline-flex items-center gap-1"
                    onClick={() => {
                      setSortKey("total");
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    }}
                  >
                    Total <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">
                  <button
                    className="inline-flex items-center gap-1"
                    onClick={() => {
                      setSortKey("date");
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    }}
                  >
                    Date <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-6 px-6 text-center text-muted-foreground" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td className="py-6 px-6 text-center text-muted-foreground" colSpan={7}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                paged.map((order) => {
                  const orderId = (order._id || order.id)?.toString();
                  const isNewOrder = orderId && newOrderIds.has(orderId);
                  
                  return (
                    <tr 
                      key={order._id || order.id} 
                      className={cn(
                        "border-t border-border hover:bg-secondary/30 transition-all duration-300",
                        isNewOrder && "bg-primary/5 border-primary/30 animate-pulse"
                      )}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-foreground text-sm">
                            #{(order._id || order.id).slice(-8).toUpperCase()}
                          </span>
                          {isNewOrder && (
                            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full animate-scale-in">
                              NEW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-foreground">{order.user?.name || order.userName}</p>
                        <p className="text-xs text-muted-foreground">{order.user?.email || order.userId}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {order.items?.map((i: any) => i.name || i.dish?.name).join(", ")}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          statusColors[order.status] || "bg-secondary text-foreground"
                        )}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-primary">
                        ₹{order.totalAmount || order.total}
                      </td>
                      <td className="py-4 px-6 text-right text-sm text-muted-foreground">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : order.date}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          {/* Print Button - Always visible */}
                          <button
                            className="btn-secondary text-xs flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100"
                            onClick={() => handlePrintOrderReceipt(order)}
                            title="Print Receipt"
                          >
                            <Printer className="w-3 h-3" /> Print
                          </button>

                          {order.status !== "delivered" && order.status !== "cancelled" ? (
                            <>
                              {order.status === "placed" && (
                                <button
                                  className="btn-secondary text-xs flex items-center gap-1 px-2 py-1"
                                  onClick={() => confirmStatusChange(order._id || order.id, "preparing")}
                                >
                                  <Clock className="w-3 h-3" /> Preparing
                                </button>
                              )}
                              {(order.status === "placed" || order.status === "preparing") && order.orderType === "takeaway" && (
                                <button
                                  className="btn-secondary text-xs flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100"
                                  onClick={() => confirmStatusChange(order._id || order.id, "ready_for_pickup")}
                                >
                                  <Package className="w-3 h-3" /> Ready
                                </button>
                              )}
                              {(order.status === "placed" || order.status === "preparing") && order.orderType === "delivery" && (
                                <button
                                  className="btn-secondary text-xs flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100"
                                  onClick={() => confirmStatusChange(order._id || order.id, "out_for_delivery")}
                                >
                                  <Truck className="w-3 h-3" /> Dispatch
                                </button>
                              )}
                              {(order.status === "out_for_delivery" || order.status === "ready_for_pickup") && (
                                <button
                                  className="btn-secondary text-xs flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100"
                                  onClick={() => confirmStatusChange(order._id || order.id, "delivered")}
                                >
                                  <CheckCircle className="w-3 h-3" /> Delivered
                                </button>
                              )}
                              <button
                                className="btn-secondary text-xs flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600"
                                onClick={() => confirmStatusChange(order._id || order.id, "cancelled")}
                              >
                                <XCircle className="w-3 h-3" /> Cancel
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              {order.status === "delivered" ? "Completed" : "Cancelled"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className="btn-secondary text-xs"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              className="btn-secondary text-xs"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingChange?.status === "cancelled"
                ? "Cancel Order"
                : "Confirm Status Change"}
            </DialogTitle>
          </DialogHeader>

          {pendingChange?.status === "cancelled" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to cancel order #{pendingChange?.id.slice(-8).toUpperCase()}?
              </p>
              <div className="space-y-2">
                <Label htmlFor="cancelReason">Reason for cancellation (optional)</Label>
                <Input
                  id="cancelReason"
                  placeholder="e.g., Out of stock, Customer request..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
                The customer will be notified via email about the cancellation.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Change order #{pendingChange?.id.slice(-8).toUpperCase()} to status "
              {statusLabels[pendingChange?.status || ""] || pendingChange?.status}"?
            </p>
          )}

          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={isUpdatingStatus}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={isUpdatingStatus}
              className={cn(
                pendingChange?.status === "cancelled" ? "bg-red-600 hover:bg-red-700" : "",
                "min-w-[100px]"
              )}
            >
              {isUpdatingStatus ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                pendingChange?.status === "cancelled" ? "Cancel Order" : "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Order Notification Popup */}
      <Dialog open={newOrderPopupOpen} onOpenChange={setNewOrderPopupOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Bell className="w-5 h-5 animate-bounce" />
              New Order Received!
            </DialogTitle>
          </DialogHeader>

          {selectedNewOrder && (
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-bold text-primary text-lg">
                    #{(selectedNewOrder._id || selectedNewOrder.id || "").slice(-8).toUpperCase()}
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    selectedNewOrder.orderType === "delivery"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-purple-100 text-purple-700"
                  )}>
                    {selectedNewOrder.orderType === "delivery" ? "Delivery" : "Takeaway"}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{selectedNewOrder.user?.name || selectedNewOrder.userName || "Guest"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items:</span>
                    <span className="font-medium">{selectedNewOrder.items?.length || 0} items</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t border-primary/20">
                    <span>Total:</span>
                    <span>₹{selectedNewOrder.totalAmount || selectedNewOrder.total || 0}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="max-h-48 overflow-y-auto">
                <p className="text-sm font-medium text-foreground mb-2">Order Items:</p>
                <div className="space-y-2">
                  {selectedNewOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm py-2 px-3 bg-secondary/50 rounded-lg">
                      <span>{item.name || item.dish?.name || "Unknown Item"} × {item.quantity || 1}</span>
                      <span className="font-medium">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {selectedNewOrder.orderType === "delivery" && selectedNewOrder.address && (
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground mb-1">Delivery Address:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedNewOrder.address.street && <>{selectedNewOrder.address.street}, </>}
                    {selectedNewOrder.address.city && <>{selectedNewOrder.address.city}, </>}
                    {selectedNewOrder.address.state && <>{selectedNewOrder.address.state} </>}
                    {selectedNewOrder.address.zipCode}
                  </p>
                  {selectedNewOrder.address.phoneNumber && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Phone: {selectedNewOrder.address.phoneNumber}
                    </p>
                  )}
                </div>
              )}

              {/* Hidden receipt for printing */}
              <div className="hidden">
                <OrderReceipt ref={receiptRef} order={getReceiptData(selectedNewOrder)} />
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant="secondary" onClick={handleDismissNewOrder} className="w-full sm:w-auto">
              Dismiss
            </Button>
            <Button
              onClick={handlePrintReceipt}
              className="w-full sm:w-auto flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
