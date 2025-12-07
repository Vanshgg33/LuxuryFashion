import { useState, useEffect, useCallback } from "react";
import {
  getCart,
  getCartItems,
  getCartCount,
  getCartTotal,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  placeOrder as apiPlaceOrder,
  fetchOrderHistory,
} from "@/lib/api";
import { toast } from "sonner";

export interface BackendCartItem {
  id: number;
  product: {
    prod_id: number;
    prod_name: string;
    prod_description?: string;
    prod_price: number;
    selling_price: number;
    imagenames?: string[];
    prod_category?: string;
  };
  quantity: number;
  price: number;
  size?: string;
}

export interface BackendCart {
  id: number;
  cartItems: BackendCartItem[];
  totalPrice: number;
}

export interface BackendOrder {
  id: number;
  items: any[];
  totalPrice: number;
  orderDate: string;
  status: string;
  couponCode?: string;
  discountAmount?: number;
  subtotal?: number;
}

export function useCartBackend() {
  const [cartItems, setCartItems] = useState<BackendCartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cart from backend
  const loadCart = useCallback(async () => {
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
      // If user is not authenticated, set empty cart
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        setCartItems([]);
        setCartTotal(0);
        setCartCount(0);
      } else {
        toast.error("Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load orders from backend
  const loadOrders = useCallback(async () => {
    try {
      const orderList = await fetchOrderHistory();
      setOrders(orderList || []);
    } catch (err: any) {
      console.error("Error loading orders:", err);
      // Don't show error for unauthenticated users
      if (!err.message.includes("401") && !err.message.includes("Unauthorized") && 
          !err.message.includes("not authenticated")) {
        toast.error("Failed to load orders");
      } else {
        // Set empty orders for unauthenticated users
        setOrders([]);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadCart();
    loadOrders();
  }, [loadCart, loadOrders]);

  // Add item to cart
  const addToCart = useCallback(
    async (productId: number, quantity: number = 1, size?: string) => {
      try {
        setError(null);
        const cart = await apiAddToCart(productId, quantity, size);
        setCartItems(cart.cartItems || []);
        setCartTotal(cart.totalPrice || 0);
        setCartCount(
          cart.cartItems?.reduce((sum: number, item: BackendCartItem) => sum + item.quantity, 0) || 0
        );
        toast.success("Item added to cart");
      } catch (err: any) {
        console.error("Error adding to cart:", err);
        setError(err.message);
        toast.error(err.message || "Failed to add item to cart");
        throw err;
      }
    },
    []
  );

  // Update cart item quantity
  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
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
      toast.error(err.message || "Failed to update cart");
      throw err;
    }
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback(async (cartItemId: number) => {
    try {
      setError(null);
      const cart = await apiRemoveFromCart(cartItemId);
      setCartItems(cart.cartItems || []);
      setCartTotal(cart.totalPrice || 0);
      setCartCount(
        cart.cartItems?.reduce((sum: number, item: BackendCartItem) => sum + item.quantity, 0) || 0
      );
      toast.success("Item removed from cart");
    } catch (err: any) {
      console.error("Error removing from cart:", err);
      setError(err.message);
      toast.error(err.message || "Failed to remove item");
      throw err;
    }
  }, []);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      setError(null);
      await apiClearCart();
      setCartItems([]);
      setCartTotal(0);
      setCartCount(0);
      toast.success("Cart cleared");
    } catch (err: any) {
      console.error("Error clearing cart:", err);
      setError(err.message);
      toast.error(err.message || "Failed to clear cart");
      throw err;
    }
  }, []);

  // Place order
  const placeOrder = useCallback(
    async (
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phoneNumber?: string;
      },
      phoneNumber: string,
      couponCode?: string
    ) => {
      try {
        setError(null);
        const response = await apiPlaceOrder({
          address,
          phoneNumber,
          couponCode,
        });
        await clearCart();
        await loadOrders(); // Reload orders after placing
        toast.success(response.message || "Order placed successfully!", {
          description: `Order ID: ${response.order?.id}`,
        });
        return response.order?.id;
      } catch (err: any) {
        console.error("Error placing order:", err);
        setError(err.message);
        toast.error(err.message || "Failed to place order");
        throw err;
      }
    },
    [clearCart, loadOrders]
  );

  return {
    cartItems,
    cartCount,
    cartTotal,
    orders,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    loadCart,
    loadOrders,
  };
}

