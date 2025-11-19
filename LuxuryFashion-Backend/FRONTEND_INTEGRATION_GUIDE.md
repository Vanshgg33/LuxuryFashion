# Frontend Integration Guide - LuxuryFashion Backend

## Overview
This guide provides complete instructions for integrating the LuxuryFashion frontend with the backend API, including authentication, cart operations, orders, payments, and admin features.

## Table of Contents
1. [Authentication Setup](#authentication-setup)
2. [API Configuration](#api-configuration)
3. [Cart Integration](#cart-integration)
4. [Order Integration](#order-integration)
5. [Payment Integration (Razorpay)](#payment-integration-razorpay)
6. [Product Display](#product-display)
7. [Admin Panel Integration](#admin-panel-integration)
8. [Error Handling](#error-handling)

---

## Authentication Setup

### 1. JWT Token Management

The backend uses JWT tokens for authentication. You need to:
- Store the token after login
- Send the token with every authenticated request
- Handle token expiration

#### Token Storage
```typescript
// Store token after login
localStorage.setItem('authToken', token);
// OR use cookies (backend also checks cookies)
document.cookie = `authToken=${token}; path=/; SameSite=None; Secure`;
```

#### Axios Interceptor Setup
```typescript
// axios.ts or api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Login Flow

```typescript
// AuthService.ts
import api from './api';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  
  // Store token
  localStorage.setItem('authToken', response.data.token);
  
  return response.data;
};

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/register', userData);
  
  // Store token
  localStorage.setItem('authToken', response.data.token);
  
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('authToken');
  window.location.href = '/login';
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/users/profile');
  return response.data;
};
```

---

## API Configuration

### Base URL
```typescript
const API_BASE_URL = 'http://localhost:8081';
// Production: 'https://your-backend-domain.com'
```

### Endpoints Overview

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/auth/login` | POST | No | User login |
| `/auth/register` | POST | No | User registration |
| `/auth/validate` | GET | No | Validate token |
| `/luxuryfashion/fetch-products-shop` | GET | No | Get all active products |
| `/luxuryfashion/product-picture/{filename}` | GET | No | Get product image |
| `/api/cart` | GET | Yes | Get user cart |
| `/api/cart/add` | POST | Yes | Add item to cart |
| `/api/cart/update/{id}` | PUT | Yes | Update cart item |
| `/api/cart/remove/{id}` | DELETE | Yes | Remove cart item |
| `/api/cart/clear` | DELETE | Yes | Clear cart |
| `/api/orders/place` | POST | Yes | Place order |
| `/api/orders/history` | GET | Yes | Get order history |
| `/api/payments/create-order/{orderId}` | POST | Yes | Create payment order |
| `/api/payments/verify` | POST | Yes | Verify payment |
| `/admin-api/fetch-products` | GET | Admin | Get all products |
| `/admin-api/add-product` | POST | Admin | Add product |

---

## Cart Integration

### 1. Add to Cart

**Important:** Always include the JWT token in the Authorization header!

```typescript
// CartService.ts
import api from './api';

interface CartItemDto {
  productId: number;
  quantity: number;
  size?: string; // Optional: "S", "M", "L", "36", "38", etc.
}

interface Cart {
  id: number;
  totalPrice: number;
  cartItems: CartItem[];
}

export const addToCart = async (item: CartItemDto): Promise<Cart> => {
  try {
    const response = await api.post<Cart>('/api/cart/add', item);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login to add items to cart.');
    }
    throw error;
  }
};

// Usage in component
const handleAddToCart = async (productId: number, size?: string) => {
  try {
    const cart = await addToCart({
      productId,
      quantity: 1,
      size: size || undefined
    });
    console.log('Item added to cart:', cart);
    // Update cart state
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      // Redirect to login
      window.location.href = '/login';
    } else {
      alert('Failed to add item to cart: ' + error.message);
    }
  }
};
```

### 2. Get Cart

```typescript
export const getCart = async (): Promise<Cart> => {
  const response = await api.get<Cart>('/api/cart');
  return response.data;
};

export const getCartItems = async (): Promise<CartItem[]> => {
  const response = await api.get<CartItem[]>('/api/cart/items');
  return response.data;
};

export const getCartCount = async (): Promise<number> => {
  const response = await api.get<number>('/api/cart/count');
  return response.data;
};
```

### 3. Update Cart Item

```typescript
export const updateCartItem = async (
  cartItemId: number,
  quantity: number
): Promise<Cart> => {
  const response = await api.put<Cart>(
    `/api/cart/update/${cartItemId}`,
    null,
    { params: { quantity } }
  );
  return response.data;
};
```

### 4. Remove Cart Item

```typescript
export const removeCartItem = async (cartItemId: number): Promise<Cart> => {
  const response = await api.delete<Cart>(`/api/cart/remove/${cartItemId}`);
  return response.data;
};
```

### 5. Clear Cart

```typescript
export const clearCart = async (): Promise<void> => {
  await api.delete('/api/cart/clear');
};
```

---

## Order Integration

### 1. Place Order

```typescript
// OrderService.ts
import api from './api';

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderRequest {
  address: Address;
  phoneNumber: string;
}

interface Order {
  id: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  payment?: {
    razorpay_order_id: string;
    amount: number;
    currency: string;
    key: string;
  };
}

export const placeOrder = async (
  orderData: OrderRequest
): Promise<Order> => {
  const response = await api.post<Order>('/api/orders/place', orderData);
  return response.data;
};

// Usage
const handlePlaceOrder = async () => {
  try {
    const order = await placeOrder({
      address: {
        street: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      phoneNumber: '+919876543210'
    });
    
    // If payment is included, initialize Razorpay
    if (order.payment) {
      initializeRazorpayPayment(order.payment, order);
    }
  } catch (error) {
    console.error('Failed to place order:', error);
  }
};
```

### 2. Get Order History

```typescript
export const getOrderHistory = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/api/orders/history');
  return response.data;
};

export const getOrderById = async (orderId: number): Promise<Order> => {
  const response = await api.get<Order>(`/api/orders/${orderId}`);
  return response.data;
};
```

---

## Payment Integration (Razorpay)

### 1. Install Razorpay SDK

```bash
npm install razorpay
# OR use CDN
```

### 2. Load Razorpay Script

```typescript
// utils/razorpay.ts
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
```

### 3. Create Payment Order

```typescript
// PaymentService.ts
import api from './api';

interface PaymentOrderResponse {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key: string;
  payment_id: number;
  order_id: number;
}

export const createPaymentOrder = async (
  orderId: number
): Promise<PaymentOrderResponse> => {
  const response = await api.post<PaymentOrderResponse>(
    `/api/payments/create-order/${orderId}`
  );
  return response.data;
};
```

### 4. Initialize Razorpay Checkout

```typescript
// PaymentService.ts
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const initializeRazorpayPayment = async (
  paymentData: PaymentOrderResponse,
  orderData: Order
) => {
  // Load Razorpay script
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error('Failed to load Razorpay SDK');
  }

  const options = {
    key: paymentData.key, // Razorpay Key ID
    amount: paymentData.amount * 100, // Convert to paise
    currency: paymentData.currency,
    name: 'LuxuryFashion',
    description: `Order #${orderData.id}`,
    order_id: paymentData.razorpay_order_id,
    handler: async (response: RazorpayResponse) => {
      // Verify payment
      await verifyPayment(response, orderData.id);
    },
    prefill: {
      name: orderData.user?.name || '',
      email: orderData.user?.email || '',
      contact: orderData.user?.phoneNumber || ''
    },
    theme: {
      color: '#3399cc'
    },
    modal: {
      ondismiss: () => {
        console.log('Payment cancelled');
      }
    }
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
```

### 5. Verify Payment

```typescript
export const verifyPayment = async (
  razorpayResponse: RazorpayResponse,
  orderId: number
): Promise<void> => {
  try {
    const response = await api.post('/api/payments/verify', {
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature
    });

    if (response.data.success) {
      alert('Payment successful! Your order has been confirmed.');
      window.location.href = `/orders/${orderId}/confirmation`;
    } else {
      alert('Payment verification failed. Please contact support.');
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    alert('Payment verification failed. Please contact support.');
  }
};
```

### 6. Complete Order Flow with Payment

```typescript
// Complete checkout flow
const handleCheckout = async (address: Address, phoneNumber: string) => {
  try {
    // Step 1: Place order
    const order = await placeOrder({ address, phoneNumber });
    
    // Step 2: Create payment order
    const paymentData = await createPaymentOrder(order.id);
    
    // Step 3: Initialize Razorpay
    await initializeRazorpayPayment(paymentData, order);
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Failed to process checkout. Please try again.');
  }
};
```

---

## Product Display

### 1. Fetch Products

```typescript
// ProductService.ts
import api from './api';

interface Product {
  prod_id: number;
  prod_name: string;
  prod_description: string;
  prod_price: number;
  selling_price: number;
  prod_category: string;
  prod_tag: string;
  prod_gender: string;
  prod_brand: string;
  imagenames: string[]; // Array of image URLs
  sizes: { [key: string]: number }; // Size quantities
  rating: number;
  badge?: string;
}

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>(
    '/luxuryfashion/fetch-products-shop'
  );
  return response.data;
};

// Product images are returned as URLs like:
// "/luxuryfashion/product-picture/filename.jpg"
// Use them directly in img src
```

### 2. Display Product Images

```typescript
// ProductCard.tsx
const ProductCard = ({ product }: { product: Product }) => {
  const getImageUrl = (imageName: string) => {
    // If imageName is already a full URL, use it
    if (imageName.startsWith('http')) {
      return imageName;
    }
    // Otherwise, construct the URL
    return `http://localhost:8081${imageName}`;
  };

  return (
    <div>
      {product.imagenames && product.imagenames.length > 0 && (
        <img
          src={getImageUrl(product.imagenames[0])}
          alt={product.prod_name}
        />
      )}
      <h3>{product.prod_name}</h3>
      <p>₹{product.selling_price}</p>
      {product.sizes && (
        <select>
          {Object.keys(product.sizes).map((size) => (
            <option key={size} value={size}>
              {size} ({product.sizes[size]} available)
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
```

---

## Admin Panel Integration

### 1. Fetch All Products (Admin)

```typescript
// AdminService.ts
export const fetchAllProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('/admin-api/fetch-products');
  return response.data;
};
```

### 2. Add Product (Admin)

```typescript
export const addProduct = async (productData: FormData): Promise<Product> => {
  const response = await api.post<Product>(
    '/admin-api/add-product',
    productData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// Usage
const handleAddProduct = async (product: ProductFormData) => {
  const formData = new FormData();
  formData.append('prod_name', product.name);
  formData.append('prod_description', product.description);
  formData.append('prod_price', product.price.toString());
  formData.append('selling_price', product.sellingPrice.toString());
  formData.append('prod_category', product.category);
  formData.append('prod_gender', product.gender);
  formData.append('prodStatus', 'active');
  
  // Add images
  product.images.forEach((image) => {
    formData.append('prod_photo', image);
  });
  
  await addProduct(formData);
};
```

### 3. Update Product (Admin)

```typescript
export const updateProduct = async (
  productId: number,
  productData: Partial<Product>
): Promise<Product> => {
  const response = await api.put<Product>(
    `/admin-api/update-product/${productId}`,
    productData
  );
  return response.data;
};
```

### 4. Delete Product (Admin)

```typescript
export const deleteProduct = async (productId: number): Promise<void> => {
  const response = await api.delete(`/admin-api/delete-product/${productId}`);
  
  // Response will indicate if it was soft delete or hard delete
  if (response.data.status === 'inactive') {
    console.log('Product set to inactive (has orders)');
  } else {
    console.log('Product deleted completely');
  }
};
```

---

## Error Handling

### Common Error Codes

| Status Code | Meaning | Action |
|------------|---------|--------|
| 401 | Unauthorized | Redirect to login, token expired/invalid |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource doesn't exist |
| 400 | Bad Request | Invalid input data |
| 500 | Server Error | Retry or show error message |

### Error Handler Utility

```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const message = error.response.data?.error || error.response.data?.message;
    
    switch (status) {
      case 401:
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return 'Please login to continue';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return 'Resource not found';
      case 400:
        return message || 'Invalid request';
      case 500:
        return 'Server error. Please try again later';
      default:
        return message || 'An error occurred';
    }
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection';
  } else {
    // Error setting up request
    return 'An unexpected error occurred';
  }
};

// Usage
try {
  await addToCart(item);
} catch (error) {
  const errorMessage = handleApiError(error);
  alert(errorMessage);
}
```

---

## Complete Example: React Cart Context

```typescript
// contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart, removeCartItem, updateCartItem } from '../services/CartService';
import { Cart, CartItem } from '../types';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addItem: (productId: number, quantity: number, size?: string) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  updateItem: (cartItemId: number, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    try {
      setLoading(true);
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      refreshCart();
    }
  }, []);

  const addItem = async (productId: number, quantity: number, size?: string) => {
    try {
      const updatedCart = await addToCart({ productId, quantity, size });
      setCart(updatedCart);
    } catch (error: any) {
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
      throw error;
    }
  };

  const removeItem = async (cartItemId: number) => {
    const updatedCart = await removeCartItem(cartItemId);
    setCart(updatedCart);
  };

  const updateItem = async (cartItemId: number, quantity: number) => {
    const updatedCart = await updateCartItem(cartItemId, quantity);
    setCart(updatedCart);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addItem,
        removeItem,
        updateItem,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
```

---

## Complete Example: Checkout Flow

```typescript
// components/Checkout.tsx
import { useState } from 'react';
import { placeOrder } from '../services/OrderService';
import { createPaymentOrder, initializeRazorpayPayment } from '../services/PaymentService';
import { loadRazorpayScript } from '../utils/razorpay';

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Place order
      const order = await placeOrder({ address, phoneNumber });

      // Step 2: Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Step 3: Create payment order
      const paymentData = await createPaymentOrder(order.id);

      // Step 4: Initialize Razorpay checkout
      await initializeRazorpayPayment(paymentData, order);
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCheckout}>
      {/* Address form */}
      <input
        type="text"
        placeholder="Street"
        value={address.street}
        onChange={(e) => setAddress({ ...address, street: e.target.value })}
        required
      />
      {/* Other address fields */}
      <input
        type="tel"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Place Order & Pay'}
      </button>
    </form>
  );
};
```

---

## TypeScript Types

```typescript
// types/index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  phoneNumber?: string;
  address?: Address;
}

export interface Product {
  prod_id: number;
  prod_name: string;
  prod_description: string;
  prod_price: number;
  selling_price: number;
  prod_category: string;
  prod_tag: string;
  prod_gender: string;
  prod_brand: string;
  imagenames: string[];
  sizes: { [key: string]: number };
  rating: number;
  badge?: string;
  prodStatus: 'active' | 'inactive';
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  size?: string;
}

export interface Cart {
  id: number;
  totalPrice: number;
  cartItems: CartItem[];
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  size?: string;
}

export interface Order {
  id: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  orderDate: string;
  payment?: PaymentOrderResponse;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentOrderResponse {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key: string;
  payment_id: number;
  order_id: number;
}
```

---

## Quick Reference

### Authentication Headers
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Image URLs
```typescript
// Product images
const imageUrl = `http://localhost:8081${product.imagenames[0]}`;

// Profile pictures
const profileUrl = `http://localhost:8081${user.profilePicture}`;
```

### Common Patterns

1. **Check Authentication Before API Call**
```typescript
const token = localStorage.getItem('authToken');
if (!token) {
  window.location.href = '/login';
  return;
}
```

2. **Handle 401 Errors Globally**
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

3. **Show Loading States**
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await apiCall();
  } finally {
    setLoading(false);
  }
};
```

---

## Testing

### Test Endpoints
- Base URL: `http://localhost:8081`
- Test with Postman/Thunder Client:
  1. Login: `POST /auth/login`
  2. Copy token from response
  3. Add to headers: `Authorization: Bearer <token>`
  4. Test cart: `POST /api/cart/add`

### Test Payment
- Use Razorpay test keys
- Test card: `4111 1111 1111 1111`
- Any CVV, any future expiry date

---

## Support

For issues:
1. Check browser console for errors
2. Verify token is being sent in headers
3. Check network tab for API responses
4. Verify CORS is configured correctly
5. Check backend logs for errors

---

## Next Steps

1. **Set up Axios interceptors** for automatic token handling
2. **Create service files** for each API category (Auth, Cart, Order, Payment)
3. **Implement error boundaries** for better error handling
4. **Add loading states** for better UX
5. **Test payment flow** with Razorpay test cards






