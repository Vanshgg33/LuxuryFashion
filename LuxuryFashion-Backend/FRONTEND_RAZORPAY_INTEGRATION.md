# Frontend Razorpay Payment Integration Guide

## Overview
This guide will help you integrate Razorpay payment gateway into the LuxuryFashion frontend application. The integration uses Razorpay Checkout for a seamless payment experience.

## Prerequisites

1. **Install Razorpay SDK**
   ```bash
   # For React/Next.js
   npm install razorpay
   
   # Or use CDN
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```

2. **Get Razorpay Key ID**
   - The key ID is returned from the backend when creating a payment order
   - You don't need to store it separately

## Payment Flow

```
1. User clicks "Place Order"
   ↓
2. Frontend calls POST /api/orders/place
   ↓
3. Backend creates order + Razorpay order
   ↓
4. Frontend receives order + payment details
   ↓
5. Frontend initializes Razorpay Checkout
   ↓
6. User completes payment on Razorpay
   ↓
7. Frontend calls POST /api/payments/verify
   ↓
8. Backend verifies payment and updates order status
   ↓
9. Frontend shows success/failure message
```

## Step-by-Step Integration

### Step 1: Place Order and Get Payment Details

When user clicks "Place Order", call the order placement endpoint:

```javascript
// Example: React component
const handlePlaceOrder = async (orderData) => {
  try {
    const response = await fetch('/api/orders/place', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Your auth token
      },
      body: JSON.stringify({
        address: {
          street: orderData.address.street,
          city: orderData.address.city,
          state: orderData.address.state,
          zipCode: orderData.address.zipCode,
          country: orderData.address.country
        },
        phoneNumber: orderData.phoneNumber
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      // Order created successfully
      const { order, payment } = data;
      
      // Initialize Razorpay payment
      initializeRazorpayPayment(payment, order);
    } else {
      // Handle error
      console.error('Order placement failed:', data.error);
      alert('Failed to place order: ' + data.error);
    }
  } catch (error) {
    console.error('Error placing order:', error);
    alert('An error occurred while placing the order');
  }
};
```

### Step 2: Initialize Razorpay Checkout

Create a function to initialize Razorpay payment:

