import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight, Trash2, Check, X, MapPin, Phone } from "lucide-react";
import { CartItem } from "@/components/CartItem";
import { useCartContext } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useState } from "react";
import { validateCoupon } from "@/lib/api";

interface CouponResult {
  valid: boolean;
  coupon?: any;
  discount?: number;
  discountFormatted?: string;
  finalAmount?: number;
  finalAmountFormatted?: string;
  message?: string;
}

interface AddressForm {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
}

const Cart = () => {
  const { cartItems, cartTotal, clearCart, placeOrder, loading: cartLoading } = useCartContext();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [address, setAddress] = useState<AddressForm>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phoneNumber: "",
  });

  const deliveryFee = cartTotal > 299 ? 0 : 40;
  const taxes = Math.round(cartTotal * 0.05);
  const subtotal = cartTotal + deliveryFee + taxes;
  const discount = appliedCoupon?.valid ? (appliedCoupon.discount || 0) : 0;
  const grandTotal = subtotal - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const result = await validateCoupon(couponCode.trim(), subtotal);
      if (result.valid) {
        setAppliedCoupon(result);
        toast.success(result.message || "Coupon applied successfully!", {
          description: `You saved ${result.discountFormatted || `₹${result.discount}`}`,
        });
      } else {
        setAppliedCoupon(null);
        toast.error(result.message || "Invalid coupon code");
      }
    } catch (error: any) {
      setAppliedCoupon(null);
      const errorMessage = error.message || "Failed to validate coupon";
      toast.error(errorMessage.includes("Invalid") ? errorMessage : "Invalid coupon code");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  const handlePlaceOrder = async () => {
    // Validate address
    if (!address.street.trim() || !address.city.trim() || !address.state.trim() || 
        !address.zipCode.trim() || !address.phoneNumber.trim()) {
      toast.error("Please fill in all address fields");
      setShowAddressForm(true);
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderId = await placeOrder(
        {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
          phoneNumber: address.phoneNumber,
        },
        address.phoneNumber,
        appliedCoupon?.valid ? couponCode.trim() : undefined
      );
      
      if (orderId) {
        toast.success("Order placed successfully!", {
          description: `Order ID: ${orderId}`,
        });
        navigate("/orders");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.info("Cart cleared");
    } catch (error: any) {
      toast.error(error.message || "Failed to clear cart");
    }
  };

  if (cartLoading && cartItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading cart...</p>
      </main>
    );
  }

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
    <main className="container mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Your Cart
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
          </p>
        </div>
        <button
          onClick={handleClearCart}
          disabled={cartLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm md:text-base text-destructive hover:bg-destructive/10 rounded-xl transition-colors duration-300 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
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
          <div className="bg-card rounded-2xl border border-border p-5 md:p-6 sticky top-20 md:top-24">
            <h2 className="text-lg md:text-xl font-display font-semibold text-foreground mb-5 md:mb-6">
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
              {appliedCoupon?.valid && discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Discount ({appliedCoupon.coupon?.code})
                  </span>
                  <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                </div>
              )}
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
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="mt-6">
              {appliedCoupon?.valid ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        {appliedCoupon.coupon?.code}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        {appliedCoupon.discountFormatted} off
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-1 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                    aria-label="Remove coupon"
                  >
                    <X className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                    disabled={isValidatingCoupon}
                    className="flex-1 px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCode.trim()}
                    className="px-4 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidatingCoupon ? "..." : "Apply"}
                  </button>
                </div>
              )}
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <div className="mt-6 p-4 md:p-5 bg-secondary/50 rounded-xl border border-border space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-sm md:text-base text-foreground">Delivery Address</h3>
                </div>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    className="px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    className="px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={address.phoneNumber}
                    onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
                    className="flex-1 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={showAddressForm ? handlePlaceOrder : () => setShowAddressForm(true)}
              disabled={isPlacingOrder || cartLoading}
              className="w-full mt-6 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? (
                "Placing Order..."
              ) : showAddressForm ? (
                <>
                  Place Order
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
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
