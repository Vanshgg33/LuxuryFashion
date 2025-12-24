import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrder } from "@/lib/api";
import { Package, MapPin, Phone, Calendar, ArrowLeft, CheckCircle, Clock, Truck } from "lucide-react";

interface OrderItem {
  dish?: string;
  name: string;
  price: number;
  quantity: number;
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

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  placed: { label: "Order Placed", icon: CheckCircle, color: "text-blue-600" },
  preparing: { label: "Preparing", icon: Clock, color: "text-yellow-600" },
  out_for_delivery: { label: "Out for Delivery", icon: Truck, color: "text-purple-600" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-green-600" },
};

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getOrder(id);
        setOrder(data);
      } catch (err: any) {
        console.error("Failed to load order:", err);
        
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id, navigate]);

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
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <p className="font-semibold text-foreground">
                    ₹{(item.price * item.quantity).toFixed(2)}
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






