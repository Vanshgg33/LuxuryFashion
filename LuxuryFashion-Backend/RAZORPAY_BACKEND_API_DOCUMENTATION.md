# Razorpay Backend API Documentation

## Overview
Complete API documentation for Razorpay payment integration endpoints. All endpoints require authentication except the webhook endpoint.

**Base URL:** `http://localhost:8081` (Development)  
**Production:** `https://your-backend-domain.com`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Payment APIs](#payment-apis)
3. [Order APIs](#order-apis)
4. [Error Handling](#error-handling)
5. [Response Formats](#response-formats)

---

## Authentication

All payment endpoints (except webhook) require JWT authentication.

### Headers Required:
```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Getting the Token:
1. Login: `POST /auth/login`
2. Register: `POST /auth/register`
3. Token is returned in response and should be stored in `localStorage`

---

## Payment APIs

### 1. Create Payment Order

Creates a Razorpay order for an existing order. This is typically called automatically when placing an order, but can be called separately if needed.

**Endpoint:** `POST /api/payments/create-order/{orderId}`

**Authentication:** Required (User)

**Path Parameters:**
- `orderId` (Long) - The order ID for which to create payment

**Request Example:**
```http
POST /api/payments/create-order/123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "razorpay_order_id": "order_MN1234567890",
  "amount": 1999.00,
  "currency": "INR",
  "currency_code": "INR",
  "currency_symbol": "₹",
  "currency_name": "Rupees",
  "amount_formatted": "₹1,999.00",
  "key": "rzp_test_RdcgBs8hLIAVc7",
  "payment_id": 1,
  "order_id": 123
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "error": "Order not found"
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to create payment order",
  "message": "Error details..."
}
```

---

### 2. Verify Payment

Verifies payment signature after successful payment completion. This should be called immediately after Razorpay checkout completes.

**Endpoint:** `POST /api/payments/verify`

**Authentication:** Required (User)

**Request Body:**
```json
{
  "razorpay_order_id": "order_MN1234567890",
  "razorpay_payment_id": "pay_MN1234567890",
  "razorpay_signature": "abc123def456..."
}
```

**Request Example:**
```http
POST /api/payments/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "razorpay_order_id": "order_MN1234567890",
  "razorpay_payment_id": "pay_MN1234567890",
  "razorpay_signature": "abc123def456..."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "payment_id": 1,
  "order_id": 123,
  "status": "CAPTURED",
  "amount": 1999.00,
  "currency": "INR",
  "currency_code": "INR",
  "currency_symbol": "₹",
  "currency_name": "Rupees",
  "amount_formatted": "₹1,999.00",
  "message": "Payment verified successfully"
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "Payment verification failed",
  "message": "Invalid payment signature"
}
```

**400 Bad Request (Missing Data):**
```json
{
  "error": "Missing payment verification data"
}
```

---

### 3. Get Payment Details by Order ID

Retrieves payment details for a specific order.

**Endpoint:** `GET /api/payments/order/{orderId}`

**Authentication:** Required (User/Admin)

**Path Parameters:**
- `orderId` (Long) - The order ID

**Request Example:**
```http
GET /api/payments/order/123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "razorpayOrderId": "order_MN1234567890",
  "razorpayPaymentId": "pay_MN1234567890",
  "razorpaySignature": "abc123def456...",
  "amount": 1999.00,
  "currency": "INR",
  "status": "CAPTURED",
  "paymentMethod": "card",
  "bank": null,
  "wallet": null,
  "vpa": null,
  "notes": "Order ID: 123",
  "createdAt": "2024-01-15T10:30:00",
  "paidAt": "2024-01-15T10:31:00",
  "failureReason": null
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "error": "Payment not found",
  "message": "Payment not found for order ID: 123"
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied"
}
```

---

### 4. Get Payment Details by Razorpay Order ID

Retrieves payment details using Razorpay order ID.

**Endpoint:** `GET /api/payments/razorpay-order/{razorpayOrderId}`

**Authentication:** Required (User/Admin)

**Path Parameters:**
- `razorpayOrderId` (String) - The Razorpay order ID (e.g., "order_MN1234567890")

**Request Example:**
```http
GET /api/payments/razorpay-order/order_MN1234567890
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "razorpayOrderId": "order_MN1234567890",
  "razorpayPaymentId": "pay_MN1234567890",
  "razorpaySignature": "abc123def456...",
  "amount": 1999.00,
  "currency": "INR",
  "status": "CAPTURED",
  "paymentMethod": "card",
  "createdAt": "2024-01-15T10:30:00",
  "paidAt": "2024-01-15T10:31:00"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "error": "Payment not found",
  "message": "Payment not found for Razorpay order ID: order_MN1234567890"
}
```

---

### 5. Get Currency Information

Returns currency information (INR, ₹, Rupees).

**Endpoint:** `GET /api/payments/currency`

**Authentication:** Not Required

**Request Example:**
```http
GET /api/payments/currency
```

**Success Response (200 OK):**
```json
{
  "currency": {
    "code": "INR",
    "symbol": "₹",
    "name": "Rupees"
  }
}
```

---

### 6. Process Refund (Admin Only)

Processes a refund for a payment. Only admins can access this endpoint.

**Endpoint:** `POST /api/payments/refund/{paymentId}`

**Authentication:** Required (Admin)

**Path Parameters:**
- `paymentId` (Long) - The payment ID to refund

**Request Body:**
```json
{
  "amount": 1999.00
}
```

**Request Example:**
```http
POST /api/payments/refund/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 1999.00
}
```

**Success Response (200 OK):**
```json
{
  "refund_id": "rfnd_MN1234567890",
  "amount": 199900,
  "status": "processed",
  "payment_status": "REFUNDED",
  "currency": "INR",
  "currency_code": "INR",
  "currency_symbol": "₹",
  "currency_name": "Rupees",
  "amount_formatted": "₹1,999.00"
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "Invalid refund amount"
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied. Admin role required."
}
```

**500 Internal Server Error:**
```json
{
  "error": "Refund failed",
  "message": "Error details..."
}
```

---

### 7. Razorpay Webhook (Public)

Receives webhook events from Razorpay. This endpoint is public and doesn't require authentication, but should verify webhook signature.

**Endpoint:** `POST /api/payments/webhook`

**Authentication:** Not Required (Public Endpoint)

**Headers:**
```http
X-Razorpay-Signature: <webhook_signature>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "id": "pay_MN1234567890",
      "entity": "payment",
      "amount": 199900,
      "currency": "INR",
      "status": "captured",
      "method": "card",
      "created_at": 1705312200
    },
    "order": {
      "id": "order_MN1234567890",
      "entity": "order",
      "amount": 199900,
      "currency": "INR",
      "receipt": "order_123"
    }
  }
}
```

**Success Response (200 OK):**
```json
{
  "status": "success"
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "Webhook processing failed",
  "message": "Error details..."
}
```

---

## Order APIs

### 1. Place Order with Payment

Places an order and automatically creates a Razorpay payment order. This is the main endpoint for checkout.

**Endpoint:** `POST /api/orders/place`

**Authentication:** Required (User)

**Request Body:**
```json
{
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "phoneNumber": "+919876543210"
}
```

**Request Example:**
```http
POST /api/orders/place
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "phoneNumber": "+919876543210"
}
```

**Success Response (200 OK):**
```json
{
  "order": {
    "id": 123,
    "totalPrice": 1999.00,
    "status": "PENDING",
    "orderDate": "2024-01-15T10:30:00",
    "items": [
      {
        "id": 1,
        "product": {
          "prod_id": 1,
          "prod_name": "Product Name",
          "selling_price": 1999
        },
        "quantity": 1,
        "price": 1999.00,
        "size": "M"
      }
    ],
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "payment": {
    "razorpay_order_id": "order_MN1234567890",
    "amount": 1999.00,
    "currency": "INR",
    "currency_code": "INR",
    "currency_symbol": "₹",
    "currency_name": "Rupees",
    "amount_formatted": "₹1,999.00",
    "key": "rzp_test_RdcgBs8hLIAVc7",
    "payment_id": 1,
    "order_id": 123
  },
  "currency": {
    "code": "INR",
    "symbol": "₹",
    "name": "Rupees"
  }
}
```

**Partial Success Response (206 Partial Content):**
If payment creation fails but order is placed:
```json
{
  "order": {
    "id": 123,
    "totalPrice": 1999.00,
    "status": "PENDING"
  },
  "currency": {
    "code": "INR",
    "symbol": "₹",
    "name": "Rupees"
  },
  "payment_error": "Failed to initialize payment: Error details..."
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "Address is required"
}
```

**400 Bad Request (Empty Cart):**
```json
{
  "error": "Cart is empty"
}
```

---

## Complete Frontend Integration Example

### TypeScript/React Example

```typescript
// services/paymentApi.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Create axios instance with auth
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 1. Place Order and Get Payment Details
export const placeOrder = async (orderData: {
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phoneNumber: string;
}) => {
  const response = await api.post('/api/orders/place', orderData);
  return response.data;
};

// 2. Create Payment Order (if needed separately)
export const createPaymentOrder = async (orderId: number) => {
  const response = await api.post(`/api/payments/create-order/${orderId}`);
  return response.data;
};

// 3. Verify Payment
export const verifyPayment = async (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const response = await api.post('/api/payments/verify', paymentData);
  return response.data;
};

// 4. Get Payment Details by Order ID
export const getPaymentByOrderId = async (orderId: number) => {
  const response = await api.get(`/api/payments/order/${orderId}`);
  return response.data;
};

// 5. Get Payment Details by Razorpay Order ID
export const getPaymentByRazorpayOrderId = async (razorpayOrderId: string) => {
  const response = await api.get(`/api/payments/razorpay-order/${razorpayOrderId}`);
  return response.data;
};

// 6. Get Currency Information
export const getCurrencyInfo = async () => {
  const response = await api.get('/api/payments/currency');
  return response.data;
};

// 7. Process Refund (Admin only)
export const refundPayment = async (paymentId: number, amount: number) => {
  const response = await api.post(`/api/payments/refund/${paymentId}`, {
    amount: amount,
  });
  return response.data;
};
```

### Usage in React Component

```typescript
// components/Checkout.tsx
import React, { useState } from 'react';
import { placeOrder, verifyPayment } from '../services/paymentApi';
import { loadRazorpayScript } from '../utils/razorpay';

const Checkout: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // 1. Place order and get payment details
      const { order, payment } = await placeOrder({
        address: {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
        },
        phoneNumber: '+919876543210',
      });

      // 2. Load Razorpay script
      await loadRazorpayScript();

      // 3. Initialize Razorpay Checkout
      const options = {
        key: payment.key,
        amount: payment.amount * 100, // Convert to paise
        currency: payment.currency,
        order_id: payment.razorpay_order_id,
        name: 'LuxuryFashion',
        description: `Order #${order.id}`,
        handler: async (response: any) => {
          // 4. Verify payment
          try {
            const verification = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verification.success) {
              alert('Payment successful!');
              // Redirect to success page
              window.location.href = `/orders/${order.id}/success`;
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: order.user?.name || '',
          email: order.user?.email || '',
          contact: order.user?.phoneNumber || '',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handlePlaceOrder} disabled={loading}>
        {loading ? 'Processing...' : 'Place Order & Pay'}
      </button>
    </div>
  );
};

export default Checkout;
```

---

## Error Handling

### Common HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **206 Partial Content** - Order placed but payment creation failed
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Missing or invalid authentication token
- **403 Forbidden** - User doesn't have permission
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

### Error Response Format

```json
{
  "error": "Error message",
  "message": "Detailed error message (optional)"
}
```

---

## Response Formats

### Payment Status Values

- `PENDING` - Payment initiated but not completed
- `CAPTURED` - Payment successfully captured
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded
- `PARTIALLY_REFUNDED` - Partial refund processed

### Order Status Values

- `PENDING` - Order placed, payment pending
- `CONFIRMED` - Payment confirmed, order confirmed
- `SHIPPED` - Order shipped
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled

---

## Testing

### Test Cards (Razorpay Test Mode)

**Success Card:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

**Failure Card:**
- Card Number: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Test UPI IDs
- `success@razorpay`
- `failure@razorpay`

---

## Quick Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/orders/place` | POST | User | Place order with payment |
| `/api/payments/create-order/{orderId}` | POST | User | Create payment order |
| `/api/payments/verify` | POST | User | Verify payment |
| `/api/payments/order/{orderId}` | GET | User/Admin | Get payment by order ID |
| `/api/payments/razorpay-order/{id}` | GET | User/Admin | Get payment by Razorpay order ID |
| `/api/payments/currency` | GET | Public | Get currency info |
| `/api/payments/refund/{paymentId}` | POST | Admin | Process refund |
| `/api/payments/webhook` | POST | Public | Razorpay webhook |

---

## Support

For issues or questions:
1. Check payment logs in database (`payment_logs` table)
2. Review application logs
3. Verify Razorpay Dashboard for transaction status
4. Check webhook delivery in Razorpay Dashboard





