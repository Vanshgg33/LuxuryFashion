import React, { createContext, useContext, useState, ReactNode } from "react";
import { Notification } from "@/data/adminData";
import { toast } from "sonner";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (message: string, type: Notification["type"]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialNotifications: Notification[] = [
  { id: "1", message: "New order #ORD-1007 received from Arjun Reddy", type: "order", read: false, timestamp: "2 min ago" },
  { id: "2", message: "Order #ORD-1005 is being prepared", type: "order", read: false, timestamp: "15 min ago" },
  { id: "3", message: "New user Meera Nair signed up", type: "user", read: true, timestamp: "1 hour ago" },
  { id: "4", message: "Order #ORD-1004 has been delivered", type: "order", read: true, timestamp: "2 hours ago" },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (message: string, type: Notification["type"]) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      read: false,
      timestamp: "Just now",
    };
    setNotifications((prev) => [newNotification, ...prev]);
    toast.success(message, {
      description: "New notification received",
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
