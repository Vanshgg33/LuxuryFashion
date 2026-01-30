import { useLocation, Link, useNavigate } from "react-router-dom";
import { CheckCircle, MapPin, ArrowLeft, Clock, Package, Gift } from "lucide-react";
import { MapPicker } from "@/components/MapPicker";
import { useEffect, useState } from "react";
import { fetchOrderHistory } from "@/lib/api";
import type { BackendOrder } from "@/hooks/useCartBackend";

// Type for location state passed from Cart
interface LocationState {
  orderId?: string;
  orderType?: "delivery" | "takeaway";
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    lat?: number;
    lng?: number;
    phoneNumber?: string;
  };
}

// Type for order items
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  isFree?: boolean;
  dish?: { name: string };
}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState) || {};
  const address = state.address || {};
  const orderType = state.orderType || "delivery";
  const orderId = state.orderId;
  const [order, setOrder] = useState<BackendOrder | null>(null);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      try {
        const history = await fetchOrderHistory();
        const found = history.find((o: BackendOrder) => o._id === orderId || o.id === orderId);
        if (found) setOrder(found);
      } catch (err) {
        console.error("Failed to load order for confirmation", err);
      }
    })();
  }, [orderId]);

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 text-green-600 mb-4">
          <CheckCircle className="w-6 h-6" />
          <h1 className="text-2xl font-display font-bold text-foreground">Order Confirmed</h1>
        </div>
        <p className="text-muted-foreground mb-4">
          Thank you for ordering from RangeelaDhaba! Your order is placed as <strong>{orderType.toUpperCase()}</strong>.
        </p>

        {/* Estimated Wait Time */}
        <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${orderType === "delivery" ? "bg-blue-50 border border-blue-200" : "bg-amber-50 border border-amber-200"}`}>
          <div className={`p-2 rounded-full ${orderType === "delivery" ? "bg-blue-100" : "bg-amber-100"}`}>
            {orderType === "delivery" ? (
              <Clock className="w-5 h-5 text-blue-600" />
            ) : (
              <Package className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div>
            <p className={`font-semibold ${orderType === "delivery" ? "text-blue-700" : "text-amber-700"}`}>
              {orderType === "delivery" ? "Estimated Delivery Time" : "Ready for Pickup"}
            </p>
            <p className={`text-sm ${orderType === "delivery" ? "text-blue-600" : "text-amber-600"}`}>
              {orderType === "delivery"
                ? "Your order will arrive in approximately 1 hour"
                : "Your order will be ready for pickup in 30-45 minutes"}
            </p>
          </div>
        </div>

        {orderId && (
          <p className="text-sm font-mono text-muted-foreground mb-4">
            Order ID: {orderId}
          </p>
        )}
        <div className="flex items-start gap-3 bg-secondary/40 border border-border rounded-xl p-4 mb-6">
          <MapPin className="w-5 h-5 text-primary mt-1" />
          <div>
            <p className="text-sm text-muted-foreground">Delivery / Pickup Address</p>
            <p className="font-semibold text-foreground">
              {[address.street, address.city, address.state, address.zipCode, address.country]
                .filter(Boolean)
                .join(", ")}
            </p>
            {orderType === "takeaway" && (
              <p className="text-xs text-amber-600 mt-1">Outside 2 km radius — set to Takeaway</p>
            )}
          </div>
        </div>
        {address.lat && address.lng && (
          <div className="mb-6">
            <MapPicker lat={address.lat} lng={address.lng} onChange={() => {}} height="260px" />
          </div>
        )}
        {order && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Items</h3>
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {order.items?.map((i: OrderItem, idx: number) => (
                <div key={idx} className={`flex items-center justify-between p-3 ${i.isFree ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      {i.isFree && <Gift className="w-4 h-4 text-green-600" />}
                      {i.name || i.dish?.name}
                      {i.isFree && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">FREE</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {i.quantity} {!i.isFree && `• ₹${i.price}`}
                    </p>
                  </div>
                  <span className={`font-semibold ${i.isFree ? 'text-green-600' : 'text-foreground'}`}>
                    {i.isFree ? 'FREE' : `₹${(i.price * i.quantity).toFixed(2)}`}
                  </span>
                </div>
              ))}
              {/* Show discount if applied */}
              {order.discountAmount && order.discountAmount > 0 && (
                <div className="flex items-center justify-between p-3 bg-green-50/50 dark:bg-green-900/10">
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Discount {order.couponCode && `(${order.couponCode})`}
                  </span>
                  <span className="font-semibold text-green-600">-₹{order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-secondary/40">
                <span className="text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">₹{order.totalAmount || order.totalPrice}</span>
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => navigate("/orders")} className="btn-primary">
            View Orders
          </button>
          <Link to="/menu" className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Continue Ordering
          </Link>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmation;

