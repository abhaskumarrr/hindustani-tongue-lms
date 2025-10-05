import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { nanoid } from 'nanoid';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId, amount, userEmail, courseTitle } = body;

    // Validate required fields
    if (!userId || !courseId || !amount || !userEmail || !courseTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, courseId, amount, userEmail, courseTitle' },
        { status: 400 }
      );
    }

    // Validate amount (should be positive and reasonable)
    if (typeof amount !== 'number' || amount <= 0 || amount > 10000000) { // Max 1 lakh INR in paise
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number not exceeding ₹1,00,000' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if course exists and is published
    const courseRef = doc(db, 'courses', courseId);
    const courseDoc = await getDoc(courseRef);
    if (!courseDoc.exists()) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const courseData = courseDoc.data();
    if (courseData.status !== 'published') {
      return NextResponse.json(
        { error: 'Course is not available for enrollment' },
        { status: 400 }
      );
    }

    // Verify the amount matches the course price
    if (amount !== courseData.price) {
      return NextResponse.json(
        { error: 'Amount does not match course price' },
        { status: 400 }
      );
    }

    // Check if user is already enrolled
    const userData = userDoc.data();
    const enrolledCourses = userData.enrolledCourses || [];
    if (enrolledCourses.includes(courseId)) {
      return NextResponse.json(
        { error: 'User is already enrolled in this course' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `order_${nanoid(12)}`;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount, // Amount in paise
      currency: 'INR',
      receipt: orderId, // Use our internal order ID as receipt
      notes: {
        userId,
        courseId,
        userEmail,
        courseTitle,
        internalOrderId: orderId
      },
    });

    // Store payment order in Firestore for tracking
    const paymentOrder = {
      id: orderId,
      userId,
      courseId,
      amount,
      currency: 'INR',
      status: 'created',
      razorpayOrderId: razorpayOrder.id,
      createdAt: serverTimestamp(),
      metadata: {
        userEmail,
        courseTitle,
        instructorId: courseData.instructorId,
        instructorName: courseData.instructorName
      }
    };

    await setDoc(doc(db, 'payments', orderId), paymentOrder);

    // Log order creation for analytics
    console.log('Payment order created:', {
      orderId,
      razorpayOrderId: razorpayOrder.id,
      userId,
      courseId,
      amount
    });

    // Return order details
    return NextResponse.json({
      id: orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      status: razorpayOrder.status,
      created_at: razorpayOrder.created_at
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    
    // Handle specific Razorpay errors
    if (error instanceof Error) {
      if (error.message.includes('key_id')) {
        return NextResponse.json(
          { error: 'Payment service configuration error' },
          { status: 500 }
        );
      }
      if (error.message.includes('amount')) {
        return NextResponse.json(
          { error: 'Invalid payment amount' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment order',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}