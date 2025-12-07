export interface AdminUser {
  id: string;
  name: string;
  email: string;
  orderCount: number;
  joinedDate: string;
  totalSpent: number;
}

export interface AdminOrder {
  id: string;
  userId: string;
  userName: string;
  items: string[];
  total: number;
  status: "Pending" | "Preparing" | "Delivered";
  date: string;
}

export interface Notification {
  id: string;
  message: string;
  type: "order" | "user" | "system";
  read: boolean;
  timestamp: string;
}
// Admin data helpers - replaced demo arrays with API-backed helpers
import { fetchAdminOrders, fetchOrderHistory } from "@/lib/api";

export { fetchAdminOrders, fetchOrderHistory };

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  orderCount: number;
  joinedDate: string;
  totalSpent: number;
}

export interface AdminOrder {
  id: string;
  userId: string;
  userName: string;
  items: string[];
  total: number;
  status: "Pending" | "Preparing" | "Delivered";
  date: string;
}

export interface Notification {
  id: string;
  message: string;
  type: "order" | "user" | "system";
  read: boolean;
  timestamp: string;
}
