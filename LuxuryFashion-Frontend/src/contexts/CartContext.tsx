import React, { createContext, useContext, ReactNode } from "react";
import { useCartBackend, BackendCartItem, BackendOrder } from "@/hooks/useCartBackend";
import { FoodItem } from "@/data/foodData";

interface CartContextType {
  cartItems: BackendCartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: FoodItem | number | string, quantity?: number, size?: string) => Promise<void>;
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
      lat?: number;
      lng?: number;
    },
    phoneNumber: string,
    couponCode?: string,
    orderType?: "delivery" | "takeaway",
    specialInstructions?: string
  ) => Promise<number | undefined>;
  loading: boolean;
  error: string | null;
  loadCart: () => Promise<void>;
  isLoggedIn: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCartBackend();

  // Wrapper to handle FoodItem, number ID, or string ID
  const addToCartWrapper = async (
    item: FoodItem | number | string,
    quantity: number = 1,
    size?: string
  ) => {
    let dishId: string | number;
    if (typeof item === "number" || typeof item === "string") {
      // If it's already an ID (number or string), use it directly
      dishId = item;
    } else {
      // If it's a FoodItem, extract the ID
      dishId = item.id;
    }
    await cart.addToCart(dishId, quantity, size);
  };

  // Wrapper to handle both number and string IDs
  const removeFromCartWrapper = async (id: number | string) => {
    await cart.removeFromCart(id as any);
  };

  // Wrapper to handle both number and string IDs
  const updateQuantityWrapper = async (id: number | string, quantity: number) => {
    await cart.updateQuantity(id as any, quantity);
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