```javascript
const initializeRazorpayPayment = (paymentData, orderData) => {
  // Load Razorpay script if not already loaded
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => {
    openRazorpayCheckout(paymentData, orderData);
  };
  document.body.appendChild(script);
};

const openRazorpayCheckout = (paymentData, orderData) => {
  const options = {
    key: paymentData.key, // Razorpay Key ID from backend
    amount: paymentData.amount * 100, // Amount in paise (multiply by 100)
    currency: paymentData.currency, // INR
    name: 'LuxuryFashion',
    description: `Order #${paymentData.order_id}`,
    order_id: paymentData.razorpay_order_id, // Razorpay order ID
    handler: async function (response) {
      // Payment successful - verify payment
      await verifyPayment(response, orderData);
    },
    prefill: {
      name: orderData.user?.name || '',
      email: orderData.user?.email || '',
      contact: orderData.user?.phoneNumber || ''
    },
    theme: {
      color: '#3399cc' // Your brand color
    },
    modal: {
      ondismiss: function() {
        // User closed the payment modal
        console.log('Payment cancelled by user');
        // Optionally show a message or redirect
      }
    }
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
```

### Step 3: Verify Payment

After successful payment, verify it with the backend:

```javascript
const verifyPayment = async (razorpayResponse, orderData) => {
  try {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Payment verified successfully
      console.log('Payment verified:', data);
      
      // Show success message
      alert('Payment successful! Your order has been confirmed.');
      
      // Redirect to order confirmation page
      window.location.href = `/orders/${data.order_id}/confirmation`;
      
      // Or update UI
      // setOrderStatus('confirmed');
      // setPaymentStatus('captured');
    } else {
      // Payment verification failed
      console.error('Payment verification failed:', data);
      alert('Payment verification failed. Please contact support.');
      
      // Optionally redirect to order page
      window.location.href = `/orders/${orderData.id}`;
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    alert('An error occurred while verifying payment. Please contact support.');
  }
};
```

## Complete React Component Example

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const CheckoutPage = () => {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const loadRazorpayScript = () => {
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

  const handlePlaceOrder = async (orderRequest) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/orders/place', orderRequest, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const { order, payment } = response.data;
      setOrderData(order);

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Initialize Razorpay payment
      const options = {
        key: payment.key,
        amount: payment.amount * 100, // Convert to paise
        currency: payment.currency,
        name: 'LuxuryFashion',
        description: `Order #${order.id}`,
        order_id: payment.razorpay_order_id,
        handler: async (response) => {
          await verifyPayment(response, order.id);
        },
        prefill: {
          name: order.user?.name || '',
          email: order.user?.email || '',
          contact: order.user?.phoneNumber || ''
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            alert('Payment cancelled. You can try again later.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.error || 'Failed to place order');
      setLoading(false);
    }
  };

  const verifyPayment = async (razorpayResponse, orderId) => {
    try {
      const response = await axios.post('/api/payments/verify', {
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        alert('Payment successful! Your order has been confirmed.');
        window.location.href = `/orders/${orderId}/confirmation`;
      } else {
        alert('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Your checkout form */}
      <button 
        onClick={() => handlePlaceOrder(orderRequest)}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Place Order & Pay'}
      </button>
    </div>
  );
};

export default CheckoutPage;
```

## Vue.js Example

```vue
<template>
  <div>
    <button @click="placeOrder" :disabled="loading">
      {{ loading ? 'Processing...' : 'Place Order & Pay' }}
    </button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      loading: false
    };
  },
  methods: {
    async loadRazorpayScript() {
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
    },

    async placeOrder() {
      this.loading = true;
      try {
        const response = await axios.post('/api/orders/place', {
          address: this.address,
          phoneNumber: this.phoneNumber
        }, {
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`
          }
        });

        const { order, payment } = response.data;

        // Load Razorpay
        const loaded = await this.loadRazorpayScript();
        if (!loaded) {
          alert('Razorpay SDK failed to load');
          this.loading = false;
          return;
        }

        // Open Razorpay checkout
        const options = {
          key: payment.key,
          amount: payment.amount * 100,
          currency: payment.currency,
          name: 'LuxuryFashion',
          description: `Order #${order.id}`,
          order_id: payment.razorpay_order_id,
          handler: (response) => {
            this.verifyPayment(response, order.id);
          },
          prefill: {
            name: order.user?.name || '',
            email: order.user?.email || '',
            contact: order.user?.phoneNumber || ''
          },
          theme: {
            color: '#3399cc'
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();

      } catch (error) {
        console.error('Error:', error);
        alert(error.response?.data?.error || 'Failed to place order');
        this.loading = false;
      }
    },

    async verifyPayment(razorpayResponse, orderId) {
      try {
        const response = await axios.post('/api/payments/verify', {
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature
        }, {
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`
          }
        });

        if (response.data.success) {
          alert('Payment successful!');
          this.$router.push(`/orders/${orderId}/confirmation`);
        } else {
          alert('Payment verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        alert('Payment verification failed');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

## API Endpoints Reference

### 1. Place Order
**POST** `/api/orders/place`

**Request:**
```json
{
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "phoneNumber": "+919876543210"
}
```

**Response:**
```json
{
  "order": {
    "id": 1,
    "totalPrice": 1000.00,
    "status": "PENDING",
    "items": [...],
    "user": {...}
  },
  "payment": {
    "razorpay_order_id": "order_xxx",
    "amount": 1000.00,
    "currency": "INR",
    "key": "rzp_test_xxx",
    "payment_id": 1,
    "order_id": 1
  }
}
```

### 2. Verify Payment
**POST** `/api/payments/verify`

**Request:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "payment_id": 1,
  "order_id": 1,
  "status": "CAPTURED",
  "message": "Payment verified successfully"
}
```

### 3. Get Payment Details
**GET** `/api/payments/order/{orderId}`

**Response:**
```json
{
  "id": 1,
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "amount": 1000.00,
  "currency": "INR",
  "status": "CAPTURED",
  "paymentMethod": "card",
  "paidAt": "2024-01-01T12:00:00"
}
```

## Error Handling

### Common Errors

1. **Order Placement Failed**
   ```javascript
   if (!response.ok) {
     const error = await response.json();
     console.error('Order failed:', error.error);
     // Show error to user
   }
   ```

2. **Payment Cancelled**
   ```javascript
   modal: {
     ondismiss: function() {
       // User closed payment modal
       alert('Payment cancelled. You can try again.');
     }
   }
   ```

3. **Payment Verification Failed**
   ```javascript
   if (!data.success) {
     // Payment failed or signature invalid
     alert('Payment verification failed. Please contact support.');
   }
   ```

4. **Network Errors**
   ```javascript
   try {
     // API call
   } catch (error) {
     if (error.message === 'Network Error') {
       alert('Network error. Please check your connection.');
     } else {
       alert('An error occurred. Please try again.');
     }
   }
   ```

## Best Practices

### 1. Always Verify Payment
Never trust the frontend payment response. Always verify with backend:
```javascript
// ❌ Don't do this
if (razorpayResponse.razorpay_payment_id) {
  // Assume payment successful
}

// ✅ Do this
await verifyPayment(razorpayResponse);
```

### 2. Handle Loading States
Show loading indicators during payment process:
```javascript
const [loading, setLoading] = useState(false);

// Set loading before API calls
setLoading(true);
// ... API call
setLoading(false);
```

### 3. Store Order ID
Store order ID before payment to handle failures:
```javascript
const orderId = order.id;
localStorage.setItem('pendingOrderId', orderId);

// On payment failure, redirect to order page
window.location.href = `/orders/${orderId}`;
```

### 4. Error Messages
Provide clear error messages to users:
```javascript
const errorMessages = {
  'Payment verification failed': 'Your payment was received but verification failed. Please contact support.',
  'Network Error': 'Please check your internet connection and try again.',
  'Payment cancelled': 'Payment was cancelled. You can try again.'
};
```

### 5. Retry Logic
Implement retry for failed verifications:
```javascript
const verifyPaymentWithRetry = async (response, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await verifyPayment(response);
      return result;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## Testing

### Test Mode
- Use test keys from Razorpay Dashboard
- Test cards:
  - **Success**: `4111 1111 1111 1111`
  - **Failure**: `4000 0000 0000 0002`
  - **3D Secure**: `5267 3181 8797 5449`

### Test Flow
1. Place order with test data
2. Use test card for payment
3. Verify payment is captured
4. Check order status updates

## UI/UX Recommendations

### 1. Payment Button
```jsx
<button 
  className="payment-button"
  onClick={handlePlaceOrder}
  disabled={loading || !isFormValid}
>
  {loading ? (
    <>
      <Spinner /> Processing...
    </>
  ) : (
    <>
      <LockIcon /> Place Order & Pay Securely
    </>
  )}
</button>
```

### 2. Payment Status Indicator
```jsx
{paymentStatus === 'pending' && (
  <div className="payment-pending">
    <ClockIcon /> Payment in progress...
  </div>
)}

{paymentStatus === 'success' && (
  <div className="payment-success">
    <CheckIcon /> Payment successful!
  </div>
)}

{paymentStatus === 'failed' && (
  <div className="payment-failed">
    <ErrorIcon /> Payment failed. Please try again.
  </div>
)}
```

### 3. Order Confirmation Page
```jsx
const OrderConfirmation = ({ orderId }) => {
  return (
    <div className="order-confirmation">
      <h1>Order Confirmed!</h1>
      <p>Order ID: {orderId}</p>
      <p>Payment Status: Confirmed</p>
      <button onClick={() => navigate('/orders')}>
        View Orders
      </button>
    </div>
  );
};
```

## Security Considerations

1. **Never Store Payment Details**
   - Don't store Razorpay payment IDs in localStorage
   - Don't log sensitive payment information

2. **Always Use HTTPS**
   - Ensure your site uses HTTPS in production
   - Razorpay requires HTTPS for live payments

3. **Verify on Backend**
   - Always verify payment signature on backend
   - Don't trust frontend payment status

4. **Handle Webhooks**
   - Backend handles webhooks automatically
   - Frontend doesn't need to handle webhooks

## Troubleshooting

### Issue: Razorpay modal not opening
**Solution:** Check if script is loaded:
```javascript
if (!window.Razorpay) {
  console.error('Razorpay SDK not loaded');
  // Reload script
}
```

### Issue: Payment verification fails
**Solution:** Check signature format:
```javascript
// Ensure all three fields are present
{
  razorpay_order_id: response.razorpay_order_id,
  razorpay_payment_id: response.razorpay_payment_id,
  razorpay_signature: response.razorpay_signature
}
```

### Issue: Amount mismatch
**Solution:** Convert amount to paise:
```javascript
amount: paymentData.amount * 100 // Convert to paise
```

## Support

For issues:
1. Check browser console for errors
2. Verify API endpoints are correct
3. Check network tab for API responses
4. Contact backend team for payment verification issues

## Additional Resources

- [Razorpay Checkout Documentation](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- [Razorpay React Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/react/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/test-cards/)






