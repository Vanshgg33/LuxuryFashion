import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem, removeCartItem, clearCart } from '../api/CartApi';
import type { Cart } from '../api/base';
import { useAuth } from './AuthContext';
import { logger } from '../utils/logger';
import type { AxiosError } from 'axios';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number, price?: number, size?: string) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCartItems: () => Promise<void>;
  refreshCart: () => Promise<void>;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      const cartData = await getCart();
      // Normalize cart data structure
      const normalizedCart: Cart = {
        ...cartData,
        items: cartData.cartItems || cartData.items || [],
        totalAmount: cartData.totalPrice || cartData.totalAmount || 0,
        totalItems: cartData.totalItems || (cartData.cartItems || cartData.items || []).reduce((sum: number, item) => sum + item.quantity, 0)
      };
      setCart(normalizedCart);
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      logger.error('Failed to fetch cart', axiosError);
      if (axiosError.response?.status === 401) {
        setCart(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = async (productId: number, quantity: number = 1, price?: number, size?: string) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }
    try {
      const cartData = await apiAddToCart(productId, quantity, price || 0, size);
      // Backend returns updated cart, so normalize and set it directly
      const normalizedCart: Cart = {
        ...cartData,
        items: cartData.cartItems || cartData.items || [],
        totalAmount: cartData.totalPrice || cartData.totalAmount || 0,
        totalItems: cartData.totalItems || (cartData.cartItems || cartData.items || []).reduce((sum: number, item) => sum + item.quantity, 0)
      };
      setCart(normalizedCart);
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      logger.error('Failed to add to cart', axiosError);
      
      // Handle 401 Unauthorized - token expired or invalid
      if (axiosError.response?.status === 401) {
        setCart(null);
        const errorMessage = axiosError.response?.data?.error || axiosError.response?.data?.message || 'Unauthorized access. Please provide a valid JWT token.';
        throw new Error(errorMessage);
      }
      
      // Extract error message from response if available
      const errorMessage = axiosError.response?.data?.error || axiosError.response?.data?.message || axiosError.message || 'Failed to add item to cart';
      throw new Error(errorMessage);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (!isAuthenticated) {
      throw new Error('Please login to update cart');
    }
    if (quantity < 1) {
      await removeItem(cartItemId);
      return;
    }
    try {
      const cartData = await updateCartItem(cartItemId, quantity);
      // Backend returns updated cart
      const normalizedCart: Cart = {
        ...cartData,
        items: cartData.cartItems || cartData.items || [],
        totalAmount: cartData.totalPrice || cartData.totalAmount || 0,
        totalItems: cartData.totalItems || (cartData.cartItems || cartData.items || []).reduce((sum: number, item) => sum + item.quantity, 0)
      };
      setCart(normalizedCart);
    } catch (error) {
      logger.error('Failed to update cart item', error);
      throw error;
    }
  };

  const removeItem = async (cartItemId: number) => {
    if (!isAuthenticated) {
      throw new Error('Please login to remove items');
    }
    try {
      const cartData = await removeCartItem(cartItemId);
      // Backend returns updated cart
      const normalizedCart: Cart = {
        ...cartData,
        items: cartData.cartItems || cartData.items || [],
        totalAmount: cartData.totalPrice || cartData.totalAmount || 0,
        totalItems: cartData.totalItems || (cartData.cartItems || cartData.items || []).reduce((sum: number, item) => sum + item.quantity, 0)
      };
      setCart(normalizedCart);
    } catch (error) {
      logger.error('Failed to remove cart item', error);
      throw error;
    }
  };

  const clearCartItems = async () => {
    if (!isAuthenticated) {
      throw new Error('Please login to clear cart');
    }
    try {
      await clearCart();
      // Clear cart returns void, so set empty cart
      setCart({
        cartItems: [],
        items: [],
        totalPrice: 0,
        totalAmount: 0,
        totalItems: 0
      });
    } catch (error) {
      logger.error('Failed to clear cart', error);
      throw error;
    }
  };

  // Automatically fetch cart when user becomes authenticated
  // This ensures cart is loaded after login without blocking navigation
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch cart in background - don't block UI
      refreshCart().catch((error) => {
        // Silently handle errors - cart will be fetched when needed
        logger.debug('Background cart fetch failed', error);
      });
    } else {
      setCart(null);
    }
  }, [isAuthenticated, refreshCart]);

  const cartCount = cart?.totalItems || (cart?.items || []).reduce((sum: number, item) => sum + item.quantity, 0) || 0;

  const value: CartContextType = {
    cart,
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCartItems,
    refreshCart,
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};