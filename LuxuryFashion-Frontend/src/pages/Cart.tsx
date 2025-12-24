import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  Check,
  X,
  MapPin,
  Phone,
  Tag,
  Truck,
  ChevronDown,
  Navigation
} from "lucide-react";
import { CartItem } from "@/components/CartItem";
import { useCartContext } from "@/contexts/CartContext";
import { useState, useEffect, useMemo } from "react";
import { validateCoupon, fetchSettings } from "@/lib/api";
import { reverseGeocode } from "@/lib/geocode";
import { MapPicker } from "@/components/MapPicker";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   KOLKATA KITCHEN — CART PAGE
   Simple, warm checkout experience
═══════════════════════════════════════════════════════════════════════════ */

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
  lat?: number;
  lng?: number;
}

const Cart = () => {
  const { cartItems, clearCart, placeOrder, loading: cartLoading, loadCart } = useCartContext();
  const navigate = useNavigate();

  // Deduplicate cart items by dish ID
  const uniqueCartItems = useMemo(() => {
    const itemMap = new Map<string, typeof cartItems[0]>();
    cartItems.forEach((item) => {
      let dishIdStr: string;
      if (item.dish?._id) {
        dishIdStr = typeof item.dish._id === 'string' ? item.dish._id : item.dish._id.toString();
      } else if (item.dish?.id) {
        dishIdStr = typeof item.dish.id === 'string' ? item.dish.id : item.dish.id.toString();
      } else if (item.dish) {
        dishIdStr = typeof item.dish === 'string' ? item.dish : item.dish.toString();
      } else {
        dishIdStr = item.id || `item-${Math.random()}`;
      }

      if (itemMap.has(dishIdStr)) {
        const existing = itemMap.get(dishIdStr)!;
        itemMap.set(dishIdStr, { ...existing, quantity: existing.quantity + item.quantity });
      } else {
        itemMap.set(dishIdStr, { ...item });
      }
    });
    return Array.from(itemMap.values());
  }, [cartItems]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

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
  const [settings, setSettings] = useState<{ lat?: number; lng?: number }>({});
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Calculate totals
  const uniqueCartTotal = useMemo(() => {
    return uniqueCartItems.reduce((sum, item) => {
      const price = item.dish?.price || item.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [uniqueCartItems]);

  const deliveryFee = uniqueCartTotal > 299 ? 0 : 40;
  const taxes = Math.round(uniqueCartTotal * 0.05);
  const discount = appliedCoupon?.valid ? (appliedCoupon.discount || 0) : 0;
  const grandTotal = uniqueCartTotal + deliveryFee + taxes - discount;
  const freeDeliveryProgress = Math.min((uniqueCartTotal / 299) * 100, 100);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchSettings();
        setSettings({ lat: data.lat, lng: data.lng });
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (address.lat && address.lng && settings.lat && settings.lng) {
      const dist = haversine(settings.lat, settings.lng, address.lat, address.lng);
      setDistanceKm(dist);
    }
  }, [address.lat, address.lng, settings.lat, settings.lng]);

  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setAddress((prev) => ({ ...prev, lat, lng }));
        try {
          const geo = await reverseGeocode(lat, lng);
          setAddress((prev) => ({ ...prev, ...geo, lat, lng }));
        } catch { /* ignore */ }
      },
      () => console.error("Unable to get location"),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const result = await validateCoupon(couponCode.trim(), uniqueCartTotal);
      if (result.valid) {
        setAppliedCoupon(result);
      } else {
        setAppliedCoupon(null);
      }
    } catch (error: any) {
      setAppliedCoupon(null);
      console.error("Failed to validate coupon:", error);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
  };

  const handlePlaceOrder = async () => {
    if (!address.street.trim() || !address.city.trim() || !address.state.trim() ||
        !address.zipCode.trim() || !address.phoneNumber.trim()) {
      setShowAddressForm(true);
      return;
    }
    if (!address.lat || !address.lng) {
      setShowAddressForm(true);
      return;
    }

    let finalCouponCode: string | undefined;
    if (appliedCoupon?.valid && couponCode.trim()) {
      try {
        const revalidation = await validateCoupon(couponCode.trim(), uniqueCartTotal);
        if (!revalidation.valid) {
          setAppliedCoupon(null);
          return;
        }
        finalCouponCode = couponCode.trim();
      } catch {
        setAppliedCoupon(null);
        return;
      }
    }

    setIsPlacingOrder(true);
    const orderType = distanceKm !== null && distanceKm > 5 ? "takeaway" : "delivery";

    try {
      const orderId = await placeOrder(
        { ...address },
        address.phoneNumber,
        finalCouponCode,
        orderType
      );
      if (orderId) {
        navigate("/order-confirmation", { state: { orderId, orderType, address } });
      }
    } catch (error: any) {
      console.error("Failed to place order:", error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error: any) {
      console.error("Failed to clear cart:", error);
    }
  };

  // Loading State
  if (cartLoading && cartItems.length === 0) {
    return (
      <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your cart...</p>
        </div>
      </main>
    );
  }

  // Empty Cart
  if (cartItems.length === 0) {
    return (
      <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-cream flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-terracotta" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground mb-6">
            Add some delicious dishes from our menu to get started.
          </p>
          <Link to="/menu" className="btn-primary">
            Browse Menu
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-cream/50 border-b border-border/50">
        <div className="container-wide py-6 md:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Your Cart
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {uniqueCartItems.length} {uniqueCartItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            <button
              onClick={handleClearCart}
              disabled={cartLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container-wide py-6 md:py-8">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-3 space-y-3">
            {uniqueCartItems.map((item, index) => (
              <div
                key={item.id || `${item.dish?._id || item.dish?.id || index}`}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <CartItem item={item} />
              </div>
            ))}

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-sm text-terracotta hover:text-terracotta-dark transition-colors mt-4"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Add more items
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-border/50 p-5 md:p-6 sticky top-24 shadow-soft">
              <h2 className="text-lg font-bold text-foreground mb-5">
                Order Summary
              </h2>

              {/* Free Delivery Progress */}
              {deliveryFee > 0 && (
                <div className="mb-5 p-3 bg-mustard/10 rounded-lg">
                  <p className="text-sm text-foreground mb-2">
                    Add ₹{(299 - uniqueCartTotal).toFixed(0)} more for free delivery
                  </p>
                  <div className="h-1.5 bg-mustard/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-mustard transition-all duration-500 rounded-full"
                      style={{ width: `${freeDeliveryProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 pb-4 border-b border-border/50 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{uniqueCartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> Delivery
                  </span>
                  <span className={cn("font-medium", deliveryFee === 0 && "text-bengali-green")}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes (5%)</span>
                  <span className="font-medium">₹{taxes.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-bengali-green">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Discount
                    </span>
                    <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between py-4 border-b border-border/50">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-foreground">₹{grandTotal.toFixed(2)}</span>
              </div>

              {/* Coupon */}
              <div className="py-4 border-b border-border/50">
                {appliedCoupon?.valid ? (
                  <div className="flex items-center justify-between p-3 bg-bengali-green/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-bengali-green" />
                      <span className="font-medium text-bengali-green">
                        {appliedCoupon.coupon?.code} applied
                      </span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="p-1 hover:bg-bengali-green/20 rounded">
                      <X className="w-4 h-4 text-bengali-green" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => setShowCouponInput(!showCouponInput)}
                      className="flex items-center justify-between w-full text-left text-sm"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <Tag className="w-4 h-4 text-terracotta" />
                        Have a coupon?
                      </span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", showCouponInput && "rotate-180")} />
                    </button>
                    <div className={cn(
                      "overflow-hidden transition-all",
                      showCouponInput ? "max-h-16 mt-3" : "max-h-0"
                    )}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                          className="flex-1 px-3 py-2 bg-cream border border-border/50 rounded-lg text-sm focus:outline-none focus:border-terracotta/50"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={isValidatingCoupon}
                          className="px-4 py-2 bg-terracotta text-white text-sm font-medium rounded-lg hover:bg-terracotta-dark transition-colors disabled:opacity-50"
                        >
                          {isValidatingCoupon ? "..." : "Apply"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="py-4">
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="flex items-center justify-between w-full text-left text-sm"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-terracotta" />
                    {address.street ? "Delivery Address" : "Add Address"}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", showAddressForm && "rotate-180")} />
                </button>

                <div className={cn(
                  "overflow-hidden transition-all",
                  showAddressForm ? "max-h-[600px] mt-4" : "max-h-0"
                )}>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={useMyLocation}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-terracotta/10 text-terracotta text-sm font-medium rounded-lg hover:bg-terracotta/20 transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      Use My Location
                    </button>

                    {distanceKm !== null && (
                      <div className={cn(
                        "p-2.5 rounded-lg text-xs",
                        distanceKm > 5
                          ? "bg-mustard/20 text-mustard-dark"
                          : "bg-bengali-green/10 text-bengali-green"
                      )}>
                        {distanceKm > 5 ? `Takeaway only (${distanceKm.toFixed(1)} km)` : `Delivery available (${distanceKm.toFixed(1)} km)`}
                      </div>
                    )}

                    <input
                      type="text"
                      placeholder="Street Address"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="input-field"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="input-field"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Zip Code"
                        value={address.zipCode}
                        onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                        className="input-field"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={address.phoneNumber}
                        onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
                        className="input-field pl-10"
                      />
                    </div>

                    <div className="rounded-lg overflow-hidden border border-border/50">
                      <MapPicker
                        lat={address.lat || settings.lat || 22.5726}
                        lng={address.lng || settings.lng || 88.3639}
                        onChange={async (lat, lng) => {
                          setAddress((prev) => ({ ...prev, lat, lng }));
                          try {
                            const geo = await reverseGeocode(lat, lng);
                            setAddress((prev) => ({ ...prev, ...geo, lat, lng }));
                          } catch { /* ignore */ }
                        }}
                        height="160px"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={showAddressForm ? handlePlaceOrder : () => setShowAddressForm(true)}
                disabled={isPlacingOrder || cartLoading}
                className="w-full btn-primary justify-center mt-4"
              >
                {isPlacingOrder ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {showAddressForm ? "Place Order" : "Proceed to Checkout"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Secure checkout • Fast delivery
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
