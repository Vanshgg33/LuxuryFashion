import { Package, Clock, CheckCircle, Truck } from "lucide-react";
import { Order } from "@/hooks/useCart";

interface OrderCardProps {
  order: Order;
}

const statusConfig = {
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
  Delivered: {
    icon: CheckCircle,
    color: "text-green-600 bg-green-100",
    label: "Delivered",
  },
};

export function OrderCard({ order }: OrderCardProps) {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <article className="bg-card rounded-2xl border border-border overflow-hidden hover-lift">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{order.id}</p>
            <p className="text-sm text-muted-foreground">{order.date}</p>
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
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {item.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity} × ₹{item.price}
                </p>
              </div>
              <span className="font-semibold text-foreground">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-muted-foreground">Total Amount</span>
          <span className="text-xl font-bold text-foreground">
            ₹{order.total}
          </span>
        </div>
      </div>
    </article>
  );
}
