# Payment API Endpoints Documentation

This document describes the payment API endpoints for the Hindustani Tongue LMS, implementing secure Razorpay integration for course purchases.

## Overview

The payment system consists of three main endpoints:
1. **Create Order** - Creates a Razorpay payment order
2. **Verify Payment** - Verifies payment completion and grants course access
3. **Webhook Handler** - Processes Razorpay webhooks for automated payment processing

## Environment Variables

Before using the payment API, ensure these environment variables are configured:

```bash
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

## API Endpoints

### 1. Create Payment Order

**Endpoint:** `POST /api/payments/create-order`

Creates a new payment order in Razorpay and stores it in Firestore.

#### Request Body

```json
{
  "userId": "string",
  "courseId": "string", 
  "amount": "number",
  "userEmail": "string",
  "courseTitle": "string"
}
```

#### Response

**Success (200):**
```json
{
  "id": "order_abc123",
  "razorpayOrderId": "order_razorpay_xyz789",
  "amount": 99900,
  "currency": "INR",
  "status": "created",
  "created_at": 1640995200
}
```

**Error (400/404/500):**
```json
{
  "error": "Error message"
}
```

#### Validation Rules

- `amount` must be positive and ≤ ₹1,00,000 (in paise)
- `userEmail` must be valid email format
- User must exist and not be already enrolled in the course
- Course must exist and be published
- Amount must match the course price

### 2. Verify Payment

**Endpoint:** `POST /api/payments/verify`

Verifies payment signature and grants course access upon successful verification.

#### Request Body

```json
{
  "razorpay_payment_id": "string",
  "razorpay_order_id": "string", 
  "razorpay_signature": "string",
  "orderId": "string"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Payment verified and course access granted",
  "paymentId": "pay_abc123",
  "courseId": "course_xyz789",
  "enrollmentId": "user123_course789"
}
```

**Error (400/404/500):**
```json
{
  "error": "Error message"
}
```

#### Security Features

- HMAC-SHA256 signature verification
- Order ID validation
- Duplicate payment prevention
- Automatic course enrollment
- Progress tracking initialization

### 3. Razorpay Webhook

**Endpoint:** `POST /api/webhooks/razorpay`

Handles Razorpay webhooks for automated payment processing.

#### Supported Events

- `payment.captured` - Payment successfully captured
- `payment.failed` - Payment failed
- `payment.authorized` - Payment authorized (for manual capture)

#### Security

- Webhook signature verification using HMAC-SHA256
- Environment-based webhook secret validation

#### Response

**Success (200):**
```json
{
  "status": "success"
}
```

**Error (400/500):**
```json
{
  "error": "Error message"
}
```

## Integration Example

### Frontend Integration

```typescript
import RazorpayService from '@/lib/payments/razorpay-service';

// 1. Create payment order
const service = new RazorpayService();
const order = await service.createOrder(
  userId,
  courseId, 
  amount,
  userEmail,
  courseTitle
);

// 2. Initialize Razorpay checkout
service.initializeCheckout(
  order,
  async (response) => {
    // Payment successful
    console.log('Payment completed:', response);
    // Redirect to course or show success message
  },
  (error) => {
    // Payment failed
    console.error('Payment failed:', error);
    // Show error message to user
  }
);
```

### Webhook Configuration

Configure the webhook URL in your Razorpay dashboard:

**Webhook URL:** `https://yourdomain.com/api/webhooks/razorpay`

**Events to subscribe:**
- payment.captured
- payment.failed
- payment.authorized

## Database Schema

### Payment Document (`payments` collection)

```typescript
interface PaymentOrder {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: 'INR';
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Timestamp;
  metadata: {
    userEmail: string;
    courseTitle: string;
    instructorId: string;
    instructorName: string;
  };
}
```

### Enrollment Document (`enrollments` collection)

```typescript
interface CourseEnrollment {
  userId: string;
  courseId: string;
  enrolledAt: Timestamp;
  paymentId: string;
  status: 'active' | 'suspended' | 'completed';
}
```

## Error Handling

### Common Error Codes

- **400 Bad Request** - Invalid input data or business rule violation
- **404 Not Found** - User, course, or payment order not found
- **500 Internal Server Error** - Server configuration or database errors

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "details": "Technical details (development only)"
}
```

## Security Considerations

1. **Signature Verification** - All payments are verified using HMAC-SHA256
2. **Environment Variables** - Sensitive keys stored securely
3. **Input Validation** - Comprehensive validation of all inputs
4. **Access Control** - User and course existence verification
5. **Duplicate Prevention** - Prevents duplicate enrollments and payments
6. **Error Logging** - Comprehensive logging for debugging and monitoring

## Testing

Run the payment API tests:

```bash
npx vitest run __tests__/payment-api.test.ts
```

The test suite covers:
- Order creation with various scenarios
- Payment verification with valid/invalid signatures
- Webhook processing for different events
- Security validation and error handling
- Course enrollment integration

## Monitoring and Analytics

### Key Metrics to Track

1. **Payment Success Rate** - Percentage of successful payments
2. **Order Creation Rate** - Orders created vs completed
3. **Webhook Processing** - Webhook delivery and processing success
4. **Error Rates** - API error rates by endpoint
5. **Course Enrollment** - Successful enrollments after payment

### Logging

All payment operations are logged with:
- Order creation and completion
- Payment verification results
- Webhook processing events
- Error conditions and failures

## Production Deployment

### Checklist

- [ ] Configure Razorpay production keys
- [ ] Set up webhook endpoint with proper SSL
- [ ] Configure Firestore security rules
- [ ] Set up monitoring and alerting
- [ ] Test end-to-end payment flow
- [ ] Verify webhook signature validation
- [ ] Test error scenarios and recovery

### Razorpay Dashboard Configuration

1. **API Keys** - Generate and configure production keys
2. **Webhooks** - Set up webhook URL and events
3. **Payment Methods** - Configure supported payment methods
4. **Settlement** - Configure automatic settlement preferences

This payment system provides a secure, scalable foundation for processing course purchases in the Hindustani Tongue LMS while maintaining zero operational costs through the use of free-tier services.