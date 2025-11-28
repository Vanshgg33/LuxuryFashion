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

export const demoUsers: AdminUser[] = [
  { id: "USR-001", name: "John Doe", email: "john.doe@email.com", orderCount: 12, joinedDate: "Jan 15, 2024", totalSpent: 4250 },
  { id: "USR-002", name: "Priya Sharma", email: "priya.s@email.com", orderCount: 28, joinedDate: "Dec 03, 2023", totalSpent: 8920 },
  { id: "USR-003", name: "Rahul Kumar", email: "rahul.k@email.com", orderCount: 8, joinedDate: "Feb 20, 2024", totalSpent: 2180 },
  { id: "USR-004", name: "Ananya Patel", email: "ananya.p@email.com", orderCount: 15, joinedDate: "Nov 10, 2023", totalSpent: 5640 },
  { id: "USR-005", name: "Vikram Singh", email: "vikram.s@email.com", orderCount: 22, joinedDate: "Oct 05, 2023", totalSpent: 7350 },
  { id: "USR-006", name: "Meera Nair", email: "meera.n@email.com", orderCount: 6, joinedDate: "Mar 12, 2024", totalSpent: 1890 },
  { id: "USR-007", name: "Arjun Reddy", email: "arjun.r@email.com", orderCount: 19, joinedDate: "Sep 22, 2023", totalSpent: 6420 },
  { id: "USR-008", name: "Sneha Gupta", email: "sneha.g@email.com", orderCount: 31, joinedDate: "Aug 08, 2023", totalSpent: 10250 },
];

export const demoAdminOrders: AdminOrder[] = [
  { id: "ORD-1001", userId: "USR-001", userName: "John Doe", items: ["Chicken Biryani", "Gulab Jamun"], total: 340, status: "Delivered", date: "Nov 28, 2024" },
  { id: "ORD-1002", userId: "USR-002", userName: "Priya Sharma", items: ["Paneer Butter Masala", "Naan", "Lassi"], total: 420, status: "Preparing", date: "Nov 28, 2024" },
  { id: "ORD-1003", userId: "USR-003", userName: "Rahul Kumar", items: ["Masala Dosa", "Filter Coffee"], total: 190, status: "Pending", date: "Nov 28, 2024" },
  { id: "ORD-1004", userId: "USR-004", userName: "Ananya Patel", items: ["Veg Biryani", "Raita"], total: 230, status: "Delivered", date: "Nov 27, 2024" },
  { id: "ORD-1005", userId: "USR-005", userName: "Vikram Singh", items: ["Peri Peri Burger", "Oreo Shake"], total: 270, status: "Preparing", date: "Nov 28, 2024" },
  { id: "ORD-1006", userId: "USR-006", userName: "Meera Nair", items: ["Idli Sambar", "Vada"], total: 120, status: "Delivered", date: "Nov 27, 2024" },
  { id: "ORD-1007", userId: "USR-007", userName: "Arjun Reddy", items: ["Chicken Tikka", "Butter Naan", "Dal Makhani"], total: 580, status: "Pending", date: "Nov 28, 2024" },
  { id: "ORD-1008", userId: "USR-008", userName: "Sneha Gupta", items: ["Tandoori Chicken", "Jeera Rice"], total: 450, status: "Preparing", date: "Nov 28, 2024" },
];

export const topSellingItems = [
  { name: "Chicken Biryani", orders: 156, revenue: 39000 },
  { name: "Paneer Butter Masala", orders: 142, revenue: 31240 },
  { name: "Masala Dosa", orders: 128, revenue: 17920 },
  { name: "Veg Biryani", orders: 98, revenue: 17640 },
  { name: "Peri Peri Burger", orders: 87, revenue: 13050 },
];

export const revenueData = [
  { month: "Jun", revenue: 45000 },
  { month: "Jul", revenue: 52000 },
  { month: "Aug", revenue: 48000 },
  { month: "Sep", revenue: 61000 },
  { month: "Oct", revenue: 58000 },
  { month: "Nov", revenue: 72000 },
];

export const orderStatusData = [
  { name: "Delivered", value: 245, fill: "hsl(142, 25%, 35%)" },
  { name: "Preparing", value: 42, fill: "hsl(45, 80%, 55%)" },
  { name: "Pending", value: 18, fill: "hsl(15, 60%, 55%)" },
];
