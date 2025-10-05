import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

// Razorpay types
interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: number;
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentOrder {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  metadata: {
    userEmail: string;
    courseTitle: string;
  };
}

class RazorpayService {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    
    if (!this.keyId) {
      throw new Error('Razorpay Key ID is not configured');
    }
  }

  /**
   * Create a payment order in Razorpay
   */
  async createOrder(
    userId: string,
    courseId: string,
    amount: number,
    userEmail: string,
    courseTitle: string
  ): Promise<PaymentOrder> {
    try {
      // Create order in Razorpay via API endpoint
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          courseId,
          amount,
          userEmail,
          courseTitle,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create order: ${response.statusText}`);
      }

      const orderData = await response.json();
      
      // Store order in Firestore
      const paymentOrder: PaymentOrder = {
        id: orderData.id,
        userId,
        courseId,
        amount,
        currency: 'INR',
        status: 'created',
        razorpayOrderId: orderData.razorpayOrderId,
        createdAt: new Date(),
        metadata: {
          userEmail,
          courseTitle,
        },
      };

      await setDoc(doc(db, 'payments', orderData.id), paymentOrder);
      
      return paymentOrder;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Initialize Razorpay checkout
   */
  initializeCheckout(
    order: PaymentOrder,
    onSuccess: (response: RazorpayPaymentResponse) => void,
    onError: (error: any) => void
  ): void {
    if (typeof window === 'undefined' || !window.Razorpay) {
      onError(new Error('Razorpay SDK not loaded'));
      return;
    }

    const options = {
      key: this.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'Hindustani Tongue',
      description: `Course: ${order.metadata.courseTitle}`,
      order_id: order.razorpayOrderId,
      handler: async (response: RazorpayPaymentResponse) => {
        try {
          await this.verifyPayment(response, order.id);
          onSuccess(response);
        } catch (error) {
          onError(error);
        }
      },
      prefill: {
        email: order.metadata.userEmail,
      },
      theme: {
        color: '#FF6B35', // Hindustani Tongue brand color
      },
      modal: {
        ondismiss: () => {
          onError(new Error('Payment cancelled by user'));
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }

  /**
   * Verify payment signature and update order status
   */
  async verifyPayment(
    paymentResponse: RazorpayPaymentResponse,
    orderId: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentResponse,
          orderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update payment status in Firestore
        await updateDoc(doc(db, 'payments', orderId), {
          status: 'captured',
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
        });
        
        return true;
      } else {
        throw new Error(result.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      
      // Update payment status to failed
      await updateDoc(doc(db, 'payments', orderId), {
        status: 'failed',
      });
      
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(orderId: string): Promise<PaymentOrder | null> {
    try {
      const paymentDoc = await getDoc(doc(db, 'payments', orderId));
      
      if (paymentDoc.exists()) {
        return paymentDoc.data() as PaymentOrder;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      return null;
    }
  }

  /**
   * Retry failed payment
   */
  async retryPayment(
    orderId: string,
    onSuccess: (response: RazorpayPaymentResponse) => void,
    onError: (error: any) => void
  ): Promise<void> {
    try {
      const paymentOrder = await this.getPaymentStatus(orderId);
      
      if (!paymentOrder) {
        throw new Error('Payment order not found');
      }

      if (paymentOrder.status === 'captured') {
        throw new Error('Payment already completed');
      }

      // Create new Razorpay order for retry
      const newOrder = await this.createOrder(
        paymentOrder.userId,
        paymentOrder.courseId,
        paymentOrder.amount,
        paymentOrder.metadata.userEmail,
        paymentOrder.metadata.courseTitle
      );

      this.initializeCheckout(newOrder, onSuccess, onError);
    } catch (error) {
      console.error('Error retrying payment:', error);
      onError(error);
    }
  }

  /**
   * Load Razorpay SDK
   */
  static loadRazorpaySDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.head.appendChild(script);
    });
  }
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default RazorpayService;
export type { PaymentOrder, RazorpayPaymentResponse };