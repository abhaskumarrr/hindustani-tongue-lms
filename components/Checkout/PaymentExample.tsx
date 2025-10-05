'use client';

import { useState } from 'react';
import PaymentForm from './PaymentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PaymentExampleProps {
  courseId?: string;
  courseTitle?: string;
  coursePrice?: number;
}

const PaymentExample: React.FC<PaymentExampleProps> = ({
  courseId = 'sample-course-1',
  courseTitle = 'Complete Hindustani Language Course',
  coursePrice = 2999,
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId);
    setPaymentComplete(true);
    
    // In a real app, you would redirect to the course or dashboard
    setTimeout(() => {
      alert(`Payment successful! Payment ID: ${paymentId}\nRedirecting to course...`);
    }, 1000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    // Handle payment error (show notification, etc.)
  };

  if (paymentComplete) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">Enrollment Complete!</CardTitle>
            <CardDescription>
              Welcome to {courseTitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">You now have full access to the course content.</p>
            <Button onClick={() => {
              setShowPayment(false);
              setPaymentComplete(false);
            }}>
              Start Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => setShowPayment(false)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course Details
          </Button>
        </div>
        
        <PaymentForm
          courseId={courseId}
          courseTitle={courseTitle}
          coursePrice={coursePrice}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>{courseTitle}</CardTitle>
          <CardDescription>
            Master Hindustani language with our comprehensive course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Course Price:</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{coursePrice.toLocaleString('en-IN')}
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">What you'll get:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>50+ video lessons</li>
                <li>Interactive exercises</li>
                <li>Progress tracking</li>
                <li>Certificate of completion</li>
                <li>Lifetime access</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => setShowPayment(true)}
              className="w-full"
              size="lg"
            >
              Enroll Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentExample;