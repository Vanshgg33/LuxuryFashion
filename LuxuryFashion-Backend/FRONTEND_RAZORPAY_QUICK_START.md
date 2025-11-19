# Razorpay Frontend Integration - Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Install Razorpay SDK
```bash
npm install razorpay
# OR use CDN: <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 2. Place Order & Get Payment Details
```javascript
const response = await fetch('/api/orders/place', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    address: { /* address object */ },
    phoneNumber: '+919876543210'
  })
});

const { order, payment } = await response.json();
```

### 3. Initialize Razorpay Checkout
```javascript
const options = {
  key: payment.key,                    // From backend
  amount: payment.amount * 100,        // Convert to paise
  currency: payment.currency,         // INR
  order_id: payment.razorpay_order_id, // From backend
  name: 'LuxuryFashion',
  description: `Order #${order.id}`,
  handler: async function(response) {
    // Verify payment
    await verifyPayment(response);
  },
  prefill: {
    name: order.user?.name || '',
    email: order.user?.email || '',
    contact: order.user?.phoneNumber || ''
  },
  theme: { color: '#3399cc' }
};

const razorpay = new window.Razorpay(options);
razorpay.open();
```

### 4. Verify Payment
```javascript
const verifyPayment = async (razorpayResponse) => {
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
  
  if (data.success) {
    // ✅ Payment successful!
    window.location.href = `/orders/${data.order_id}/confirmation`;
  } else {
    // ❌ Payment verification failed
    alert('Payment verification failed');
  }
};
```

## 📋 Complete Example (Copy-Paste Ready)

```javascript
// React Hook Example
import { useState } from 'react';

const useRazorpayPayment = () => {
  const [loading, setLoading] = useState(false);

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

  const placeOrderAndPay = async (orderData) => {
    setLoading(true);
    try {
      // Step 1: Place order
      const orderResponse = await fetch('/api/orders/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        throw new Error('Order placement failed');
      }

      const { order, payment } = await orderResponse.json();

      // Step 2: Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Step 3: Open Razorpay checkout
      const options = {
        key: payment.key,
        amount: payment.amount * 100,
        currency: payment.currency,
        order_id: payment.razorpay_order_id,
        name: 'LuxuryFashion',
        description: `Order #${order.id}`,
        handler: async (response) => {
          // Step 4: Verify payment
          await verifyPayment(response, order.id);
        },
        prefill: {
          name: order.user?.name || '',
          email: order.user?.email || '',
          contact: order.user?.phoneNumber || ''
        },
        theme: { color: '#3399cc' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            alert('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Payment failed');
      setLoading(false);
    }
  };

  const verifyPayment = async (razorpayResponse, orderId) => {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Payment successful!');
        window.location.href = `/orders/${orderId}/confirmation`;
      } else {
        alert('Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  return { placeOrderAndPay, loading };
};

// Usage in component
const CheckoutPage = () => {
  const { placeOrderAndPay, loading } = useRazorpayPayment();

  const handleCheckout = () => {
    placeOrderAndPay({
      address: { /* address */ },
      phoneNumber: '+919876543210'
    });
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Processing...' : 'Place Order & Pay'}
    </button>
  );
};
```

## 🔑 Key Points

1. **Always multiply amount by 100** (convert to paise)
   ```javascript
   amount: payment.amount * 100
   ```

2. **Always verify payment** after Razorpay response
   ```javascript
   handler: async (response) => {
     await verifyPayment(response);
   }
   ```

3. **Handle payment cancellation**
   ```javascript
   modal: {
     ondismiss: () => {
       // User closed payment modal
     }
   }
   ```

4. **Use order_id from backend** (not order ID)
   ```javascript
   order_id: payment.razorpay_order_id
   ```

## 📡 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/orders/place` | POST | Place order & get payment details |
| `/api/payments/verify` | POST | Verify payment after completion |
| `/api/payments/order/{orderId}` | GET | Get payment details |

## ⚠️ Common Mistakes

1. ❌ **Not converting amount to paise**
   ```javascript
   amount: payment.amount  // Wrong!
   amount: payment.amount * 100  // Correct!
   ```

2. ❌ **Not verifying payment**
   ```javascript
   handler: (response) => {
     // Assuming payment is successful - Wrong!
   }
   ```

3. ❌ **Using wrong order_id**
   ```javascript
   order_id: order.id  // Wrong!
   order_id: payment.razorpay_order_id  // Correct!
   ```

## 🧪 Testing

### Test Cards
- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test Flow
1. Place order → Get payment details
2. Open Razorpay modal
3. Use test card
4. Verify payment
5. Check order status

## 📚 Full Documentation

See `FRONTEND_RAZORPAY_INTEGRATION.md` for:
- Complete React/Vue examples
- Error handling
- Best practices
- Troubleshooting
- UI/UX recommendations






