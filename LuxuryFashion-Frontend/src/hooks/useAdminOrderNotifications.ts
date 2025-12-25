import { useState, useEffect, useRef, useCallback } from "react";
import { fetchAdminOrders, getUnreadCount } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// Restaurant bell/ring notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create a bell-like ring sound with multiple frequencies
    const playBellTone = (frequency: number, startTime: number, duration: number, volume: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      // Bell-like envelope with quick attack and longer decay
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;

    // First ring - bell chord (multiple harmonics for rich bell sound)
    playBellTone(880, now, 0.8, 0.4);           // A5
    playBellTone(1108.73, now, 0.6, 0.25);      // C#6
    playBellTone(1318.51, now, 0.5, 0.2);       // E6

    // Second ring after short pause
    playBellTone(880, now + 0.4, 0.8, 0.4);
    playBellTone(1108.73, now + 0.4, 0.6, 0.25);
    playBellTone(1318.51, now + 0.4, 0.5, 0.2);

    // Third ring for emphasis
    playBellTone(1046.50, now + 0.8, 1.0, 0.35);  // C6
    playBellTone(1318.51, now + 0.8, 0.8, 0.25);  // E6
    playBellTone(1567.98, now + 0.8, 0.6, 0.2);   // G6

  } catch (error) {
    console.error("Failed to play notification sound:", error);
  }
};

// Export for external use
export { playNotificationSound };

export interface AdminOrderNotification {
  orderId: string;
  customerName: string;
  totalAmount: number;
  timestamp: Date;
  isNew: boolean;
}

export interface NewOrderData {
  _id: string;
  id?: string;
  user?: { name?: string; email?: string };
  userName?: string;
  items?: Array<{ name?: string; dish?: { name?: string }; quantity?: number; price?: number }>;
  totalAmount?: number;
  total?: number;
  orderType?: string;
  address?: any;
  createdAt?: string;
  status?: string;
  couponCode?: string;
  discountAmount?: number;
  subtotal?: number;
}

export function useAdminOrderNotifications() {
  const { user } = useAuth();
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [newOrders, setNewOrders] = useState<NewOrderData[]>([]);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const soundEnabledRef = useRef(true);
  const isInitialLoadRef = useRef(true);

  const checkForNewOrders = useCallback(async () => {
    if (!user || user.role !== "admin") {
      return;
    }

    try {
      setIsPolling(true);
      const orders = await fetchAdminOrders();
      const ordersArray = Array.isArray(orders) ? orders : [];

      // Get current order IDs
      const currentOrderIds = new Set(
        ordersArray.map((o: any) => (o._id || o.id)?.toString()).filter(Boolean)
      );

      // Find new orders (orders that weren't in the previous set)
      const newOrderIds = Array.from(currentOrderIds).filter(
        (id) => !previousOrderIdsRef.current.has(id)
      );

      // If we have new orders and this isn't the first load
      if (newOrderIds.length > 0 && !isInitialLoadRef.current) {
        // Get the actual new order objects
        const newOrderObjects = ordersArray.filter((o: any) =>
          newOrderIds.includes((o._id || o.id)?.toString())
        );

        setNewOrders(newOrderObjects);
        setHasNewOrder(true);
        setNewOrdersCount((prev) => prev + newOrderIds.length);

        // Play notification sound
        if (soundEnabledRef.current) {
          playNotificationSound();
        }
      }

      // Mark initial load as complete
      isInitialLoadRef.current = false;

      // Update the previous order IDs set
      previousOrderIdsRef.current = currentOrderIds;
      setLastOrderCount(ordersArray.length);
    } catch (error) {
      console.error("Failed to check for new orders:", error);
    } finally {
      setIsPolling(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user && user.role === "admin") {
      checkForNewOrders();
    }
  }, [user, checkForNewOrders]);

  // Poll for new orders every 5 seconds when in admin panel
  useEffect(() => {
    if (!user || user.role !== "admin") {
      return;
    }

    const interval = setInterval(() => {
      checkForNewOrders();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [user, checkForNewOrders]);

  const clearNewOrdersIndicator = useCallback(() => {
    setHasNewOrder(false);
    setNewOrdersCount(0);
  }, []);

  const dismissNewOrders = useCallback(() => {
    setNewOrders([]);
    setHasNewOrder(false);
  }, []);

  const toggleSound = useCallback(() => {
    soundEnabledRef.current = !soundEnabledRef.current;
    return soundEnabledRef.current;
  }, []);

  const isSoundEnabled = useCallback(() => {
    return soundEnabledRef.current;
  }, []);

  return {
    newOrdersCount,
    hasNewOrder,
    lastOrderCount,
    isPolling,
    newOrders,
    clearNewOrdersIndicator,
    dismissNewOrders,
    toggleSound,
    isSoundEnabled,
    refreshOrders: checkForNewOrders,
  };
}





