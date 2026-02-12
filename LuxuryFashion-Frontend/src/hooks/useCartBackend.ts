import { useState, useEffect, useCallback, useRef } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  addFreeItemsToCart,
  removeFreeItemsFromCart,
  placeOrder as apiPlaceOrder,
  fetchOrderHistory,
  fetchProducts,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export interface BackendCartItem {
  id: string;
  dish: {
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
    category?: string;
    inStock?: boolean;
    isBuyOneGetOne?: boolean;
  };
  quantity: number;
  price: number;
  itemTotal?: number; // Backend-calculated total (includes BOGO discount)
  isFreeItem?: boolean;
  couponCode?: string;
}

export interface BackendCart {
  id: string;
  cartItems: BackendCartItem[];
  totalPrice: number;
}

export interface BackendOrderItem {
  dish?: string | { _id: string; name: string; imageUrl?: string };
  name: string;
  price: number;
  quantity: number;
  isFree?: boolean;
  isHalfPortion?: boolean;
  isBuyOneGetOne?: boolean;
}

export interface BackendOrderAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phoneNumber?: string;
  lat?: number;
  lng?: number;
}

export interface BackendOrder {
  id: string;
  _id?: string;
  items: BackendOrderItem[];
  totalPrice?: number;
  totalAmount?: number;
  total?: number;
  orderDate?: string;
  createdAt?: string;
  status: string;
  couponCode?: string;
  discountAmount?: number;
  subtotal?: number;
  orderType?: "delivery" | "takeaway";
  address?: BackendOrderAddress;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    phone?: string; // Legacy field for backward compatibility
  };
}

// Guest cart stored in localStorage
interface GuestCartItem {
  dishId: string;
  quantity: number;
  isHalfPortion?: boolean;
  dish?: BackendCartItem['dish']; // Populated from products
}

const GUEST_CART_KEY = "rd_guest_cart";

// Helper functions for guest cart
const getGuestCart = (): GuestCartItem[] => {
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    if (!cart) return [];

    const parsed = JSON.parse(cart);

    // Validate that it's an array with valid items
    if (!Array.isArray(parsed)) {
      console.warn("Invalid guest cart format, clearing...");
      localStorage.removeItem(GUEST_CART_KEY);
      return [];
    }

    // Filter out invalid items
    const validItems = parsed.filter(
      (item): item is GuestCartItem =>
        item &&
        typeof item === "object" &&
        typeof item.dishId === "string" &&
        typeof item.quantity === "number" &&
        item.quantity > 0
    );

    // If some items were invalid, save the cleaned cart
    if (validItems.length !== parsed.length) {
      console.warn(`Cleaned ${parsed.length - validItems.length} invalid items from guest cart`);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(validItems));
    }

    return validItems;
  } catch (err) {
    console.error("Failed to parse guest cart, clearing:", err);
    localStorage.removeItem(GUEST_CART_KEY);
    return [];
  }
};

