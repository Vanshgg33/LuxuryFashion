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
  MessageSquare,
  Gift
} from "lucide-react";
import { CartItem } from "@/components/CartItem";
import { useCartContext } from "@/contexts/CartContext";
import { useState, useEffect, useMemo, useRef } from "react";
import { validateCoupon, fetchSettings, getActiveCoupons, checkRestaurantOpen, fetchProfile, updateProfile, getAddresses, createAddress, fetchOrderHistory } from "@/lib/api";
import { reverseGeocode } from "@/lib/geocode";
import { getAccurateLocation } from "@/lib/geolocation";
import { MapPicker } from "@/components/MapPicker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════════════════════════════
   KOLKATA KITCHEN — CART PAGE
   Simple, warm checkout experience
═══════════════════════════════════════════════════════════════════════════ */

interface FreeItemInfo {
  dish: {
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
}

interface CouponInfo {
  id?: string;
  code: string;
  discountType: string;
  discountValue: number;
}

interface CouponResult {
  valid: boolean;
  coupon?: CouponInfo;
  discount?: number;
  discountFormatted?: string;
  finalAmount?: number;
  finalAmountFormatted?: string;
  freeItems?: FreeItemInfo[];
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

interface ActiveCoupon {
  _id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  description?: string;
  freeItems?: Array<{
    quantity: number;
    dish?: { _id: string; name: string; price: number; imageUrl?: string };
  }>;
}

const Cart = () => {
  const { cartItems, clearCart, placeOrder, loading: cartLoading, loadCart, isLoggedIn, addFreeItems, removeFreeItems } = useCartContext();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const isPlacingOrderRef = useRef(false); // Prevent double submission

  // Deduplicate cart items by dish ID + isFreeItem status and recalculate totals
  // Free items from coupons should be displayed separately from paid items
  const uniqueCartItems = useMemo(() => {
    const itemMap = new Map<string, typeof cartItems[0]>();
    cartItems.forEach((item, index) => {
      // Get dish ID - use _id from dish object, or fall back to item.id
      const dishIdStr = item.dish?._id || item.id || `item-${index}-${Date.now()}`;

      // Create a unique key that includes dish ID and whether it's a free item
      // This ensures free items from coupons are kept separate from paid items
      const isFreeItem = item.isFreeItem || false;
      const uniqueKey = `${dishIdStr}-${isFreeItem ? 'free' : 'paid'}`;

      if (itemMap.has(uniqueKey)) {
        const existing = itemMap.get(uniqueKey)!;
        const newQuantity = existing.quantity + item.quantity;
        const price = isFreeItem ? 0 : (existing.dish?.price || existing.price || 0);
        // Recalculate itemTotal with BOGO discount if applicable (only for paid items)
        const isBogo = existing.dish?.isBuyOneGetOne;
        const newItemTotal = isFreeItem ? 0 : (isBogo && newQuantity > 0
          ? price * Math.ceil(newQuantity / 2)
          : price * newQuantity);
        itemMap.set(uniqueKey, { ...existing, quantity: newQuantity, itemTotal: newItemTotal });
      } else {
        // For new items, calculate itemTotal if not present
        const price = isFreeItem ? 0 : (item.dish?.price || item.price || 0);
        const isBogo = item.dish?.isBuyOneGetOne;
        const itemTotal = isFreeItem ? 0 : (item.itemTotal !== undefined
          ? item.itemTotal
          : (isBogo && item.quantity > 0
              ? price * Math.ceil(item.quantity / 2)
              : price * item.quantity));
        itemMap.set(uniqueKey, { ...item, itemTotal });
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
  const [settings, setSettings] = useState<{ lat?: number; lng?: number; isDeliveryEnabled?: boolean; deliveryFee?: number; minOrderValue?: number }>({});
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState<ActiveCoupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [restaurantStatus, setRestaurantStatus] = useState<{ isOpen: boolean; openingTime: string; closingTime: string; isManuallyClosed?: boolean; closureReason?: string } | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [userPreferredOrderType, setUserPreferredOrderType] = useState<"delivery" | "takeaway">("delivery");

  // Phone number validation helper
  const phoneValidation = useMemo(() => {
    const phone = address.phoneNumber;
    if (!phone) return { isValid: false, message: "" };
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 0) return { isValid: false, message: "" };
    if (digits.length < 10) return { isValid: false, message: `${10 - digits.length} more digits needed` };
    if (digits.length > 10) return { isValid: false, message: "Too many digits" };
    return { isValid: true, message: "Valid phone number" };
  }, [address.phoneNumber]);

  // Address completeness check
  const addressValidation = useMemo(() => {
    const missing: string[] = [];
    if (!address.street.trim()) missing.push("street");
    if (!address.city.trim()) missing.push("city");
    if (!address.state.trim()) missing.push("state");
    if (!address.zipCode.trim()) missing.push("zip code");
    if (!address.lat || !address.lng) missing.push("location on map");
    if (!phoneValidation.isValid && address.phoneNumber) missing.push("valid phone");
    return {
      isComplete: missing.length === 0 && phoneValidation.isValid,
      missing
    };
  }, [address, phoneValidation]);

  // Calculate totals - use itemTotal from backend (includes BOGO discount)
  // Free items from coupons should not be counted in the total
  const uniqueCartTotal = useMemo(() => {
    return uniqueCartItems.reduce((sum, item) => {
      // Free items don't contribute to the total
      if (item.isFreeItem) {
        return sum;
      }
      // Use itemTotal if available (includes BOGO discount), otherwise calculate
      if (item.itemTotal !== undefined) {
        return sum + item.itemTotal;
      }
      // Fallback: Calculate with BOGO discount if applicable
      const price = item.dish?.price || item.price || 0;
      const quantity = item.quantity || 0;
      if (item.dish?.isBuyOneGetOne && quantity > 0) {
        const chargeableQuantity = Math.ceil(quantity / 2);
        return sum + price * chargeableQuantity;
      }
      return sum + price * quantity;
    }, 0);
  }, [uniqueCartItems]);

  // Determine if delivery is available (delivery enabled AND distance <= 2km)
  const isDeliveryAvailable = settings.isDeliveryEnabled && (distanceKm === null || distanceKm <= 2);

  // Final order type based on availability and user preference
  const finalOrderType = !isDeliveryAvailable ? "takeaway" : userPreferredOrderType;
  const isTakeawayOnly = finalOrderType === "takeaway";

  // Use admin-configured delivery fee, no fee for takeaway orders
  const adminDeliveryFee = settings.deliveryFee ?? 40;
  const deliveryFee = isTakeawayOnly ? 0 : adminDeliveryFee;

  // Estimated time based on order type
  const estimatedTime = isTakeawayOnly ? "15-20 min" : "30-60 min";
  const discount = appliedCoupon?.valid ? (appliedCoupon.discount || 0) : 0;
  const grandTotal = uniqueCartTotal + deliveryFee - discount;

  // Minimum order validation
  const minOrderValue = settings.minOrderValue || 0;
  const isMinOrderMet = minOrderValue === 0 || uniqueCartTotal >= minOrderValue;
  const amountNeededForMinOrder = minOrderValue > 0 ? minOrderValue - uniqueCartTotal : 0;

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
          minOrderValue: settingsData.minOrderValue ?? 0,
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

  // Load saved address from user's saved addresses or profile
  useEffect(() => {
    const loadSavedAddress = async () => {
      if (!isLoggedIn) return;

      // Profile type from API
      interface UserProfile {
        _id?: string;
        name?: string;
        email?: string;
        phoneNumber?: string;
        phone?: string;
        address?: {
          street?: string;
          city?: string;
          state?: string;
          zipCode?: string;
          country?: string;
          phoneNumber?: string;
          lat?: number;
          lng?: number;
        };
      }

      let profile: UserProfile | null = null;
      let profilePhone = "";

      // Step 1: Get profile (for phone fallback and address fallback)
      try {
        profile = await fetchProfile();
        // Handle both old 'phone' and new 'phoneNumber' field names
        profilePhone = profile?.phoneNumber || profile?.phone || "";
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }

      // Step 2: Try addresses collection first
      try {
        const savedAddresses = await getAddresses();
        if (savedAddresses && savedAddresses.length > 0) {
          // Address type from API
          interface SavedAddress {
            _id?: string;
            id?: string;
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
            phoneNumber?: string;
            lat?: number;
            lng?: number;
            isDefault?: boolean;
          }
          const defaultAddr = savedAddresses.find((addr: SavedAddress) => addr.isDefault) || savedAddresses[0];
          setAddress({
            street: defaultAddr.street || "",
            city: defaultAddr.city || "",
            state: defaultAddr.state || "",
            zipCode: defaultAddr.zipCode || "",
            country: defaultAddr.country || "India",
            phoneNumber: defaultAddr.phoneNumber || profilePhone,
            lat: defaultAddr.lat,
            lng: defaultAddr.lng,
          });
          if (defaultAddr.street && defaultAddr.city) {
            setShowAddressForm(true);
          }
          return; // Found address, done
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      }

      // Step 3: Fallback to profile.address
      if (profile?.address && profile.address.street) {
        const savedAddr = profile.address;
        setAddress({
          street: savedAddr.street || "",
          city: savedAddr.city || "",
          state: savedAddr.state || "",
          zipCode: savedAddr.zipCode || "",
          country: savedAddr.country || "India",
          phoneNumber: savedAddr.phoneNumber || profilePhone,
          lat: savedAddr.lat,
          lng: savedAddr.lng,
        });
        if (savedAddr.street && savedAddr.city) {
          setShowAddressForm(true);
        }
        return; // Found address, done
      }

      // Step 4: Last resort - try to get address from order history
      try {
        const orders = await fetchOrderHistory();
        if (orders && orders.length > 0) {
          // Get the most recent order with an address
          // Order type from API
          interface OrderWithAddress {
            address?: {
              street?: string;
              city?: string;
              state?: string;
              zipCode?: string;
              country?: string;
              phoneNumber?: string;
              lat?: number;
              lng?: number;
            };
            phoneNumber?: string;
          }
          const recentOrder = orders.find((o: OrderWithAddress) => o.address?.street);
          if (recentOrder?.address) {
            const orderAddr = recentOrder.address;
            setAddress({
              street: orderAddr.street || "",
              city: orderAddr.city || "",
              state: orderAddr.state || "",
              zipCode: orderAddr.zipCode || "",
              country: orderAddr.country || "India",
              phoneNumber: orderAddr.phoneNumber || recentOrder.phoneNumber || profilePhone,
              lat: orderAddr.lat,
              lng: orderAddr.lng,
            });
            if (orderAddr.street && orderAddr.city) {
              setShowAddressForm(true);
            }
            // Also save this address to profile for future use
            try {
              await updateProfile({ address: orderAddr });
            } catch (e) {
              // Ignore save error
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch order history:", err);
      }
    };

    loadSavedAddress();
  }, [isLoggedIn]);

  useEffect(() => {
    if (address.lat != null && address.lng != null && settings.lat != null && settings.lng != null) {
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
    } catch (err) {
      console.error("Geolocation error:", err);
      toast.error(err instanceof Error ? err.message : "Unable to get your location. Please allow location access or select on map.");
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
        
        // Add free items to cart if any
        if (result.freeItems && result.freeItems.length > 0) {
          try {
            await addFreeItems(result.freeItems, codeToApply);
          } catch (err) {
            console.error('Failed to add free items:', err);
            toast.warning("Coupon applied but free items couldn't be added to cart. They will be included in your order.");
          }
        }
        
        // Build detailed success message
        let successMsg = `Coupon ${codeToApply} applied! You save ₹${result.discount?.toFixed(2) || 0}`;
        if (result.freeItems && result.freeItems.length > 0) {
          const freeItemNames = result.freeItems.map((item: FreeItemInfo) => item.dish.name).join(', ');
          successMsg += ` + FREE: ${freeItemNames}`;
        }
        toast.success(successMsg);
      } else {
        setAppliedCoupon(null);
        toast.error(result.message || "Invalid coupon code");
      }
    } catch (error) {
      setAppliedCoupon(null);
      const errorMsg = error instanceof Error ? error.message : "Failed to apply coupon";
      toast.error(errorMsg);
      console.error("Failed to validate coupon:", error);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    const currentCouponCode = couponCode;
    setCouponCode("");
    setAppliedCoupon(null);
    
    // Remove free items from cart
    if (currentCouponCode && isLoggedIn) {
      try {
        await removeFreeItems(currentCouponCode);
      } catch (err) {
        console.error('Failed to remove free items:', err);
      }
    }
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
          // Coupon is no longer valid - remove it and notify user
          const currentCouponCode = couponCode.trim();
          setAppliedCoupon(null);
          setCouponCode("");
          // Remove free items from cart
          if (currentCouponCode && isLoggedIn) {
            try {
              await removeFreeItems(currentCouponCode);
            } catch (err) {
              console.error('Failed to remove free items:', err);
            }
          }
          toast.error(revalidation.message || "Coupon is no longer valid. Please try again.");
          return;
        }
        finalCouponCode = couponCode.trim();
      } catch (error) {
        // Coupon validation failed - remove it and notify user
        const currentCouponCode = couponCode.trim();
        setAppliedCoupon(null);
        setCouponCode("");
        // Remove free items from cart
        if (currentCouponCode && isLoggedIn) {
          try {
            await removeFreeItems(currentCouponCode);
          } catch (err) {
            console.error('Failed to remove free items:', err);
          }
        }
        const errorMsg = error instanceof Error ? error.message : "Coupon validation failed. Please try again.";
        toast.error(errorMsg);
        return;
      }
    }

    isPlacingOrderRef.current = true;
    setIsPlacingOrder(true);
    // Use the final order type based on user preference and availability
    const orderType = finalOrderType;

    try {
      const orderId = await placeOrder(
        { ...address },
        address.phoneNumber,
        finalCouponCode,
        orderType,
        specialInstructions.trim() || undefined
      );
      if (orderId) {
        // Save address for future orders (independent try-catches so one failure doesn't block the other)

        // 1. Always save to profile first (most reliable)
        try {
          await updateProfile({ address });
        } catch (err) {
          console.error("Failed to save address to profile:", err);
        }

        // 2. Try to save to addresses collection (always save if address doesn't already exist)
        try {
          const existingAddresses = await getAddresses();
          // Check if this address already exists (match by street + city + zipCode)
          interface ExistingAddress {
            street?: string;
            city?: string;
            zipCode?: string;
          }
          const addressExists = existingAddresses?.some((addr: ExistingAddress) =>
            addr.street?.toLowerCase().trim() === address.street?.toLowerCase().trim() &&
            addr.city?.toLowerCase().trim() === address.city?.toLowerCase().trim() &&
            addr.zipCode?.trim() === address.zipCode?.trim()
          );

          if (!addressExists) {
            // Save new address and set as default
            await createAddress({
              label: "Delivery Address",
              street: address.street,
              city: address.city,
              state: address.state,
              zipCode: address.zipCode,
              country: address.country,
              phoneNumber: address.phoneNumber,
              lat: address.lat,
              lng: address.lng,
              isDefault: true, // New address used for order becomes default
            });
          }
        } catch (err) {
          console.error("Failed to save to addresses collection:", err);
        }

        navigate("/order-confirmation", { state: { orderId, orderType, address } });
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      if (error instanceof Error && error.message === "LOGIN_REQUIRED") {
        setShowLoginPrompt(true);
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to place order");
      }
    } finally {
      isPlacingOrderRef.current = false;
      setIsPlacingOrder(false);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
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
                key={item.id || `${item.dish?._id || index}`}
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

              {/* Minimum Order Value Notice */}
              {minOrderValue > 0 && !isMinOrderMet && (
                <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-600" />
                    <p className="text-sm font-medium text-amber-700">
                      Minimum Order: ₹{minOrderValue}
                    </p>
                  </div>
                  <p className="text-xs text-amber-600 mt-1">
                    Add ₹{amountNeededForMinOrder.toFixed(2)} more to place your order
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

              {/* Delivery/Takeaway Toggle */}
              {restaurantStatus?.isOpen && (
                <div className="mb-5 p-4 bg-cream rounded-xl border border-border/50">
                  <p className="text-sm font-medium text-foreground mb-3">Order Type</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUserPreferredOrderType("delivery")}
                      disabled={!isDeliveryAvailable}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                        userPreferredOrderType === "delivery" && isDeliveryAvailable
                          ? "border-terracotta bg-terracotta/10"
                          : "border-border/50 bg-white",
                        !isDeliveryAvailable && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Truck className={cn(
                        "w-5 h-5",
                        userPreferredOrderType === "delivery" && isDeliveryAvailable ? "text-terracotta" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        userPreferredOrderType === "delivery" && isDeliveryAvailable ? "text-terracotta" : "text-muted-foreground"
                      )}>Delivery</span>
                      <span className="text-xs text-muted-foreground">30-60 min</span>
                    </button>
                    <button
                      onClick={() => setUserPreferredOrderType("takeaway")}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                        userPreferredOrderType === "takeaway" || !isDeliveryAvailable
                          ? "border-terracotta bg-terracotta/10"
                          : "border-border/50 bg-white"
                      )}
                    >
                      <ShoppingBag className={cn(
                        "w-5 h-5",
                        userPreferredOrderType === "takeaway" || !isDeliveryAvailable ? "text-terracotta" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        userPreferredOrderType === "takeaway" || !isDeliveryAvailable ? "text-terracotta" : "text-muted-foreground"
                      )}>Takeaway</span>
                      <span className="text-xs text-muted-foreground">15-20 min</span>
                    </button>
                  </div>
                  {!isDeliveryAvailable && settings.isDeliveryEnabled && distanceKm !== null && distanceKm > 2 && (
                    <p className="text-xs text-amber-600 mt-2 text-center">
                      Delivery not available for distance &gt; 2km
                    </p>
                  )}
                </div>
              )}

              {/* Estimated Time Banner */}
              {restaurantStatus?.isOpen && (
                <div className="mb-5 p-3 bg-bengali-green/10 rounded-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-bengali-green" />
                  <p className="text-sm font-medium text-bengali-green">
                    Estimated {isTakeawayOnly ? "pickup" : "delivery"} time: {estimatedTime}
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
                  <div className="space-y-2">
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
                    {/* Free Items Preview */}
                    {appliedCoupon.freeItems && appliedCoupon.freeItems.length > 0 && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          Free items included:
                        </p>
                        <div className="space-y-1">
                          {appliedCoupon.freeItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              {item.dish.imageUrl && (
                                <img src={item.dish.imageUrl} alt={item.dish.name} className="w-6 h-6 rounded object-cover" />
                              )}
                              <span className="text-green-700 dark:text-green-400">
                                {item.quantity}x {item.dish.name}
                              </span>
                              <span className="text-green-600 dark:text-green-500 text-xs ml-auto">FREE</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                                        {/* Show free items if any */}
                                        {coupon.freeItems && coupon.freeItems.length > 0 && (
                                          <div className="mt-1.5 flex items-center gap-1 text-xs">
                                            <Gift className="w-3 h-3 text-green-600" />
                                            <span className="text-green-600 font-medium">
                                              Free: {coupon.freeItems.map((item) =>
                                                `${item.quantity}x ${item.dish?.name || 'Item'}`
                                              ).join(', ')}
                                            </span>
                                          </div>
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
                              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
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
                        distanceKm > 2
                          ? "bg-mustard/20 text-mustard-dark"
                          : "bg-bengali-green/10 text-bengali-green"
                      )}>
                        {distanceKm > 2 ? `Takeaway only (${distanceKm.toFixed(1)} km)` : `Delivery available (${distanceKm.toFixed(1)} km)`}
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
                    <div className="space-y-1">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="tel"
                          placeholder="Phone Number (10 digits)"
                          value={address.phoneNumber}
                          onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
                          className={cn(
                            "input-field pl-10",
                            address.phoneNumber && (phoneValidation.isValid
                              ? "border-bengali-green/50 focus:border-bengali-green"
                              : "border-red-300 focus:border-red-400")
                          )}
                        />
                        {address.phoneNumber && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {phoneValidation.isValid ? (
                              <Check className="w-4 h-4 text-bengali-green" />
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {address.phoneNumber && !phoneValidation.isValid && phoneValidation.message && (
                        <p className="text-xs text-red-500 pl-1">{phoneValidation.message}</p>
                      )}
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
                disabled={isPlacingOrder || cartLoading || (restaurantStatus && !restaurantStatus.isOpen) || !isMinOrderMet}
                className="w-full btn-primary justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : restaurantStatus && !restaurantStatus.isOpen ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Restaurant Closed
                  </>
                ) : !isMinOrderMet ? (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add ₹{amountNeededForMinOrder.toFixed(0)} more
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
                  to="/auth"
                  state={{ from: "/cart" }}
                  className="btn-primary justify-center"
                >
                  <LogIn className="w-4 h-4" />
                  Login to Continue
                </Link>
                <Link
                  to="/auth"
                  state={{ from: "/cart", mode: "register" }}
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
