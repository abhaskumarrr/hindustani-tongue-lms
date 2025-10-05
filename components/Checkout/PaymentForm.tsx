'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RazorpayService, { PaymentOrder, RazorpayPaymentResponse } from '@/lib/payments/razorpay-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, RefreshCw } from 'lucide-react';

interface PaymentFormProps {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError?: (error: string) => void;
}

interface PaymentState {
  loading: boolean;
  processing: boolean;
  error: string | null;
  success: boolean;
  retryCount: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  courseId,
  courseTitle,
  coursePrice,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const { user } = useAuth();
  const [paymentState, setPaymentState] = useState<PaymentState>({
    loading: false,
    processing: false,
    error: null,
    success: false,
    retryCount: 0,
  });
  const [razorpayService, setRazorpayService] = useState<RazorpayService | null>(null);
  const [currentOrder, setCurrentOrder] = useState<PaymentOrder | null>(null);

  // Initialize Razorpay service
  useEffect(() => {
    const initializeRazorpay = async () => {
      try {
        setPaymentState(prev => ({ ...prev, loading: true, error: null }));
        
        // Load Razorpay SDK
        await RazorpayService.loadRazorpaySDK();
        
        // Initialize service
        const service = new RazorpayService();
        setRazorpayService(service);
        
        setPaymentState(prev => ({ ...prev, loading: false }));
      } catch (error) {
        console.error('Failed to initialize Razorpay:', error);
        setPaymentState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load payment system. Please refresh and try again.',
        }));
      }
    };

    initializeRazorpay();
  }, []);

  const handlePayment = async () => {
    if (!razorpayService || !user) {
      setPaymentState(prev => ({
        ...prev,
        error: 'Payment system not ready or user not authenticated',
      }));
      return;
    }

    try {
      setPaymentState(prev => ({
        ...prev,
        processing: true,
        error: null,
      }));

      // Create payment order
      const order = await razorpayService.createOrder(
        user.uid,
        courseId,
        coursePrice * 100, // Convert to paise
        user.email || '',
        courseTitle
      );

      setCurrentOrder(order);

      // Initialize checkout
      razorpayService.initializeCheckout(
        order,
        handlePaymentSuccess,
        handlePaymentError
      );
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setPaymentState(prev => ({
        ...prev,
        processing: false,
        error: error instanceof Error ? error.message : 'Failed to initiate payment',
      }));
      
      if (onPaymentError) {
        onPaymentError(error instanceof Error ? error.message : 'Payment failed');
      }
    }
  };

  const handlePaymentSuccess = async (response: RazorpayPaymentResponse) => {
    try {
      setPaymentState(prev => ({
        ...prev,
        processing: false,
        success: true,
        error: null,
      }));

      // Call success callback with additional context
      onPaymentSuccess(response.razorpay_payment_id);
    } catch (error) {
      console.error('Payment success handling failed:', error);
      handlePaymentError(error);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    
    let errorMessage = 'Payment failed. Please try again.';
    
    // Handle specific error types
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.description) {
      errorMessage = error.description;
    } else if (error?.reason) {
      errorMessage = error.reason;
    }

    // Categorize common errors for better user experience
    if (errorMessage.toLowerCase().includes('cancelled') || errorMessage.toLowerCase().includes('closed')) {
      errorMessage = 'Payment was cancelled. You can try again when ready.';
    } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('timeout')) {
      errorMessage = 'Network error occurred. Please check your connection and try again.';
    } else if (errorMessage.toLowerCase().includes('insufficient')) {
      errorMessage = 'Insufficient funds. Please check your payment method and try again.';
    } else if (errorMessage.toLowerCase().includes('declined')) {
      errorMessage = 'Payment was declined by your bank. Please try a different payment method.';
    }

    setPaymentState(prev => ({
      ...prev,
      processing: false,
      error: errorMessage,
      retryCount: prev.retryCount + 1,
    }));

    if (onPaymentError) {
      onPaymentError(errorMessage);
    }
  };

  const handleRetryPayment = async () => {
    if (!razorpayService || !currentOrder) {
      return;
    }

    try {
      setPaymentState(prev => ({
        ...prev,
        processing: true,
        error: null,
      }));

      await razorpayService.retryPayment(
        currentOrder.id,
        handlePaymentSuccess,
        handlePaymentError
      );
    } catch (error) {
      handlePaymentError(error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  if (paymentState.loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading payment system...</span>
        </CardContent>
      </Card>
    );
  }

  if (paymentState.success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Your enrollment for "{courseTitle}" has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-600">
            You can now access all course content. Happy learning!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Your Purchase
        </CardTitle>
        <CardDescription>
          Secure payment powered by Razorpay
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Course Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900">{courseTitle}</h3>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Course Price:</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(coursePrice)}
            </span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Secure Payment</p>
            <p>Your payment information is encrypted and secure.</p>
          </div>
        </div>

        {/* Error Display */}
        {paymentState.error && (
          <Alert variant="destructive">
            <AlertDescription>{paymentState.error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Methods Info */}
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-1">Accepted Payment Methods:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Credit & Debit Cards</li>
            <li>Net Banking</li>
            <li>UPI</li>
            <li>Wallets</li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          onClick={handlePayment}
          disabled={paymentState.processing || !user}
          className="w-full"
          size="lg"
        >
          {paymentState.processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              Pay {formatPrice(coursePrice)}
            </>
          )}
        </Button>

        {/* Retry Button */}
        {paymentState.error && paymentState.retryCount > 0 && paymentState.retryCount < 3 && (
          <Button
            onClick={handleRetryPayment}
            variant="outline"
            disabled={paymentState.processing}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Payment
          </Button>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 text-center mt-2 space-y-1">
          <p>Having trouble? Contact support at</p>
          <a 
            href="mailto:support@hindustani-tongue.com" 
            className="text-primary hover:underline"
          >
            support@hindustani-tongue.com
          </a>
          {paymentState.retryCount > 0 && (
            <p className="text-orange-600">
              Attempt {paymentState.retryCount + 1} of 3
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PaymentForm;