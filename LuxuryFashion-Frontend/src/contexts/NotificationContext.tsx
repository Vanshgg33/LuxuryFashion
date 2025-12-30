import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
} from "@/lib/api";
import { useAuth } from "./AuthContext";

export interface Notification {
  _id?: string;
  id?: string;
  message: string;
  type: "order" | "user" | "system" | "promotion";
  read: boolean;
  timestamp?: string;
  createdAt?: string;
  metadata?: Record<string, any>;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  const formatTimestamp = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return d.toLocaleDateString();
  };

  const loadNotifications = useCallback(async () => {
    if (!user) {
      if (isMountedRef.current) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
      }
      return;
    }

    try {
      const [notifs, count] = await Promise.all([
        getNotifications().catch(() => []),
        getUnreadCount().catch(() => ({ count: 0 })),
      ]);

      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      const formatted = (Array.isArray(notifs) ? notifs : []).map((n: Notification) => ({
        ...n,
        id: n._id || n.id,
        timestamp: n.createdAt ? formatTimestamp(n.createdAt) : "Recently",
      }));

      setNotifications(formatted);
      setUnreadCount(typeof count === "number" ? count : count.count || 0);
    } catch (err: any) {
      console.error("Failed to load notifications", err);
      if (isMountedRef.current) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    isMountedRef.current = true;
    loadNotifications();

    // Poll for new notifications every 15 seconds
    const interval = setInterval(() => {
      if (user && isMountedRef.current) {
        loadNotifications();
      }
    }, 15000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [loadNotifications, user]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => {
          const nId = n._id || n.id;
          return nId === id ? { ...n, read: true } : n;
        })
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error("Failed to mark notification as read", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error("Failed to mark all as read", err);
    }
  }, []);

  const clearNotifications = useCallback(async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err: any) {
      console.error("Failed to clear notifications", err);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        refreshNotifications: loadNotifications,
      }}
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
