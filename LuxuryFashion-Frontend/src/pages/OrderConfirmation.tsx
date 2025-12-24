import { useLocation, Link, useNavigate } from "react-router-dom";
import { CheckCircle, MapPin, ArrowLeft } from "lucide-react";
import { MapPicker } from "@/components/MapPicker";
import { useEffect, useState } from "react";
import { fetchOrderHistory } from "@/lib/api";
import type { BackendOrder } from "@/hooks/useCartBackend";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as any) || {};
  const address = state.address || {};
  const orderType = state.orderType || "delivery";
  const orderId = state.orderId;
  const [order, setOrder] = useState<BackendOrder | null>(null);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      try {
        const history = await fetchOrderHistory();
        const found = history.find((o: any) => o._id === orderId || o.id === orderId);
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
        <p className="text-muted-foreground mb-6">
          Thank you for ordering from RangeelaDhaba! Your order is placed as <strong>{orderType.toUpperCase()}</strong>.
        </p>
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
              <p className="text-xs text-amber-600 mt-1">Outside 5 km radius — set to Takeaway</p>
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
            <div className="divide-y divide-border rounded-xl border border-border">
              {order.items?.map((i: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-medium text-foreground">{i.name || i.dish?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {i.quantity} • ₹{i.price}
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">
                    ₹{(i.price * i.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
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

