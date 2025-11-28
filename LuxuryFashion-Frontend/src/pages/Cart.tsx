import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { CartItem } from "@/components/CartItem";
import { useCartContext } from "@/contexts/CartContext";
import { toast } from "sonner";

const Cart = () => {
  const { cartItems, cartTotal, clearCart, placeOrder } = useCartContext();
  const navigate = useNavigate();

  const deliveryFee = cartTotal > 299 ? 0 : 40;
  const taxes = Math.round(cartTotal * 0.05);
  const grandTotal = cartTotal + deliveryFee + taxes;

  const handlePlaceOrder = () => {
    const orderId = placeOrder();
    if (orderId) {
      toast.success("Order placed successfully!", {
        description: `Order ID: ${orderId}`,
      });
      navigate("/orders");
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added anything to your cart yet.
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Your Cart
          </h1>
          <p className="text-muted-foreground">
            {cartItems.length} item(s) in cart
          </p>
        </div>
        <button
          onClick={() => {
            clearCart();
            toast.info("Cart cleared");
          }}
          className="flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors duration-300"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, index) => (
            <div
              key={item.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CartItem item={item} />
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
            <h2 className="text-xl font-display font-semibold text-foreground mb-6">
              Bill Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes (5%)</span>
                <span>₹{taxes}</span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-sm text-accent">
                  Add ₹{299 - cartTotal} more for free delivery!
                </p>
              )}
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-foreground">
                    Grand Total
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mt-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  className="flex-1 px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
                />
                <button className="px-4 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors duration-300">
                  Apply
                </button>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handlePlaceOrder}
              className="w-full mt-6 btn-primary flex items-center justify-center gap-2"
            >
              Place Order
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-sm text-muted-foreground text-center mt-4">
              🛡️ Secure checkout • 🚚 Fast delivery
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
