// User Types
export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  address?: Address;
  createdAt?: string;
}

// Address Types
export interface Address {
  _id?: string;
  id?: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

// Product/Dish Types
export interface Dish {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  imageUrl?: string;
  inStock?: boolean;
  isVeg?: boolean;
  hasHalfPortion?: boolean;
  halfPortionPrice?: number;
  isBuyOneGetOne?: boolean;
  isFeatured?: boolean;
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Cart Types
export interface CartItem {
  _id?: string;
  id?: string;
  dish: Dish;
  quantity: number;
  price: number;
  isHalfPortion?: boolean;
}

export interface Cart {
  _id?: string;
  id?: string;
  cartItems: CartItem[];
  totalPrice: number;
}

// Order Types
export interface OrderItem {
  dish?: string | { _id: string; name: string; imageUrl?: string };
  name: string;
  price: number;
  quantity: number;
  isFree?: boolean;
  isHalfPortion?: boolean;
  isBuyOneGetOne?: boolean;
}

export interface Order {
  _id?: string;
  id?: string;
  user: string | User;
  items: OrderItem[];
  subtotal?: number;
  discountAmount?: number;
  couponCode?: string;
  totalAmount: number;
  totalPrice?: number;
  total?: number;
  orderType: "delivery" | "takeaway";
  address?: Address;
  status: "placed" | "preparing" | "ready_for_pickup" | "out_for_delivery" | "delivered" | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  paymentId?: string;
  specialInstructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Coupon Types
export interface Coupon {
  _id?: string;
  id?: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  usedCount: number;
  description?: string;
  createdAt?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  };
  discount: number;
  discountFormatted: string;
  finalAmount: number;
  finalAmountFormatted: string;
  message: string;
}

// Review Types
export interface Review {
  _id?: string;
  id?: string;
  user: string | User;
  dish: string;
  rating: number;
  comment?: string;
  isVisible?: boolean;
  createdAt?: string;
}

export interface DishRating {
  averageRating: number;
  totalReviews: number;
}

// Favorite Types
export interface Favorite {
  _id?: string;
  id?: string;
  user: string;
  dish: Dish;
  addedAt?: string;
}

// Notification Types
export interface Notification {
  _id?: string;
  id?: string;
  user: string;
  message: string;
  type: "order" | "user" | "system" | "promotion";
  read: boolean;
  metadata?: Record<string, any>;
  link?: string;
  timestamp?: string;
  createdAt?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AddressForm {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export interface ReviewForm {
  rating: number;
  comment?: string;
}

// Analytics Types
export interface AnalyticsSummary {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
}

export interface RevenueByMonth {
  _id: string;
  revenue: number;
}

export interface BestSeller {
  _id: string;
  name: string;
  orders: number;
  revenue: number;
  quantity: number;
}