const saveGuestCart = (cart: GuestCartItem[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
};

export function useCartBackend() {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<BackendCartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Product type from the dishes API
  interface Product {
    _id: string;
    id?: string;
    name: string;
    price: number;
    imageUrl?: string;
    dishCategory?: string;
    inStock?: boolean;
    halfPortionPrice?: number;
    isBuyOneGetOne?: boolean;
  }

  const [products, setProducts] = useState<Product[]>([]);

  // Refs to prevent duplicate API calls
  const isLoadingOrdersRef = useRef(false);
  const ordersLoadedRef = useRef(false);
  const isInitializedRef = useRef(false);
  const isSyncingGuestCartRef = useRef(false); // Prevent duplicate guest cart sync

  // Check if user is logged in
  const isLoggedIn = !!user;

  // Load products for guest cart display
  const loadProducts = useCallback(async () => {
    try {
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  }, []);

  // Load guest cart from localStorage and populate with product data
  const loadGuestCart = useCallback(() => {
    const guestCart = getGuestCart();
    if (guestCart.length === 0) {
      setCartItems([]);
      setCartTotal(0);
      setCartCount(0);
      return;
    }

    // Map guest cart items to BackendCartItem format
    const items: BackendCartItem[] = guestCart
      .map((item) => {
        const product = products.find(
          (p) => p._id === item.dishId || p.id === item.dishId
        );
        if (!product) return null;

        // Use half portion price if applicable
        const price = item.isHalfPortion && product.halfPortionPrice
          ? product.halfPortionPrice
          : product.price;

        // Calculate item total with BOGO discount
        let itemTotal = price * item.quantity;
        if (product.isBuyOneGetOne && item.quantity > 0) {
          // For BOGO: charge for half the quantity (rounded up)
          const chargeableQuantity = Math.ceil(item.quantity / 2);
          itemTotal = price * chargeableQuantity;
        }

        return {
          id: item.isHalfPortion ? `${item.dishId}-half` : item.dishId,
          dish: {
            _id: product._id || product.id,
            name: item.isHalfPortion ? `${product.name} (Half)` : product.name,
            price: price,
            imageUrl: product.imageUrl,
            category: product.dishCategory,
            inStock: product.inStock,
            isBuyOneGetOne: product.isBuyOneGetOne,
          },
          quantity: item.quantity,
          price: price,
          itemTotal: itemTotal,
        };
      })
      .filter(Boolean) as BackendCartItem[];

    setCartItems(items);
    // Use itemTotal for cart total (includes BOGO discount)
    setCartTotal(items.reduce((sum, item) => sum + (item.itemTotal || item.price * item.quantity), 0));
    setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
  }, [products]);

  // Load cart from backend (for logged-in users)
  const loadBackendCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cart = await getCart();
      setCartItems(cart.cartItems || []);
      setCartTotal(cart.totalPrice || 0);
      setCartCount(
        cart.cartItems?.reduce((sum: number, item: BackendCartItem) => sum + item.quantity, 0) || 0
      );
    } catch (err) {
      console.error("Error loading cart:", err);
      setError(err instanceof Error ? err.message : "Failed to load cart");
      setCartItems([]);
      setCartTotal(0);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Main load cart function
  const loadCart = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    if (isLoggedIn) {
      await loadBackendCart();
    } else {
      await loadProducts();
      loadGuestCart();
      setLoading(false);
    }
  }, [isLoggedIn, authLoading, loadBackendCart, loadProducts, loadGuestCart]);

  // Load orders from backend
  const loadOrders = useCallback(async (forceRefresh = false) => {
    if (!isLoggedIn) {
      setOrders([]);
      return;
    }
    // Prevent duplicate concurrent calls
    if (isLoadingOrdersRef.current) {
      return;
    }
    // Skip if already loaded (unless force refresh)
    if (ordersLoadedRef.current && !forceRefresh) {
      return;
    }
    try {
      isLoadingOrdersRef.current = true;
      setOrdersLoading(true);
      const orderList = await fetchOrderHistory();
      setOrders(orderList || []);
      ordersLoadedRef.current = true;
    } catch (err) {
      console.error("Error loading orders:", err);
      setOrders([]);
    } finally {
      isLoadingOrdersRef.current = false;
      setOrdersLoading(false);
    }
  }, [isLoggedIn]);

  // Sync guest cart to backend when user logs in (with lock to prevent race condition)
  const syncGuestCartToBackend = useCallback(async () => {
    // Prevent duplicate sync operations
    if (isSyncingGuestCartRef.current) return;

    const guestCart = getGuestCart();
    if (guestCart.length === 0) return;

    isSyncingGuestCartRef.current = true;

    const failedItems: typeof guestCart = [];

    try {
      // Add each guest cart item to backend cart
      for (const item of guestCart) {
        try {
          await apiAddToCart(item.dishId, item.quantity, item.isHalfPortion || false);
        } catch (err) {
          console.error("Error syncing item:", item.dishId, err);
          failedItems.push(item); // Track failed items
        }
      }

      // Only clear successfully synced items, keep failed ones
      if (failedItems.length === 0) {
        clearGuestCart();
      } else if (failedItems.length < guestCart.length) {
        // Some items synced, some failed - update guest cart with only failed items
        localStorage.setItem("rd_guest_cart", JSON.stringify(failedItems));
        console.warn("Some items failed to sync, kept in guest cart:", failedItems);
      }
      // If all items failed, don't clear guest cart

      // Reload backend cart
      await loadBackendCart();
    } catch (err) {
      console.error("Error syncing guest cart:", err);
    } finally {
      isSyncingGuestCartRef.current = false;
    }
  }, [loadBackendCart]);

  // Initial load and sync - only run when auth state changes
  useEffect(() => {
    if (authLoading) return;

    // Prevent duplicate initialization
    if (isInitializedRef.current && !isLoggedIn) return;

    const init = async () => {
      // Only load products once
      if (products.length === 0) {
        try {
          const productsData = await fetchProducts();
          setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (err) {
          console.error("Error loading products:", err);
        }
      }

      if (isLoggedIn) {
        // Sync guest cart to backend (uses lock to prevent race condition)
        await syncGuestCartToBackend();

        // Load backend cart
        try {
          const cart = await getCart();
          setCartItems(cart.cartItems || []);
          setCartTotal(cart.totalPrice || 0);
          setCartCount(
            cart.cartItems?.reduce((sum: number, item: BackendCartItem) => sum + item.quantity, 0) || 0
          );
        } catch (err) {
          console.error("Error loading cart:", err);
          setError(err instanceof Error ? err.message : "Failed to load cart");
        }

        // Don't load orders here - let the Orders page load them when visited
        // This prevents unnecessary API calls on app startup
      } else {
        // Reset orders loaded flag when user logs out
        ordersLoadedRef.current = false;
        // For guest users, cart will be loaded when products state updates
      }
      setLoading(false);
      isInitializedRef.current = true;
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, authLoading]);

  // Reload guest cart when products change
  useEffect(() => {
    if (!isLoggedIn && products.length > 0) {
      loadGuestCart();
    }
  }, [products, isLoggedIn, loadGuestCart]);

  // Add item to cart (guest or backend)
  const addToCart = useCallback(
    async (productId: number | string, quantity: number = 1, isHalfPortion: boolean = false) => {
      const dishId = String(productId);

      if (isLoggedIn) {
        // Use backend API for logged-in users
        try {
          setError(null);
          const cart = await apiAddToCart(productId, quantity, isHalfPortion);
          setCartItems(cart.cartItems || []);
          setCartTotal(cart.totalPrice || 0);
          setCartCount(
            cart.cartItems?.reduce((sum: number, item: BackendCartItem) => sum + item.quantity, 0) || 0
          );
        } catch (err) {
          console.error("Error adding to cart:", err);
          setError(err instanceof Error ? err.message : "Failed to add to cart");
          throw err;
        }
      } else {
        // Use localStorage for guest users
        const guestCart = getGuestCart();
        // Find existing item with same dishId AND same portion type
        const existingIndex = guestCart.findIndex(
          (item) => item.dishId === dishId && item.isHalfPortion === isHalfPortion
        );

        if (existingIndex >= 0) {
          guestCart[existingIndex].quantity += quantity;
        } else {
          guestCart.push({ dishId, quantity, isHalfPortion });
        }

        saveGuestCart(guestCart);
        loadGuestCart();
      }
    },
    [isLoggedIn, loadGuestCart]
  );

  // Update cart item quantity (guest or backend)
  const updateQuantity = useCallback(
    async (cartItemId: number | string, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }

      const itemId = String(cartItemId);

      if (isLoggedIn) {
        try {
          setError(null);
          const cart = await apiUpdateCartItem(cartItemId, quantity);
          setCartItems(cart.cartItems || []);
          setCartTotal(cart.totalPrice || 0);
          setCartCount(
            cart.cartItems?.reduce((sum: number, item: BackendCartItem) => sum + item.quantity, 0) || 0
          );
        } catch (err) {
          console.error("Error updating cart:", err);
          setError(err instanceof Error ? err.message : "Failed to update cart");
          throw err;
        }
      } else {
        const guestCart = getGuestCart();
        const existingIndex = guestCart.findIndex((item) => item.dishId === itemId);

        if (existingIndex >= 0) {
          guestCart[existingIndex].quantity = quantity;
          saveGuestCart(guestCart);
          loadGuestCart();
        }
      }
    },
    [isLoggedIn, loadGuestCart]
  );

  // Remove item from cart (guest or backend)
  const removeFromCart = useCallback(
    async (cartItemId: number | string) => {
      const itemId = String(cartItemId);

      if (isLoggedIn) {
        try {
          setError(null);
          const cart = await apiRemoveFromCart(cartItemId);
          setCartItems(cart.cartItems || []);
          setCartTotal(cart.totalPrice || 0);
          setCartCount(
            cart.cartItems?.reduce((sum: number, item: BackendCartItem) => sum + item.quantity, 0) || 0
          );
        } catch (err) {
          console.error("Error removing from cart:", err);
          setError(err instanceof Error ? err.message : "Failed to remove from cart");
          throw err;
        }
      } else {
        const guestCart = getGuestCart();
        const filteredCart = guestCart.filter((item) => item.dishId !== itemId);
        saveGuestCart(filteredCart);
        loadGuestCart();
      }
    },
    [isLoggedIn, loadGuestCart]
  );

  // Clear cart (guest or backend)
  const clearCart = useCallback(async () => {
    if (isLoggedIn) {
      try {
        setError(null);
        await apiClearCart();
        setCartItems([]);
        setCartTotal(0);
        setCartCount(0);
      } catch (err) {
        console.error("Error clearing cart:", err);
        setError(err instanceof Error ? err.message : "Failed to clear cart");
        throw err;
      }
    } else {
      clearGuestCart();
      setCartItems([]);
      setCartTotal(0);
      setCartCount(0);
    }
  }, [isLoggedIn]);

  // Free item type for coupon validation
  interface FreeItemInput {
    dish: { _id: string; name: string; price: number; imageUrl?: string };
    quantity: number;
  }

  // Add free items to cart
  const addFreeItems = useCallback(
    async (freeItems: FreeItemInput[], couponCode: string) => {
      if (!isLoggedIn) return;
      
      try {
        setError(null);
        const cart = await addFreeItemsToCart(freeItems, couponCode);
        setCartItems(cart.cartItems || []);
        setCartTotal(cart.totalPrice || 0);
        setCartCount(
          cart.cartItems?.reduce((sum: number, item: BackendCartItem) => sum + item.quantity, 0) || 0
        );
      } catch (err) {
        console.error("Error adding free items:", err);
        setError(err instanceof Error ? err.message : "Failed to add free items");
        throw err;
      }
    },
    [isLoggedIn]
  );

  // Remove free items from cart
  const removeFreeItems = useCallback(
    async (couponCode?: string) => {
      if (!isLoggedIn) return;
      
      try {
        setError(null);
        const cart = await removeFreeItemsFromCart(couponCode);
        setCartItems(cart.cartItems || []);
        setCartTotal(cart.totalPrice || 0);
        setCartCount(
          cart.cartItems?.reduce((sum: number, item: BackendCartItem) => sum + item.quantity, 0) || 0
        );
      } catch (err) {
        console.error("Error removing free items:", err);
        setError(err instanceof Error ? err.message : "Failed to remove free items");
        throw err;
      }
    },
    [isLoggedIn]
  );
  const placeOrder = useCallback(
    async (
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phoneNumber?: string;
        lat?: number;
        lng?: number;
      },
      phoneNumber: string,
      couponCode?: string,
      orderType: "delivery" | "takeaway" = "delivery",
      specialInstructions?: string
    ) => {
      // Require login to place order
      if (!isLoggedIn) {
        throw new Error("LOGIN_REQUIRED");
      }

      try {
        setError(null);
        const response = await apiPlaceOrder({
          address: {
            ...address,
            phoneNumber: phoneNumber || address.phoneNumber,
          },
          couponCode,
          orderType,
          specialInstructions,
        });
        await clearCart();
        // Force refresh orders after placing a new order
        ordersLoadedRef.current = false;
        await loadOrders(true);
        return response.order?.id;
      } catch (err) {
        console.error("Error placing order:", err);
        setError(err instanceof Error ? err.message : "Failed to place order");
        throw err;
      }
    },
    [isLoggedIn, clearCart, loadOrders]
  );

  return {
    cartItems,
    cartCount,
    cartTotal,
    orders,
    loading,
    ordersLoading,
    error,
    isLoggedIn,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    addFreeItems,
    removeFreeItems,
    placeOrder,
    loadCart,
    loadOrders,
  };
}
