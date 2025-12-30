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
  Navigation,
  Clock,
  LogIn,
  MessageSquare
} from "lucide-react";
import { CartItem } from "@/components/CartItem";
import { useCartContext } from "@/contexts/CartContext";
import { useState, useEffect, useMemo, useRef } from "react";
import { validateCoupon, fetchSettings, getActiveCoupons, checkRestaurantOpen } from "@/lib/api";
import { reverseGeocode } from "@/lib/geocode";
import { getAccurateLocation } from "@/lib/geolocation";
import { MapPicker } from "@/components/MapPicker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const { cartItems, clearCart, placeOrder, loading: cartLoading, loadCart, isLoggedIn } = useCartContext();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const isPlacingOrderRef = useRef(false); // Prevent double submission

  // Deduplicate cart items by dish ID
  const uniqueCartItems = useMemo(() => {
    const itemMap = new Map<string, typeof cartItems[0]>();
    cartItems.forEach((item, index) => {
      let dishIdStr: string;
      if (item.dish?._id) {
        dishIdStr = typeof item.dish._id === 'string' ? item.dish._id : item.dish._id.toString();
      } else if (item.dish?.id) {
        dishIdStr = typeof item.dish.id === 'string' ? item.dish.id : item.dish.id.toString();
      } else if (item.dish) {
        dishIdStr = typeof item.dish === 'string' ? item.dish : item.dish.toString();
      } else {
        dishIdStr = item.id || `item-${index}-${Date.now()}`;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [address, setAddress] = useState<AddressForm>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phoneNumber: "",
  });
  const [settings, setSettings] = useState<{ lat?: number; lng?: number; isDeliveryEnabled?: boolean; deliveryFee?: number }>({});
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [restaurantStatus, setRestaurantStatus] = useState<{ isOpen: boolean; openingTime: string; closingTime: string; isManuallyClosed?: boolean; closureReason?: string } | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Calculate totals
  const uniqueCartTotal = useMemo(() => {
    return uniqueCartItems.reduce((sum, item) => {
      const price = item.dish?.price || item.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [uniqueCartItems]);

  // Determine if order will be takeaway (delivery disabled or distance > 5km)
  const isTakeawayOnly = !settings.isDeliveryEnabled || (distanceKm !== null && distanceKm > 5);

  // Use admin-configured delivery fee, no fee for takeaway orders
  const adminDeliveryFee = settings.deliveryFee ?? 40;
  const deliveryFee = isTakeawayOnly ? 0 : adminDeliveryFee;
  const discount = appliedCoupon?.valid ? (appliedCoupon.discount || 0) : 0;
  const grandTotal = uniqueCartTotal + deliveryFee - discount;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [settingsData, openStatus] = await Promise.all([
          fetchSettings(),
          checkRestaurantOpen(),
        ]);
        setSettings({
          lat: settingsData.lat,
          lng: settingsData.lng,
          isDeliveryEnabled: settingsData.isDeliveryEnabled ?? true,
          deliveryFee: settingsData.deliveryFee ?? 40,
        });
        setRestaurantStatus(openStatus);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };

    loadSettings();

    // Refresh settings every 60 seconds to catch admin changes
    const interval = setInterval(loadSettings, 60000);
    return () => clearInterval(interval);
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

  const useMyLocation = async () => {
    setIsGettingLocation(true);
    toast.info("Getting your precise location...", { duration: 2000 });

    try {
      const location = await getAccurateLocation({
        enableHighAccuracy: true,
        timeout: 30000, // 30 seconds total
        maximumAge: 0, // Always fresh
        desiredAccuracy: 20, // Target 20m accuracy (Google Maps level)
        maxWaitTime: 15000, // Wait up to 15 seconds for best accuracy
      });

      const { latitude, longitude, accuracy } = location;

      // Update address with coordinates
      setAddress((prev) => ({ ...prev, lat: latitude, lng: longitude }));

      // Show accuracy info
      const accuracyText = accuracy <= 10 ? "Excellent" : accuracy <= 20 ? "Very accurate" : accuracy <= 50 ? "Good" : "Approximate";
      toast.success(`${accuracyText} location found (±${Math.round(accuracy)}m)`);

      // Reverse geocode to get address
      try {
        const geo = await reverseGeocode(latitude, longitude);
        setAddress((prev) => ({ ...prev, ...geo, lat: latitude, lng: longitude }));
      } catch (err) {
        console.error("Failed to reverse geocode:", err);
        toast.warning("Location set, but address details couldn't be fetched automatically");
      }
    } catch (err: any) {
      console.error("Geolocation error:", err);
      toast.error(err.message || "Unable to get your location. Please allow location access or select on map.");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const loadActiveCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const coupons = await getActiveCoupons();
      setActiveCoupons(Array.isArray(coupons) ? coupons : []);
    } catch (err) {
      console.error("Failed to load active coupons:", err);
      setActiveCoupons([]);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    if (showCouponInput) {
      loadActiveCoupons();
    }
  }, [showCouponInput]);

  const handleApplyCoupon = async (code?: string) => {
    const codeToApply = code || couponCode.trim();
    if (!codeToApply) return;
    
    setIsValidatingCoupon(true);
    try {
      const result = await validateCoupon(codeToApply, uniqueCartTotal);
      if (result.valid) {
        setAppliedCoupon(result);
        setCouponCode(codeToApply);
        toast.success(`Coupon ${codeToApply} applied successfully!`);
      } else {
        setAppliedCoupon(null);
        toast.error(result.message || "Invalid coupon code");
      }
    } catch (error: any) {
      setAppliedCoupon(null);
      const errorMsg = error.message || error.response?.data?.message || "Failed to apply coupon";
      toast.error(errorMsg);
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
    // Prevent double submission
    if (isPlacingOrderRef.current) {
      return;
    }

    // Check if user is logged in
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    if (!address.street.trim() || !address.city.trim() || !address.state.trim() ||
        !address.zipCode.trim() || !address.phoneNumber.trim()) {
      setShowAddressForm(true);
      return;
    }

    // Validate phone number format (10 digits for India)
    const phoneDigits = address.phoneNumber.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
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

    isPlacingOrderRef.current = true;
    setIsPlacingOrder(true);
    // Determine order type based on delivery availability and distance
    const orderType = isTakeawayOnly ? "takeaway" : "delivery";

    try {
      const orderId = await placeOrder(
        { ...address },
        address.phoneNumber,
        finalCouponCode,
        orderType,
        specialInstructions.trim() || undefined
      );
      if (orderId) {
        navigate("/order-confirmation", { state: { orderId, orderType, address } });
      }
    } catch (error: any) {
      console.error("Failed to place order:", error);
      if (error.message === "LOGIN_REQUIRED") {
        setShowLoginPrompt(true);
      } else {
        toast.error(error.message || "Failed to place order");
      }
    } finally {
      isPlacingOrderRef.current = false;
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

              {/* Restaurant Closed Notice */}
              {restaurantStatus && !restaurantStatus.isOpen && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-medium text-red-700">
                      {restaurantStatus.isManuallyClosed ? "We're Temporarily Closed" : "We're Currently Closed"}
                    </p>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    {restaurantStatus.isManuallyClosed
                      ? (restaurantStatus.closureReason || "We are temporarily closed. Please check back later.")
                      : `Our operating hours are ${restaurantStatus.openingTime} - ${restaurantStatus.closingTime}. Please come back during business hours.`
                    }
                  </p>
                </div>
              )}

              {/* Delivery Status Notice */}
              {restaurantStatus?.isOpen && settings.isDeliveryEnabled === false && (
                <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <p className="text-sm font-medium text-amber-700">
                      Takeaway Only
                    </p>
                  </div>
                  <p className="text-xs text-amber-600 mt-1">
                    Delivery is currently unavailable. Your order will be prepared for pickup.
                  </p>
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
                    {isTakeawayOnly ? (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" /> Takeaway
                      </>
                    ) : (
                      <>
                        <Truck className="w-3.5 h-3.5" /> Delivery
                      </>
                    )}
                  </span>
                  <span className={cn("font-medium", isTakeawayOnly ? "text-bengali-green" : "")}>
                    {isTakeawayOnly ? "FREE" : `₹${deliveryFee}`}
                  </span>
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
                      showCouponInput ? "max-h-[500px] mt-3" : "max-h-0"
                    )}>
                      <div className="space-y-3">
                        {/* Active Coupons List */}
                        {loadingCoupons ? (
                          <div className="text-center py-4">
                            <div className="w-5 h-5 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin mx-auto"></div>
                            <p className="text-xs text-muted-foreground mt-2">Loading coupons...</p>
                          </div>
                        ) : activeCoupons.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Available Coupons:</p>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {activeCoupons.map((coupon) => {
                                const isEligible = !coupon.minOrderAmount || uniqueCartTotal >= coupon.minOrderAmount;
                                const discountText = coupon.discountType === 'percentage'
                                  ? `${coupon.discountValue}% OFF`
                                  : `₹${coupon.discountValue} OFF`;

                                return (
                                  <div
                                    key={coupon._id || coupon.code}
                                    className={cn(
                                      "p-3 rounded-lg border transition-all",
                                      isEligible
                                        ? "border-terracotta/30 bg-terracotta/5"
                                        : "border-border/30 bg-secondary/30 opacity-60"
                                    )}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-mono font-bold text-terracotta">{coupon.code}</span>
                                          <span className="text-xs font-semibold text-bengali-green bg-bengali-green/10 px-2 py-0.5 rounded">
                                            {discountText}
                                          </span>
                                        </div>
                                        {coupon.description && (
                                          <p className="text-xs text-muted-foreground mb-1">{coupon.description}</p>
                                        )}
                                        {coupon.minOrderAmount && (
                                          <p className="text-xs text-muted-foreground">
                                            Min. order: ₹{coupon.minOrderAmount}
                                            {!isEligible && (
                                              <span className="text-amber-600 ml-1">
                                                (Add ₹{(coupon.minOrderAmount - uniqueCartTotal).toFixed(0)} more)
                                              </span>
                                            )}
                                          </p>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => handleApplyCoupon(coupon.code)}
                                        disabled={!isEligible || isValidatingCoupon}
                                        className={cn(
                                          "px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex-shrink-0",
                                          isEligible
                                            ? "bg-terracotta text-white hover:bg-terracotta-dark"
                                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        )}
                                      >
                                        {isValidatingCoupon ? "..." : "Apply"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-2">No active coupons available</p>
                        )}

                        {/* Manual Code Input */}
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Or enter coupon code:</p>
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
                              onClick={() => handleApplyCoupon()}
                              disabled={isValidatingCoupon || !couponCode.trim()}
                              className="px-4 py-2 bg-terracotta text-white text-sm font-medium rounded-lg hover:bg-terracotta-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isValidatingCoupon ? "..." : "Apply"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div className="py-4 border-b border-border/50">
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <MessageSquare className="w-4 h-4 text-terracotta" />
                  Special Cooking Request
                </label>
                <textarea
                  placeholder="E.g., Less spicy, no onions, extra sauce..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  maxLength={200}
                  rows={2}
                  className="w-full px-3 py-2 bg-cream border border-border/50 rounded-lg text-sm focus:outline-none focus:border-terracotta/50 resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {specialInstructions.length}/200
                </p>
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
                      disabled={isGettingLocation}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-terracotta/10 text-terracotta text-sm font-medium rounded-lg hover:bg-terracotta/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Navigation className={`w-4 h-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
                      {isGettingLocation ? "Getting Location..." : "Use My Location"}
                    </button>

                    {settings.isDeliveryEnabled === false ? (
                      <div className="p-2.5 rounded-lg text-xs bg-amber-100 text-amber-700">
                        Delivery is currently disabled. Order will be prepared for pickup.
                      </div>
                    ) : distanceKm !== null && (
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
                onClick={showAddressForm ? handlePlaceOrder : () => {
                  if (!isLoggedIn) {
                    setShowLoginPrompt(true);
                  } else {
                    setShowAddressForm(true);
                  }
                }}
                disabled={isPlacingOrder || cartLoading || (restaurantStatus && !restaurantStatus.isOpen)}
                className="w-full btn-primary justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : restaurantStatus && !restaurantStatus.isOpen ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Restaurant Closed
                  </>
                ) : !isLoggedIn ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    Login to Checkout
                  </>
                ) : (
                  <>
                    {showAddressForm ? "Place Order" : "Proceed to Checkout"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                {restaurantStatus && !restaurantStatus.isOpen
                  ? (restaurantStatus.isManuallyClosed ? "Check back soon!" : `Opens at ${restaurantStatus.openingTime}`)
                  : `Secure checkout • ${isTakeawayOnly ? "Ready for pickup" : "Fast delivery"}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Required Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-fade-in-up">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-terracotta/10 flex items-center justify-center">
                <LogIn className="w-8 h-8 text-terracotta" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Login Required
              </h2>
              <p className="text-muted-foreground mb-6">
                Please log in or create an account to place your order. Your cart items will be saved!
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  state={{ from: "/cart" }}
                  className="btn-primary justify-center"
                >
                  <LogIn className="w-4 h-4" />
                  Login to Continue
                </Link>
                <Link
                  to="/register"
                  state={{ from: "/cart" }}
                  className="btn-secondary justify-center"
                >
                  Create Account
                </Link>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Cart;
