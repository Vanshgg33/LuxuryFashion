import { useState, useEffect, useCallback } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  placeOrder as apiPlaceOrder,
  fetchOrderHistory,
} from "@/lib/api";

export interface BackendCartItem {
  id: string;
  dish: {
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
    category?: string;
    inStock?: boolean;
  };
  quantity: number;
  price: number;
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
      // Set empty orders for unauthenticated users
      setOrders([]);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadCart();
    loadOrders();
  }, [loadCart, loadOrders]);

  // Add item to cart
  const addToCart = useCallback(
    async (productId: number | string, quantity: number = 1) => {
      try {
        setError(null);
        const cart = await apiAddToCart(productId, quantity);
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
    },
    []
  );

  // Update cart item quantity
  const updateQuantity = useCallback(async (cartItemId: number | string, quantity: number) => {
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
      throw err;
    }
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback(async (cartItemId: number | string) => {
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
  }, []);

  // Clear cart
  const clearCart = useCallback(async () => {
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
        lat?: number;
        lng?: number;
      },
      phoneNumber: string,
      couponCode?: string,
      orderType: "delivery" | "takeaway" = "delivery"
    ) => {
      try {
        setError(null);
        const response = await apiPlaceOrder({
          address: {
            ...address,
            phoneNumber: phoneNumber || address.phoneNumber,
          },
          couponCode,
          orderType,
        });
        await clearCart();
        await loadOrders(); // Reload orders after placing
        return response.order?.id;
      } catch (err: any) {
        console.error("Error placing order:", err);
        setError(err.message);
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
