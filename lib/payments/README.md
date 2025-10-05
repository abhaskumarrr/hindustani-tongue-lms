# Razorpay Payment Integration

This module provides a complete payment processing solution using Razorpay for the Hindustani Tongue LMS.

## Features

- ✅ Secure payment processing with Razorpay
- ✅ Order creation and verification
- ✅ Payment status tracking
- ✅ Automatic course enrollment after successful payment
- ✅ Retry logic for failed payments
- ✅ Error handling and user feedback
- ✅ Mobile-responsive payment form

## Setup

### 1. Razorpay Account Setup

1. Create a Razorpay account at [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Complete KYC verification
3. Get your API keys from the dashboard

### 2. Environment Variables

Add the following to your `.env.local` file:

```bash
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

**Important:** 
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is safe to expose in the frontend
- `RAZORPAY_KEY_SECRET` must be kept secret and only used server-side

### 3. Test vs Production Keys

- **Test Mode:** Use test keys for development (they start with `rzp_test_`)
- **Production Mode:** Use live keys for production (they start with `rzp_live_`)

## Usage

### Basic Payment Form

```tsx
import PaymentForm from '@/components/Checkout/PaymentForm';

function CoursePage() {
  const handlePaymentSuccess = (paymentId: string) => {
    // Handle successful payment
    console.log('Payment successful:', paymentId);
    // Redirect to course or show success message
  };

  const handlePaymentError = (error: string) => {
    // Handle payment error
    console.error('Payment failed:', error);
    // Show error message to user
  };

  return (
    <PaymentForm
      courseId="course-123"
      courseTitle="Complete Hindustani Course"
      coursePrice={2999}
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentError={handlePaymentError}
    />
  );
}
```

### Using the Razorpay Service Directly

```tsx
import RazorpayService from '@/lib/payments/razorpay-service';

const razorpayService = new RazorpayService();

// Create a payment order
const order = await razorpayService.createOrder(
  userId,
  courseId,
  amount * 100, // Convert to paise
  userEmail,
  courseTitle
);

// Initialize checkout
razorpayService.initializeCheckout(
  order,
  (response) => {
    // Payment success
    console.log('Payment successful:', response);
  },
  (error) => {
    // Payment error
    console.error('Payment failed:', error);
  }
);
```

## API Endpoints

### POST /api/payments/create-order

Creates a new payment order in Razorpay.

**Request Body:**
```json
{
  "userId": "user123",
  "courseId": "course123",
  "amount": 299900,
  "userEmail": "user@example.com",
  "courseTitle": "Course Name"
}
```

**Response:**
```json
{
  "id": "order_abc123",
  "razorpayOrderId": "order_xyz789",
  "amount": 299900,
  "currency": "INR",
  "status": "created"
}
```

### POST /api/payments/verify

Verifies payment signature and grants course access.

**Request Body:**
```json
{
  "razorpay_payment_id": "pay_abc123",
  "razorpay_order_id": "order_xyz789",
  "razorpay_signature": "signature_hash",
  "orderId": "order_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and course access granted",
  "paymentId": "pay_abc123",
  "courseId": "course123"
}
```

## Database Schema

### Payments Collection

```typescript
interface Payment {
  id: string;                    // Unique payment ID
  userId: string;                // User who made the payment
  courseId: string;              // Course being purchased
  amount: number;                // Amount in paise
  currency: string;              // Always 'INR'
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  razorpayOrderId?: string;      // Razorpay order ID
  razorpayPaymentId?: string;    // Razorpay payment ID
  createdAt: Date;               // When order was created
  metadata: {
    userEmail: string;
    courseTitle: string;
  };
}
```

## Security Features

1. **Signature Verification:** All payments are verified using Razorpay's signature verification
2. **Server-side Validation:** Payment verification happens server-side only
3. **Firestore Security Rules:** Database access is protected by Firebase security rules
4. **Environment Variables:** Sensitive keys are stored as environment variables

## Error Handling

The payment system handles various error scenarios:

- **Network Errors:** Automatic retry with exponential backoff
- **Payment Failures:** Clear error messages and retry options
- **Signature Verification Failures:** Automatic payment status update
- **User Cancellation:** Graceful handling of cancelled payments

## Testing

### Test Cards (Razorpay Test Mode)

- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002
- **CVV:** Any 3 digits
- **Expiry:** Any future date

### Test UPI IDs

- **Success:** success@razorpay
- **Failure:** failure@razorpay

## Monitoring and Analytics

Payment events are automatically tracked in:

1. **Firestore:** All payment records with detailed status
2. **Firebase Analytics:** Payment events for business intelligence
3. **Console Logs:** Detailed error logging for debugging

## Troubleshooting

### Common Issues

1. **"Razorpay SDK not loaded"**
   - Ensure internet connection is available
   - Check if the Razorpay script is blocked by ad blockers

2. **"Payment verification failed"**
   - Verify that `RAZORPAY_KEY_SECRET` is correctly set
   - Check if the webhook signature is valid

3. **"Course access not granted"**
   - Verify Firestore security rules allow user updates
   - Check if the user document exists in Firestore

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will show detailed logs in the browser console and server logs.

## Production Checklist

Before going live:

- [ ] Switch to Razorpay live keys
- [ ] Test payment flow end-to-end
- [ ] Verify webhook endpoints are accessible
- [ ] Set up payment monitoring and alerts
- [ ] Configure proper error tracking
- [ ] Test with real payment methods
- [ ] Verify course access is granted correctly

## Support

For Razorpay-specific issues, refer to:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

For implementation issues, check the console logs and Firebase console for detailed error messages.