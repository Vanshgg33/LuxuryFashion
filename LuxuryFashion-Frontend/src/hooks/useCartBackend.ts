import { useState, useEffect, useCallback, useRef } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
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
}

export interface BackendCart {
  id: string;
  cartItems: BackendCartItem[];
  totalPrice: number;
}

export interface BackendOrder {
  id: string;
  _id?: string;
  items: any[];
  totalPrice?: number;
  totalAmount?: number;
  orderDate?: string;
  createdAt?: string;
  status: string;
  couponCode?: string;
  discountAmount?: number;
  subtotal?: number;
  orderType?: "delivery" | "takeaway";
  address?: any;
}

// Guest cart stored in localStorage
interface GuestCartItem {
  dishId: string;
  quantity: number;
  isHalfPortion?: boolean;
  dish?: any; // Populated from products
}

const GUEST_CART_KEY = "rd_guest_cart";

// Helper functions for guest cart
const getGuestCart = (): GuestCartItem[] => {
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
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
  const [products, setProducts] = useState<any[]>([]);

  // Refs to prevent duplicate API calls
  const isLoadingOrdersRef = useRef(false);
  const ordersLoadedRef = useRef(false);
  const isInitializedRef = useRef(false);

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
    } catch (err: any) {
      console.error("Error loading cart:", err);
      setError(err.message);
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
    } catch (err: any) {
      console.error("Error loading orders:", err);
      setOrders([]);
    } finally {
      isLoadingOrdersRef.current = false;
      setOrdersLoading(false);
    }
  }, [isLoggedIn]);

  // Sync guest cart to backend when user logs in
  const syncGuestCartToBackend = useCallback(async () => {
    const guestCart = getGuestCart();
    if (guestCart.length === 0) return;

    console.log("Syncing guest cart to backend...", guestCart);

    try {
      // Add each guest cart item to backend cart
      for (const item of guestCart) {
        try {
          await apiAddToCart(item.dishId, item.quantity, item.isHalfPortion || false);
        } catch (err) {
          console.error("Error syncing item:", item.dishId, err);
        }
      }
      // Clear guest cart after sync
      clearGuestCart();
      // Reload backend cart
      await loadBackendCart();
    } catch (err) {
      console.error("Error syncing guest cart:", err);
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
        // Sync guest cart to backend
        const guestCart = getGuestCart();
        if (guestCart.length > 0) {
          for (const item of guestCart) {
            try {
              await apiAddToCart(item.dishId, item.quantity, item.isHalfPortion || false);
            } catch (err) {
              console.error("Error syncing item:", item.dishId, err);
            }
          }
          clearGuestCart();
        }

        // Load backend cart
        try {
          const cart = await getCart();
          setCartItems(cart.cartItems || []);
          setCartTotal(cart.totalPrice || 0);
          setCartCount(
            cart.cartItems?.reduce((sum: number, item: BackendCartItem) => sum + item.quantity, 0) || 0
          );
        } catch (err: any) {
          console.error("Error loading cart:", err);
          setError(err.message);
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
        } catch (err: any) {
          console.error("Error adding to cart:", err);
          setError(err.message);
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
        } catch (err: any) {
          console.error("Error updating cart:", err);
          setError(err.message);
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
        } catch (err: any) {
          console.error("Error removing from cart:", err);
          setError(err.message);
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
      } catch (err: any) {
        console.error("Error clearing cart:", err);
        setError(err.message);
        throw err;
      }
    } else {
      clearGuestCart();
      setCartItems([]);
      setCartTotal(0);
      setCartCount(0);
    }
  }, [isLoggedIn]);

  // Place order (requires login)
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
      } catch (err: any) {
        console.error("Error placing order:", err);
        setError(err.message);
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
    placeOrder,
    loadCart,
    loadOrders,
  };
}
