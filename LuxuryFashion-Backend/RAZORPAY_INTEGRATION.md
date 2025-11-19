# Razorpay Payment Integration Guide

## Overview
Complete Razorpay payment integration has been implemented for the LuxuryFashion e-commerce application. This includes order creation, payment processing, webhook handling, refunds, and comprehensive logging.

## Components Created

### 1. Database Models

#### Payment Entity (`Payment.java`)
- Stores payment information linked to orders
- Fields include:
  - Razorpay order ID, payment ID, signature
  - Amount, currency, payment status
  - Payment method, bank, wallet, VPA
  - Timestamps (created, paid)
  - Full Razorpay response stored as JSON

#### PaymentLog Entity (`PaymentLog.java`)
- Comprehensive logging for all payment events
- Tracks: order creation, payment verification, webhooks, refunds
- Stores event type, log level, messages, and details
- Links to payment and stores Razorpay IDs

### 2. Repositories

- `PaymentRepository` - CRUD operations for payments
- `PaymentLogRepository` - Query payment logs by various criteria

### 3. Services

#### PaymentService Interface
- `createRazorpayOrder()` - Create Razorpay order
- `verifyPayment()` - Verify payment signature and update status
- `handleWebhook()` - Process Razorpay webhook events
- `getPaymentByOrderId()` - Retrieve payment by order
- `refundPayment()` - Process refunds

#### PaymentServiceImpl
- Full Razorpay integration using Razorpay Java SDK
- Signature verification using HMAC SHA256
- Automatic order status updates on payment success
- Comprehensive error handling and logging

### 4. Controllers

#### PaymentController (`/api/payments`)
- `POST /create-order/{orderId}` - Create payment order
- `POST /verify` - Verify payment after completion
- `GET /order/{orderId}` - Get payment details
- `POST /webhook` - Razorpay webhook endpoint
- `POST /refund/{paymentId}` - Process refunds (Admin only)

#### OrderController (Updated)
- `POST /place` - Now automatically creates Razorpay order after order placement

## Configuration

### application.properties
```properties
# Razorpay Configuration
razorpay.key.id=${RAZORPAY_KEY_ID:rzp_test_1234567890}
razorpay.key.secret=${RAZORPAY_KEY_SECRET:your_secret_key_here}
razorpay.webhook.secret=${RAZORPAY_WEBHOOK_SECRET:your_webhook_secret_here}
```

### Environment Variables
Set these in your environment or `local.env`:
- `RAZORPAY_KEY_ID` - Your Razorpay Key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay Key Secret
- `RAZORPAY_WEBHOOK_SECRET` - Webhook secret for signature verification

## Payment Flow

### 1. Order Placement
```
User places order → Order created → Razorpay order created → Payment entity saved
```

**Endpoint:** `POST /api/orders/place`

**Response:**
```json
{
  "order": { ... },
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

### 2. Payment Processing
Frontend uses Razorpay Checkout with the returned order ID and key.

### 3. Payment Verification
After successful payment, frontend calls verification endpoint.

**Endpoint:** `POST /api/payments/verify`

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

### 4. Webhook Handling
Razorpay sends webhooks for payment events.

**Endpoint:** `POST /api/payments/webhook`

**Events Handled:**
- `payment.captured` - Payment successful
- `payment.failed` - Payment failed

## Logging

All payment events are logged to the `payment_logs` table:
- Order creation
- Payment verification
- Webhook events
- Refund processing
- Errors and failures

**Query Logs:**
```java
// By payment ID
List<PaymentLog> logs = paymentLogRepository.findByPaymentIdOrderByCreatedAtDesc(paymentId);

// By Razorpay order ID
List<PaymentLog> logs = paymentLogRepository.findByRazorpayOrderIdOrderByCreatedAtDesc(razorpayOrderId);

// By event type
List<PaymentLog> logs = paymentLogRepository.findByEventTypeOrderByCreatedAtDesc("payment_verified");
```

## Refunds

**Endpoint:** `POST /api/payments/refund/{paymentId}` (Admin only)

**Request:**
```json
{
  "amount": 500.00
}
```

**Response:**
```json
{
  "refund_id": "rfnd_xxx",
  "amount": 50000,
  "status": "processed",
  "payment_status": "PARTIALLY_REFUNDED"
}
```

## Integration with Orders

- Orders are automatically linked with payments
- Order status updates to `CONFIRMED` when payment is verified
- Payment information is accessible via `order.getPayment()`

## Security Features

1. **Signature Verification** - All payments are verified using HMAC SHA256
2. **Webhook Verification** - Webhook signature verification (optional but recommended)
3. **Access Control** - Payment endpoints check user ownership
4. **Admin Only** - Refund operations restricted to admins

## Error Handling

- Comprehensive try-catch blocks
- Detailed error logging
- User-friendly error messages
- Payment failures don't break order flow

## Testing

### Test Mode
Use Razorpay test keys:
- Key ID: `rzp_test_xxx`
- Key Secret: `rzp_test_xxx`

### Test Cards
Use Razorpay test cards for testing payments:
- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`

## Next Steps

1. **Configure Razorpay Keys**
   - Get keys from Razorpay Dashboard
   - Update `application.properties` or environment variables

2. **Set Up Webhook URL**
   - In Razorpay Dashboard, set webhook URL: `https://yourdomain.com/api/payments/webhook`
   - Configure webhook secret

3. **Frontend Integration**
   - Use Razorpay Checkout.js or React SDK
   - Call `/api/orders/place` to get order details
   - Initialize Razorpay checkout with returned data
   - Call `/api/payments/verify` after payment

4. **Monitor Logs**
   - Check `payment_logs` table for payment events
   - Monitor application logs for errors

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders/place` | Place order with payment | User |
| POST | `/api/payments/create-order/{orderId}` | Create payment order | User |
| POST | `/api/payments/verify` | Verify payment | User |
| GET | `/api/payments/order/{orderId}` | Get payment details | User/Admin |
| POST | `/api/payments/webhook` | Razorpay webhook | Public |
| POST | `/api/payments/refund/{paymentId}` | Process refund | Admin |

## Database Schema

### payments table
- id (PK)
- order_id (FK, unique)
- razorpay_order_id (unique)
- razorpay_payment_id (unique)
- razorpay_signature
- amount, currency
- status (PENDING, CAPTURED, FAILED, REFUNDED, PARTIALLY_REFUNDED)
- payment_method, bank, wallet, vpa
- notes, razorpay_response
- created_at, paid_at
- failure_reason

### payment_logs table
- id (PK)
- payment_id (FK)
- event_type
- log_level (INFO, WARN, ERROR, DEBUG)
- message, details (JSON)
- razorpay_order_id, razorpay_payment_id
- ip_address, user_agent
- created_at

## Support

For issues or questions:
1. Check payment logs in database
2. Review application logs
3. Verify Razorpay Dashboard for transaction status
4. Check webhook delivery in Razorpay Dashboard






