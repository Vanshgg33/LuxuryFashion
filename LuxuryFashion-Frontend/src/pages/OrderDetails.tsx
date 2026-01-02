import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { getOrder } from "@/lib/api";
import { Package, MapPin, Phone, Calendar, ArrowLeft, CheckCircle, Clock, Truck, ChefHat, XCircle, Gift } from "lucide-react";

interface OrderItem {
  dish?: string;
  name: string;
  price: number;
  quantity: number;
  isFree?: boolean;
}

interface Order {
  _id?: string;
  id?: string;
  items: OrderItem[];
  subtotal?: number;
  discountAmount?: number;
  couponCode?: string;
  totalAmount: number;
  totalPrice?: number;
  status: string;
  orderType: "delivery" | "takeaway";
  address?: any;
  createdAt?: string;
  paymentStatus?: string;
}

// Backend status values: placed, preparing, ready_for_pickup, out_for_delivery, delivered, cancelled
const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  placed: { label: "Order Placed", icon: Clock, color: "text-blue-600" },
  preparing: { label: "Preparing", icon: ChefHat, color: "text-orange-600" },
  ready_for_pickup: { label: "Ready for Pickup", icon: Package, color: "text-blue-600" },
  out_for_delivery: { label: "Out for Delivery", icon: Truck, color: "text-purple-600" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-green-600" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-600" },
};

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const isLoadingRef = useRef(false);

  const loadOrder = useCallback(async (showLoading = true) => {
    if (!id || isLoadingRef.current) return;
    try {
      isLoadingRef.current = true;
      if (showLoading) setLoading(true);
      const data = await getOrder(id);
      setOrder(data);
    } catch (err: any) {
      console.error("Failed to load order:", err);
      if (showLoading) navigate("/orders");
    } finally {
      isLoadingRef.current = false;
      if (showLoading) setLoading(false);
    }
  }, [id, navigate]);

  // Initial load
  useEffect(() => {
    loadOrder(true);
  }, [loadOrder]);

  // Poll for updates on active orders
  useEffect(() => {
    if (!order) return;
    const isActiveOrder = !['delivered', 'cancelled'].includes(order.status?.toLowerCase() || '');
    if (!isActiveOrder) return;

    const interval = setInterval(() => {
      loadOrder(false); // Silent refresh
    }, 10000);

    return () => clearInterval(interval);
  }, [order?.status, loadOrder]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading order details...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/orders" className="btn-primary mt-4 inline-block">
          Back to Orders
        </Link>
      </main>
    );
  }

  const statusInfo = statusConfig[order.status] || statusConfig.placed;
  const StatusIcon = statusInfo.icon;
  const total = order.totalAmount || order.totalPrice || 0;
  const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = order.discountAmount || 0;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/orders" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Order Details</h1>
            <p className="text-muted-foreground">Order ID: {order.id || order._id}</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center gap-4">
            <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
            <div>
              <h2 className="text-lg font-semibold text-foreground">{statusInfo.label}</h2>
              <p className="text-sm text-muted-foreground capitalize">
                {order.orderType} • {order.paymentStatus || "Payment Pending"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${item.isFree ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-secondary/50'}`}>
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      {item.isFree && <Gift className="w-4 h-4 text-green-600" />}
                      {item.name}
                      {item.isFree && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">FREE</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} {!item.isFree && `× ₹${item.price}`}
                    </p>
                  </div>
                  <p className={`font-semibold ${item.isFree ? 'text-green-600' : 'text-foreground'}`}>
                    {item.isFree ? 'FREE' : `₹${(item.price * item.quantity).toFixed(2)}`}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="mt-6 pt-6 border-t border-border space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-6">
            {/* Address */}
            {order.address && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Delivery Address
                </h2>
                <div className="space-y-2 text-muted-foreground">
                  <p className="font-medium text-foreground">{order.address.street}</p>
                  <p>
                    {order.address.city}, {order.address.state} {order.address.zipCode}
                  </p>
                  <p>{order.address.country || "India"}</p>
                  {order.address.phoneNumber && (
                    <p className="flex items-center gap-2 mt-3">
                      <Phone className="w-4 h-4" />
                      {order.address.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Order Info */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Order Information
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="text-foreground">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("en-IN")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Type</span>
                  <span className="text-foreground capitalize">{order.orderType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className="text-foreground capitalize">{order.paymentStatus || "Pending"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderDetails;






