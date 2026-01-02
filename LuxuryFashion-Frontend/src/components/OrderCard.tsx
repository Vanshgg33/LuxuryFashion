import { Package, Clock, CheckCircle, Truck, ArrowRight, XCircle, ChefHat, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { BackendOrder } from "@/hooks/useCartBackend";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: BackendOrder;
}

// Backend status values: placed, preparing, ready_for_pickup, out_for_delivery, delivered, cancelled
const statusConfig: Record<
  string,
  {
    icon: typeof Clock;
    bgColor: string;
    textColor: string;
    label: string;
  }
> = {
  // Backend statuses (uppercase for matching)
  PLACED: {
    icon: Clock,
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
    label: "Order Placed",
  },
  PREPARING: {
    icon: ChefHat,
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    textColor: "text-orange-600 dark:text-orange-400",
    label: "Preparing",
  },
  READY_FOR_PICKUP: {
    icon: Package,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-600 dark:text-blue-400",
    label: "Ready for Pickup",
  },
  OUT_FOR_DELIVERY: {
    icon: Truck,
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    textColor: "text-purple-600 dark:text-purple-400",
    label: "Out for Delivery",
  },
  DELIVERED: {
    icon: CheckCircle,
    bgColor: "bg-green-50 dark:bg-green-950/30",
    textColor: "text-green-600 dark:text-green-400",
    label: "Delivered",
  },
  CANCELLED: {
    icon: XCircle,
    bgColor: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-600 dark:text-red-400",
    label: "Cancelled",
  },
  // Legacy/fallback statuses
  PENDING: {
    icon: Clock,
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
    label: "Pending",
  },
  CONFIRMED: {
    icon: ChefHat,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-600 dark:text-blue-400",
    label: "Confirmed",
  },
  SHIPPED: {
    icon: Truck,
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    textColor: "text-purple-600 dark:text-purple-400",
    label: "On the way",
  },
};

export function OrderCard({ order }: OrderCardProps) {
  const statusKey = order.status?.toUpperCase() || "PENDING";
  const status = statusConfig[statusKey] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  const rawDate = (order as any).orderDate || (order as any).createdAt;
  const orderDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const orderTime = rawDate
    ? new Date(rawDate).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const orderId = order.id || order._id;
  const shortOrderId = typeof orderId === 'string' ? orderId.slice(-8).toUpperCase() : orderId;
  const itemCount = order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;

  return (
    <Link to={`/order/${orderId}`} className="block group">
      <article className="card-premium overflow-hidden hover:shadow-medium transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              status.bgColor
            )}>
              <StatusIcon className={cn("w-6 h-6", status.textColor)} />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Order #{shortOrderId}
              </p>
              <p className="text-sm text-muted-foreground">
                {orderDate} • {orderTime}
              </p>
            </div>
          </div>
          <div className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium",
            status.bgColor,
            status.textColor
          )}>
            {status.label}
          </div>
        </div>

        {/* Items Preview */}
        <div className="p-5">
          {/* Items Grid */}
          <div className="flex items-center gap-3 mb-4">
            {/* Image Stack */}
            <div className="flex -space-x-2">
              {order.items?.slice(0, 3).map((item: any, index: number) => {
                const dish = item.dish || {};
                const productImage = dish.imageUrl || "/placeholder.svg";
                return (
                  <div
                    key={item.id || index}
                    className="w-10 h-10 rounded-lg overflow-hidden border-2 border-background shadow-soft"
                    style={{ zIndex: 3 - index }}
                  >
                    <img
                      src={productImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
              {order.items && order.items.length > 3 && (
                <div className="w-10 h-10 rounded-lg bg-secondary border-2 border-background flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  +{order.items.length - 3}
                </div>
              )}
            </div>
            {/* Items Summary */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground font-medium line-clamp-1">
                {order.items?.map((item: any) => item.name || item.dish?.name || "Item").join(", ")}
              </p>
              <p className="text-xs text-muted-foreground">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Free Items Badge */}
            {order.items?.some((item: any) => item.isFree) && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                <Gift className="w-3 h-3" />
                Free items included
              </div>
            )}
            {/* Discount Badge */}
            {order.couponCode && order.discountAmount && order.discountAmount > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                <CheckCircle className="w-3 h-3" />
                Saved ₹{order.discountAmount.toFixed(0)} with {order.couponCode}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-foreground tabular-nums">
                ₹{order.totalPrice?.toFixed?.(2) ||
                  order.totalAmount?.toFixed?.(2) ||
                  order.total?.toFixed?.(2) ||
                  "0.00"}
              </p>
            </div>
            <div className={cn(
              "flex items-center gap-2",
              "px-4 py-2 rounded-full",
              "bg-secondary text-foreground",
              "text-sm font-medium",
              "transition-all duration-300",
              "group-hover:bg-foreground group-hover:text-background"
            )}>
              View Details
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
