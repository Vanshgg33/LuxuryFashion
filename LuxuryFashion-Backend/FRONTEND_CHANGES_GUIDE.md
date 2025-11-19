# Frontend Changes Guide - Payment API Refactoring

## Quick Summary (10 Lines)

1. **Remove:** All `/api/payments/*` API calls (create-order, verify, order/{id}, refund, currency)
2. **Change:** Payment verification from `POST /api/payments/verify` to `POST /api/orders/verify-payment`
3. **Add:** `order_id` field to payment verification request: `{order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature}`
4. **Update:** Access payment data from Order object: use `order.paymentStatus` instead of `order.payment.status`
5. **Remove:** Separate payment fetching - payment info is included in order responses automatically
6. **Update:** Order placement response - `payment` object now has `razorpay_order_id`, `amount`, `key` (no `payment_id`)
7. **Change:** Payment status enum is now `Order.PaymentStatus`: PENDING, CAPTURED, FAILED, REFUNDED, PARTIALLY_REFUNDED
8. **Delete:** Payment service/API files - consolidate payment logic into order service
9. **Update:** After Razorpay checkout, call `/api/orders/verify-payment` with `order_id` from placed order
10. **Update:** Order history/details now include payment fields directly - no separate payment fetch needed

---

## Regular Frontend (User) Changes

### 1. Update Order Interface

```typescript
// ❌ Remove this
interface Order {
  payment?: {
    id: number;
    status: string;
    razorpayOrderId: string;
  };
}

// ✅ Use this
interface Order {
  paymentStatus: 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  paidAt?: string;
}
```

### 2. Update Payment Verification

**Before:**
```typescript
POST /api/payments/verify
{
  "razorpay_order_id": "...",
  "razorpay_payment_id": "...",
  "razorpay_signature": "..."
}
```

**After:**
```typescript
POST /api/orders/verify-payment
{
  "order_id": "123",  // ⚠️ NEW: Must include
  "razorpay_order_id": "...",
  "razorpay_payment_id": "...",
  "razorpay_signature": "..."
}
```

### 3. Complete Payment Flow Example

```typescript
// 1. Place Order
const placeOrder = async (orderData) => {
  const response = await api.post('/api/orders/place', orderData);
  const { order, payment } = response.data;
  // Store order.id for verification
  return { order, payment, orderId: order.id };
};

// 2. Razorpay Checkout
const openRazorpay = (payment, orderId) => {
  const options = {
    key: payment.key,
    amount: payment.amount * 100,
    currency: payment.currency,
    order_id: payment.razorpay_order_id,
    handler: async (razorpayResponse) => {
      await verifyPayment(orderId, razorpayResponse);
    }
  };
  new window.Razorpay(options).open();
};

// 3. Verify Payment (UPDATED)
const verifyPayment = async (orderId, razorpayResponse) => {
  const response = await api.post('/api/orders/verify-payment', {
    order_id: orderId.toString(),  // ⚠️ NEW
    razorpay_order_id: razorpayResponse.razorpay_order_id,
    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
    razorpay_signature: razorpayResponse.razorpay_signature
  });
  
  if (response.data.success) {
    // Payment verified!
  }
};

// 4. Get Order (payment included)
const getOrder = async (orderId) => {
  const response = await api.get(`/api/orders/${orderId}`);
  const order = response.data;
  
  // Access payment info directly
  console.log(order.paymentStatus);      // "CAPTURED"
  console.log(order.razorpayOrderId);    // "order_xxx"
  console.log(order.paidAt);             // payment timestamp
};
```

---

## Admin Panel Changes

### 1. Update Order Interface

```typescript
interface Order {
  id: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  paymentBank?: string;
  paymentWallet?: string;
  paymentVpa?: string;
  paidAt?: string;
  paymentFailureReason?: string;
}
```

### 2. Update Order List Table

**Before:**
```typescript
<td>{order.payment?.status || 'N/A'}</td>
```

**After:**
```typescript
<td>
  <PaymentStatusBadge status={order.paymentStatus} />
</td>
<td>{order.paymentMethod || 'N/A'}</td>
<td>{order.paidAt ? new Date(order.paidAt).toLocaleString() : '-'}</td>
```

### 3. Update Order Details

**Before:**
```typescript
const OrderDetails = ({ orderId }) => {
  const order = useOrder(orderId);
  const payment = usePayment(orderId); // ❌ Remove
  
  return (
    <div>
      <p>Payment: {payment?.status}</p> {/* ❌ Remove */}
    </div>
  );
};
```

**After:**
```typescript
const OrderDetails = ({ orderId }) => {
  const order = useOrder(orderId); // Payment included
  
  return (
    <div>
      <p>Payment Status: {order.paymentStatus}</p> {/* ✅ Direct */}
      <p>Razorpay Order ID: {order.razorpayOrderId || 'N/A'}</p>
      <p>Payment Method: {order.paymentMethod || 'N/A'}</p>
      <p>Paid At: {order.paidAt ? new Date(order.paidAt).toLocaleString() : 'Not paid'}</p>
    </div>
  );
};
```

### 4. Add Payment Status Update

