import React, { createContext, useContext, ReactNode } from "react";
import { useCartBackend, BackendCartItem, BackendOrder } from "@/hooks/useCartBackend";
import { FoodItem } from "@/data/foodData";

interface CartContextType {
  cartItems: BackendCartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: FoodItem | number, quantity?: number, size?: string) => Promise<void>;
  removeFromCart: (id: number | string) => Promise<void>;
  updateQuantity: (id: number | string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  orders: BackendOrder[];
  placeOrder: (
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
  ) => Promise<number | undefined>;
  loading: boolean;
  error: string | null;
  loadCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCartBackend();

  // Wrapper to handle both FoodItem and productId
  const addToCartWrapper = async (
    item: FoodItem | number,
    quantity: number = 1,
    size?: string
  ) => {
    if (typeof item === "number") {
      await cart.addToCart(item, quantity, size);
    } else {
      // Convert FoodItem to productId - assuming FoodItem.id is the product ID
      const productId = parseInt(item.id);
      if (isNaN(productId)) {
        throw new Error("Invalid product ID");
      }
      await cart.addToCart(productId, quantity, size);
    }
  };

  // Wrapper to handle both number and string IDs
  const removeFromCartWrapper = async (id: number | string) => {
    const cartItemId = typeof id === "string" ? parseInt(id) : id;
    if (isNaN(cartItemId)) {
      throw new Error("Invalid cart item ID");
    }
    await cart.removeFromCart(cartItemId);
  };

  // Wrapper to handle both number and string IDs
  const updateQuantityWrapper = async (id: number | string, quantity: number) => {
    const cartItemId = typeof id === "string" ? parseInt(id) : id;
    if (isNaN(cartItemId)) {
      throw new Error("Invalid cart item ID");
    }
    await cart.updateQuantity(cartItemId, quantity);
  };

  const contextValue: CartContextType = {
    ...cart,
    addToCart: addToCartWrapper,
    removeFromCart: removeFromCartWrapper,
    updateQuantity: updateQuantityWrapper,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}
