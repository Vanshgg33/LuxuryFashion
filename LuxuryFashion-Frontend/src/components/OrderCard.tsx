import { Package, Clock, CheckCircle, Truck } from "lucide-react";
import { BackendOrder } from "@/hooks/useCartBackend";

interface OrderCardProps {
  order: BackendOrder;
}

const statusConfig: Record<string, {
  icon: typeof Clock;
  color: string;
  label: string;
}> = {
  PENDING: {
    icon: Clock,
    color: "text-gold bg-gold/10",
    label: "Pending",
  },
  CONFIRMED: {
    icon: Clock,
    color: "text-blue-600 bg-blue-100",
    label: "Confirmed",
  },
  SHIPPED: {
    icon: Truck,
    color: "text-primary bg-sage-light",
    label: "Shipped",
  },
  DELIVERED: {
    icon: CheckCircle,
    color: "text-green-600 bg-green-100",
    label: "Delivered",
  },
  CANCELLED: {
    icon: Package,
    color: "text-red-600 bg-red-100",
    label: "Cancelled",
  },
  // Legacy support
  Preparing: {
    icon: Clock,
    color: "text-gold bg-gold/10",
    label: "Preparing",
  },
  "On the way": {
    icon: Truck,
    color: "text-primary bg-sage-light",
    label: "On the way",
  },
};

export function OrderCard({ order }: OrderCardProps) {
  const statusKey = order.status?.toUpperCase() || "PENDING";
  const status = statusConfig[statusKey] || statusConfig.PENDING;
  const StatusIcon = status.icon;
  
  const orderDate = order.orderDate 
    ? new Date(order.orderDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <article className="bg-card rounded-2xl border border-border overflow-hidden hover-lift">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Order #{order.id}</p>
            <p className="text-sm text-muted-foreground">{orderDate}</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color}`}
        >
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{status.label}</span>
        </div>
      </div>

      {/* Items */}
      <div className="p-4">
        <div className="space-y-3">
          {order.items?.map((item: any, index: number) => {
            const product = item.product || {};
            const productImage = product.imagenames?.[0] || "/placeholder.svg";
            const productName = product.prod_name || "Unknown Product";
            const itemPrice = item.price || product.selling_price || product.prod_price || 0;
            
            return (
              <div key={item.id || index} className="flex items-center gap-3">
                <img
                  src={productImage}
                  alt={productName}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {productName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × ₹{itemPrice.toFixed(2)}
                    {item.size && <span className="ml-2">• Size: {item.size}</span>}
                  </p>
                </div>
                <span className="font-semibold text-foreground">
                  ₹{(itemPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Discount if applied */}
        {order.couponCode && order.discountAmount && order.discountAmount > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Coupon ({order.couponCode})</span>
              <span className="text-green-600 font-semibold">
                -₹{order.discountAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-muted-foreground">Total Amount</span>
          <span className="text-xl font-bold text-foreground">
            ₹{order.totalPrice?.toFixed(2) || order.total?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>
    </article>
  );
}
