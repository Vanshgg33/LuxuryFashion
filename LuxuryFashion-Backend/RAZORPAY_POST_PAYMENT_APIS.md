# Razorpay Post-Payment APIs

Complete list of backend APIs available **after payment is complete** for retrieving payment information, verifying payments, and managing refunds.

---

## 📋 Table of Contents

1. [Payment Verification](#1-payment-verification)
2. [Get Payment Details](#2-get-payment-details)
3. [Refund Payment](#3-refund-payment)
4. [Get Currency Information](#4-get-currency-information)
5. [Order Status Check](#5-order-status-check)

---

## 1. Payment Verification

### Verify Payment After Completion

**Endpoint:** `POST /api/payments/verify`

**Description:** Verifies payment signature after successful payment completion. This should be called immediately after Razorpay checkout completes.

**Authentication:** Required (User)

**Request:**
```http
POST /api/payments/verify
Authorization: Bearer <jwt_token>
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

**Use Case:** Call this immediately after Razorpay checkout success handler to verify and save payment details.

---

## 2. Get Payment Details

### 2.1 Get Payment by Order ID

**Endpoint:** `GET /api/payments/order/{orderId}`

**Description:** Retrieves complete payment details for a specific order.

**Authentication:** Required (User/Admin)

**Request:**
```http
GET /api/payments/order/123
Authorization: Bearer <jwt_token>
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
  "failureReason": null,
  "order": {
    "id": 123,
    "totalPrice": 1999.00,
    "status": "CONFIRMED"
  }
}
```

**Use Case:** 
- Display payment details on order confirmation page
- Show payment information in order history
- Admin viewing payment details

---

### 2.2 Get Payment by Razorpay Order ID

**Endpoint:** `GET /api/payments/razorpay-order/{razorpayOrderId}`

**Description:** Retrieves payment details using Razorpay order ID. Useful when you only have the Razorpay order ID from the payment response.

**Authentication:** Required (User/Admin)

**Request:**
```http
GET /api/payments/razorpay-order/order_MN1234567890
Authorization: Bearer <jwt_token>
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

**Use Case:** 
- When you only have Razorpay order ID from payment response
- Verifying payment status using Razorpay order ID
- Webhook processing verification

---

## 3. Refund Payment

### Process Refund (Admin Only)

**Endpoint:** `POST /api/payments/refund/{paymentId}`

**Description:** Processes a refund for a completed payment. Only admins can access this endpoint.

**Authentication:** Required (Admin)

**Request:**
```http
POST /api/payments/refund/1
Authorization: Bearer <admin_jwt_token>
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

**Use Case:**
- Admin processing customer refunds
- Handling order cancellations
- Partial refunds for damaged items

**Note:** 
- Full refund: Set amount equal to payment amount
- Partial refund: Set amount less than payment amount

---

## 4. Get Currency Information

### Get Currency Details

**Endpoint:** `GET /api/payments/currency`

**Description:** Returns currency information (INR, ₹, Rupees). Useful for displaying formatted amounts.

**Authentication:** Not Required (Public)

**Request:**
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

**Use Case:** 
- Format payment amounts in frontend
- Display currency symbol
- Currency conversion (if needed in future)

---

## 5. Order Status Check

### Get Order with Payment Status

**Endpoint:** `GET /api/orders/{orderId}`

**Description:** Retrieves order details including payment status.

**Authentication:** Required (User/Admin)

**Request:**
```http
GET /api/orders/123
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**
```json
{
  "id": 123,
  "totalPrice": 1999.00,
  "status": "CONFIRMED",
  "orderDate": "2024-01-15T10:30:00",
  "payment": {
    "id": 1,
    "razorpayOrderId": "order_MN1234567890",
    "razorpayPaymentId": "pay_MN1234567890",
    "status": "CAPTURED",
    "amount": 1999.00,
    "paidAt": "2024-01-15T10:31:00"
  },
  "items": [...],
  "user": {...}
}
```

**Use Case:**
- Check order and payment status together
- Order history page
- Order tracking

---

## 📊 Payment Status Values

After payment completion, the payment status can be:

| Status | Description |
|--------|-------------|
| `CAPTURED` | Payment successfully completed and captured |
| `FAILED` | Payment failed |
| `REFUNDED` | Full refund processed |
| `PARTIALLY_REFUNDED` | Partial refund processed |
| `PENDING` | Payment initiated but not completed |

---

## 🔄 Complete Post-Payment Flow

### Frontend Integration Example

```typescript
// After Razorpay checkout success
const handlePaymentSuccess = async (razorpayResponse: any) => {
  try {
    // 1. Verify payment immediately
    const verification = await verifyPayment({
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
    });

    if (verification.success) {
      // 2. Fetch complete payment details
      const paymentDetails = await getPaymentByOrderId(verification.order_id);
      
      // 3. Redirect to success page with payment info
      router.push({
        pathname: '/order-success',
        query: {
          orderId: verification.order_id,
          paymentId: verification.payment_id,
          status: verification.status,
        },
      });
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    // Handle error
  }
};

// On order success page
const fetchOrderDetails = async (orderId: number) => {
  const order = await getOrder(orderId);
  const payment = await getPaymentByOrderId(orderId);
  
  // Display order and payment information
  return { order, payment };
};

// Admin refund processing
const processRefund = async (paymentId: number, amount: number) => {
  const refund = await refundPayment(paymentId, amount);
  console.log('Refund processed:', refund.refund_id);
  return refund;
};
```

---

## 🎯 Quick Reference Table

| API Endpoint | Method | Auth | Purpose | When to Use |
|--------------|--------|------|---------|-------------|
| `/api/payments/verify` | POST | User | Verify payment signature | Immediately after checkout |
| `/api/payments/order/{orderId}` | GET | User/Admin | Get payment by order ID | Order confirmation, history |
| `/api/payments/razorpay-order/{id}` | GET | User/Admin | Get payment by Razorpay order ID | When you have Razorpay order ID |
| `/api/payments/refund/{paymentId}` | POST | Admin | Process refund | Admin refund processing |
| `/api/payments/currency` | GET | Public | Get currency info | Format amounts |
| `/api/orders/{orderId}` | GET | User/Admin | Get order with payment | Order tracking |

---

## ⚠️ Important Notes

1. **Payment Verification:** Always verify payment on the backend immediately after Razorpay checkout completes. Don't rely solely on frontend success callback.

2. **Payment Status:** After successful verification, payment status changes from `PENDING` to `CAPTURED`, and order status changes to `CONFIRMED`.

3. **Refunds:** 
   - Only admins can process refunds
   - Full refund sets status to `REFUNDED`
   - Partial refund sets status to `PARTIALLY_REFUNDED`

4. **Webhooks:** Razorpay also sends webhooks automatically. The backend processes these to update payment status even if frontend verification fails.

5. **Error Handling:** Always handle errors gracefully. Payment verification can fail due to network issues or invalid signatures.

---

## 🔍 Testing Post-Payment APIs

### Test Payment Verification
```bash
curl -X POST http://localhost:8081/api/payments/verify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_test123",
    "razorpay_payment_id": "pay_test123",
    "razorpay_signature": "test_signature"
  }'
```

### Test Get Payment Details
```bash
curl -X GET http://localhost:8081/api/payments/order/123 \
  -H "Authorization: Bearer <token>"
```

### Test Refund (Admin)
```bash
curl -X POST http://localhost:8081/api/payments/refund/1 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1999.00}'
```

---

## 📝 Summary

**After payment completion, you can:**

1. ✅ **Verify Payment** - Confirm payment authenticity
2. ✅ **Get Payment Details** - Retrieve complete payment information
3. ✅ **Check Order Status** - View order with payment status
4. ✅ **Process Refunds** - Admin can refund payments
5. ✅ **Get Currency Info** - Format payment amounts

All these APIs work seamlessly together to provide a complete post-payment experience for both users and admins.

