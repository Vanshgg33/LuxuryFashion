import { Link, useLocation } from "react-router-dom";
import { Package, ArrowRight, ShoppingBag } from "lucide-react";
import { OrderCard } from "@/components/OrderCard";
import { useCartContext } from "@/contexts/CartContext";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

const Orders = () => {
  const { orders, loadOrders, ordersLoading } = useCartContext();
  const location = useLocation();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Check if there are any active (non-completed) orders
  const hasActiveOrders = useMemo(() =>
    orders.some(o => !['delivered', 'cancelled'].includes(o.status?.toLowerCase() || '')),
    [orders]
  );

  // Track mount state to prevent updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Force refresh when page is visited
  useEffect(() => {
    loadOrders(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Poll for updates when there are active orders
  useEffect(() => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (!hasActiveOrders) return;

    pollingIntervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        loadOrders(true);
      }
    }, 10000); // Refresh every 10 seconds for active orders

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveOrders]);

  // Loading State
  if (ordersLoading) {
    return (
      <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your orders...</p>
        </div>
      </main>
    );
  }

  // Empty State
  if (orders.length === 0) {
    return (
      <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-secondary flex items-center justify-center">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            No orders yet
          </h1>
          <p className="text-muted-foreground mb-8">
            You haven't placed any orders yet. Start exploring our delicious menu and discover your new favorites.
          </p>
          <Link
            to="/menu"
            className={cn(
              "inline-flex items-center justify-center gap-2",
              "px-8 py-4 rounded-full",
              "bg-foreground text-background",
              "font-semibold text-base",
              "transition-all duration-300",
              "hover:opacity-90 hover:shadow-large",
              "group"
            )}
          >
            Browse Menu
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </main>
    );
  }

  // Calculate order stats
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status?.toUpperCase() === "DELIVERED").length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || o.total || 0), 0);

  return (
    <main className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="bg-muted/30 border-b border-border">
        <div className="container-wide py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Your Orders
              </h1>
              <p className="text-muted-foreground mt-1">
                Track and manage your food orders
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{deliveredOrders}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="text-center hidden sm:block">
                <p className="text-2xl font-bold text-foreground">₹{totalSpent.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Orders Grid */}
      <div className="container-wide py-8 md:py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {orders.map((order, index) => (
            <div
              key={order.id || order._id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <OrderCard order={order} onOrderCancelled={() => loadOrders(true)} />
            </div>
          ))}
        </div>

        {/* Reorder Section */}
        {orders.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Want to order something new?
            </p>
            <Link
              to="/menu"
              className={cn(
                "inline-flex items-center justify-center gap-2",
                "px-6 py-3 rounded-full",
                "bg-secondary text-foreground",
                "font-medium text-sm",
                "transition-all duration-300",
                "hover:bg-foreground hover:text-background",
                "group"
              )}
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Menu
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default Orders;
