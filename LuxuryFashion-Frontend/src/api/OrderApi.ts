import axios from 'axios';
import { baseApiUrl } from './base';

export type PaymentStatus = 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface Order {
  id: number;
  orderId?: number; // Legacy field for compatibility
  totalPrice: number;
  totalAmount?: number; // Legacy field for compatibility
  orderDate: string;
  status: string;
  // Payment fields (now directly on Order object)
  paymentStatus?: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentMethod?: string;
  paidAt?: string;
  paymentFailureReason?: string;
  items: OrderItem[];
}

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  size?: string; // Size selected for this order item
  product: {
    prod_name: string;
    prod_images: string[];
    prod_brand: string;
  };
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface PlaceOrderRequest {
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phoneNumber?: string;
  paymentStatus?: 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  paymentMethod?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export interface PlaceOrderResponse {
  order: Order;
  payment: {
    razorpay_order_id: string;
    amount: number;
    currency: string;
    key: string;
    order_id: number;
  };
}

// Create Razorpay order (for payment only, before placing actual order)
export interface CreateRazorpayOrderRequest {
  amount: number; // Amount in paise
  currency?: string;
  receipt?: string; // Optional receipt ID
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phoneNumber?: string;
}

export interface CreateRazorpayOrderResponse {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key: string;
  order_id?: number; // Optional order ID from backend
}

export const createRazorpayOrder = async (
  amount: number, 
  currency: string = 'INR',
  receipt?: string,
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  },
  phoneNumber?: string
): Promise<CreateRazorpayOrderResponse> => {
  const payload: CreateRazorpayOrderRequest = {
    amount: amount, // Amount in paise (as number)
    currency: currency || 'INR'
  };
  
  // Add receipt if provided
  if (receipt) {
    payload.receipt = receipt;
  }
  
  // Add address if provided (required by backend)
  if (address) {
    payload.address = address;
  }
  
  // Add phone number if provided
  if (phoneNumber) {
    payload.phoneNumber = phoneNumber;
  }
  
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  // Log the payload being sent for debugging
  console.log('Creating Razorpay order with payload:', payload);
  console.log('Endpoint:', `${baseApiUrl}/api/orders/create-razorpay-order`);
  
  try {
    const response = await axios.post(
      `${baseApiUrl}/api/orders/create-razorpay-order`,
      payload,
      { 
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Razorpay order created successfully:', response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    console.error('Razorpay order creation error details:', {
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
      requestPayload: payload,
      url: axiosError.config?.url
    });
    
    // If 400 error, log the exact error message from backend
    if (axiosError.response?.status === 400) {
      console.error('Backend validation error:', axiosError.response.data);
    }
    
    throw error;
  }
};

// Place order after payment is successful
export interface PlaceOrderWithPaymentRequest extends PlaceOrderRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const placeOrder = async (orderData?: PlaceOrderRequest | PlaceOrderWithPaymentRequest): Promise<PlaceOrderResponse> => {
  const response = await axios.post(
    `${baseApiUrl}/api/orders/place`,
    orderData || {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getOrderHistory = async (): Promise<Order[]> => {
  const response = await axios.get(`${baseApiUrl}/api/orders/history`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getOrderDetails = async (orderId: number): Promise<Order> => {
  const response = await axios.get(`${baseApiUrl}/api/orders/${orderId}`, {
    headers: getAuthHeaders(),
  });
  // Normalize response - payment info is now directly on order
  const order = response.data;
  // Ensure legacy fields for compatibility
  if (order.orderId && !order.id) {
    order.id = order.orderId;
  }
  if (order.totalAmount && !order.totalPrice) {
    order.totalPrice = order.totalAmount;
  }
  return order;
};