```typescript
// NEW: Update payment status
const updatePaymentStatus = async (orderId: number, paymentStatus: string) => {
  return api.put(`/admin-api/orders/${orderId}/payment-status`, {
    payment_status: paymentStatus
  });
};

// Usage
const handleRefund = async (orderId: number) => {
  await updatePaymentStatus(orderId, 'REFUNDED');
};
```

### 5. Payment Status Badge Component

```typescript
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const colors = {
    'CAPTURED': 'green',
    'PENDING': 'orange',
    'FAILED': 'red',
    'REFUNDED': 'gray',
    'PARTIALLY_REFUNDED': 'yellow'
  };

  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: '4px',
      backgroundColor: colors[status] || 'gray',
      color: 'white',
      fontSize: '12px'
    }}>
      {status}
    </span>
  );
};
```

### 6. Admin API Service Functions

**Before:**
```typescript
// ❌ Remove
export const getPaymentByOrderId = async (orderId: number) => {
  return api.get(`/api/payments/order/${orderId}`);
};
```

**After:**
```typescript
// ✅ Updated
export const getOrderById = async (orderId: number) => {
  return api.get(`/admin-api/orders/${orderId}`);
  // Payment info included in response
};

export const updatePaymentStatus = async (orderId: number, paymentStatus: string) => {
  return api.put(`/admin-api/orders/${orderId}/payment-status`, {
    payment_status: paymentStatus
  });
};

export const getAllOrders = async () => {
  return api.get('/admin-api/orders');
  // All orders include payment info
};
```

---

## Complete Migration Checklist

### Regular Frontend
- [ ] Remove all `/api/payments/*` API calls
- [ ] Update payment verification to `/api/orders/verify-payment`
- [ ] Add `order_id` to verification request
- [ ] Update Order interface to include payment fields
- [ ] Change `order.payment.status` to `order.paymentStatus`
- [ ] Update order placement flow to store `order.id`
- [ ] Update order history/details to use payment fields from order
- [ ] Remove Payment service/API files

### Admin Panel
- [ ] Update Order interface with payment fields
- [ ] Remove payment fetching from order details
- [ ] Add payment status column to order table
- [ ] Add payment method and paid date columns
- [ ] Create PaymentStatusBadge component
- [ ] Add payment status update functionality
- [ ] Update order filters to include payment status
- [ ] Test all order management features

---

## API Endpoints Reference

### User Endpoints
| Endpoint | Method | Change |
|----------|--------|--------|
| `/api/orders/place` | POST | ✅ Payment creation included |
| `/api/orders/verify-payment` | POST | ✅ NEW (was `/api/payments/verify`) |
| `/api/orders/{id}` | GET | ✅ Payment info included |
| `/api/orders/history` | GET | ✅ Payment info included |

### Admin Endpoints
| Endpoint | Method | Change |
|----------|--------|--------|
| `/admin-api/orders` | GET | ✅ Payment info included |
| `/admin-api/orders/{id}` | GET | ✅ Payment info included |
| `/admin-api/orders/{id}/status` | PUT | ✅ Payment info in response |
| `/admin-api/orders/{id}/payment-status` | PUT | ✅ NEW endpoint |

### Removed Endpoints
- ❌ `/api/payments/create-order/{orderId}`
- ❌ `/api/payments/verify`
- ❌ `/api/payments/order/{orderId}`
- ❌ `/api/payments/razorpay-order/{id}`
- ❌ `/api/payments/refund/{paymentId}`
- ❌ `/api/payments/currency`
- ❌ `/api/payments/webhook`

---

## Key Points

1. **Payment data is now in Order object** - No separate payment entity
2. **Single API call** - Get order = get payment info
3. **Simpler code** - No need to fetch payment separately
4. **Better performance** - One less API call per order
5. **Easier filtering** - Filter orders by payment status directly

---

## Example: Complete Order Flow

```typescript
// Step 1: Place Order
const { order, payment } = await placeOrder({
  address: {...},
  phoneNumber: "..."
});

// Step 2: Open Razorpay
const razorpay = new window.Razorpay({
  key: payment.key,
  amount: payment.amount * 100,
  order_id: payment.razorpay_order_id,
  handler: async (response) => {
    // Step 3: Verify Payment
    await verifyPayment(order.id, response);
  }
});
razorpay.open();

// Step 4: Verify (NEW endpoint)
const verifyPayment = async (orderId, razorpayResponse) => {
  await api.post('/api/orders/verify-payment', {
    order_id: orderId.toString(),  // ⚠️ Required
    razorpay_order_id: razorpayResponse.razorpay_order_id,
    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
    razorpay_signature: razorpayResponse.razorpay_signature
  });
};

// Step 5: Get Order (payment included)
const order = await api.get(`/api/orders/${orderId}`);
console.log(order.paymentStatus);  // "CAPTURED"
```

---

## Summary

**Main Changes:**
1. ✅ Payment verification moved to `/api/orders/verify-payment`
2. ✅ Must include `order_id` in verification request
3. ✅ Payment fields now directly on Order object
4. ✅ No separate payment APIs needed
5. ✅ Admin can update payment status via new endpoint

**What to Remove:**
- All `/api/payments/*` endpoints
- Separate payment service/API files
- `order.payment.*` property access

**What to Update:**
- Payment verification endpoint and request format
- Payment data access patterns
- TypeScript interfaces
- Order list/details components




