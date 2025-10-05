import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      orderId 
    } = body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderId) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('Razorpay key secret not configured');
      return NextResponse.json(
        { error: 'Payment verification configuration error' },
        { status: 500 }
      );
    }

    // Create signature for verification
    const body_string = razorpay_order_id + '|' + razorpay_payment_id;
    const expected_signature = crypto
      .createHmac('sha256', keySecret)
      .update(body_string)
      .digest('hex');

    // Verify signature
    if (expected_signature !== razorpay_signature) {
      console.error('Payment signature verification failed', {
        orderId,
        razorpay_order_id,
        razorpay_payment_id
      });
      
      // Update payment status to failed
      try {
        await updateDoc(doc(db, 'payments', orderId), {
          status: 'failed',
          failureReason: 'Signature verification failed',
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          updatedAt: serverTimestamp(),
          verificationAttemptedAt: serverTimestamp()
        });
      } catch (dbError) {
        console.error('Failed to update payment status:', dbError);
      }

      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Get payment document to verify it exists and get course details
    const paymentDoc = await getDoc(doc(db, 'payments', orderId));
    
    if (!paymentDoc.exists()) {
      console.error('Payment order not found:', orderId);
      return NextResponse.json(
        { error: 'Payment order not found' },
        { status: 404 }
      );
    }

    const paymentData = paymentDoc.data();

    // Verify that the Razorpay order ID matches
    if (paymentData.razorpayOrderId !== razorpay_order_id) {
      console.error('Razorpay order ID mismatch', {
        expected: paymentData.razorpayOrderId,
        received: razorpay_order_id
      });
      
      await updateDoc(doc(db, 'payments', orderId), {
        status: 'failed',
        failureReason: 'Order ID mismatch',
        updatedAt: serverTimestamp()
      });

      return NextResponse.json(
        { error: 'Payment verification failed - order mismatch' },
        { status: 400 }
      );
    }

    // Check if payment is already processed
    if (paymentData.status === 'captured') {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified and processed',
        paymentId: razorpay_payment_id,
        courseId: paymentData.courseId,
        alreadyProcessed: true
      });
    }

    // Update payment status to captured
    await updateDoc(doc(db, 'payments', orderId), {
      status: 'captured',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      verifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Grant course access
    await grantCourseAccess(paymentData.userId, paymentData.courseId, orderId);

    // Log successful verification
    console.log('Payment verified and course access granted:', {
      orderId,
      paymentId: razorpay_payment_id,
      userId: paymentData.userId,
      courseId: paymentData.courseId
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and course access granted',
      paymentId: razorpay_payment_id,
      courseId: paymentData.courseId,
      enrollmentId: `${paymentData.userId}_${paymentData.courseId}`
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    
    return NextResponse.json(
      { 
        error: 'Payment verification failed',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * Grant course access to user after successful payment verification
 */
async function grantCourseAccess(userId: string, courseId: string, paymentId: string): Promise<void> {
  try {
    // Update user's enrolled courses
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const enrolledCourses = userData.enrolledCourses || [];
    
    // Add course to enrolled courses if not already present
    if (!enrolledCourses.includes(courseId)) {
      await updateDoc(userRef, {
        enrolledCourses: [...enrolledCourses, courseId],
        updatedAt: serverTimestamp(),
      });
    }

    // Create enrollment record
    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    
    await setDoc(enrollmentRef, {
      userId,
      courseId,
      enrolledAt: serverTimestamp(),
      paymentId,
      status: 'active'
    }, { merge: true });

    // Initialize user progress for the course
    const progressId = `${userId}_${courseId}`;
    const progressRef = doc(db, 'userProgress', progressId);
    const progressDoc = await getDoc(progressRef);
    
    if (!progressDoc.exists()) {
      await setDoc(progressRef, {
        userId,
        courseId,
        enrolledAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
        currentLessonId: null,
        lessonsCompleted: [],
        totalWatchTime: 0,
        overallProgress: 0,
        lessonProgress: {},
        paymentId
      });
    }

    // Update course enrollment count
    const courseRef = doc(db, 'courses', courseId);
    const courseDoc = await getDoc(courseRef);
    
    if (courseDoc.exists()) {
      const courseData = courseDoc.data();
      const currentCount = courseData.enrollmentCount || 0;
      
      await updateDoc(courseRef, {
        enrollmentCount: currentCount + 1,
        updatedAt: serverTimestamp()
      });
    }

  } catch (error) {
    console.error('Error granting course access:', error);
    throw error;
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}