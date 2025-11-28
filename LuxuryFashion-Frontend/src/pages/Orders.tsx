import { Link } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";
import { OrderCard } from "@/components/OrderCard";
import { useCartContext } from "@/contexts/CartContext";

const Orders = () => {
  const { orders } = useCartContext();

  if (orders.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            No orders yet
          </h1>
          <p className="text-muted-foreground mb-8">
            You haven't placed any orders yet. Start exploring our delicious
            menu!
          </p>
          <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
            Browse Menu
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Your Orders
        </h1>
        <p className="text-muted-foreground">
          Track and manage your food orders
        </p>
      </div>

      {/* Orders List */}
      <div className="grid gap-6 md:grid-cols-2">
        {orders.map((order, index) => (
          <div
            key={order.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <OrderCard order={order} />
          </div>
        ))}
      </div>
    </main>
  );
};

export default Orders;
