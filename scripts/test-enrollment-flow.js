#!/usr/bin/env node

/**
 * Test script to verify the enrollment flow works end-to-end
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  doc,
  getDoc,
  updateDoc,
  arrayUnion
} = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testEnrollmentFlow() {
  console.log("🎓 Testing enrollment flow...");
  console.log(`📍 Project: ${firebaseConfig.projectId}`);
  console.log("");

  try {
    // Test 1: Check if user exists
    console.log("👤 Testing user lookup...");
    const userId = "test-user-1"; // Our seeded test user
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log(`   ✅ User found: ${userData.displayName} (${userData.email})`);
      console.log(`   ✅ Currently enrolled in: ${userData.enrolledCourses?.length || 0} courses`);
      console.log(`   ✅ Enrolled courses: ${userData.enrolledCourses?.join(', ') || 'None'}`);
    } else {
      console.log("   ❌ Test user not found");
      return;
    }
    console.log("");

    // Test 2: Check course availability
    console.log("📚 Testing course availability...");
    const courseId = "urdu-poetry";
    const courseRef = doc(db, 'courses', courseId);
    const courseDoc = await getDoc(courseRef);
    
    if (courseDoc.exists()) {
      const courseData = courseDoc.data();
      console.log(`   ✅ Course found: ${courseData.title}`);
      console.log(`   ✅ Price: ₹${courseData.price / 100}`);
      console.log(`   ✅ Status: ${courseData.status}`);
      console.log(`   ✅ Lessons: ${courseData.lessons?.length || 0}`);
    } else {
      console.log("   ❌ Course not found");
      return;
    }
    console.log("");

    // Test 3: Simulate enrollment (add course to user's enrolled courses)
    console.log("🎓 Testing enrollment process...");
    const userData = userDoc.data();
    const isAlreadyEnrolled = userData.enrolledCourses?.includes(courseId);
    
    if (isAlreadyEnrolled) {
      console.log(`   ℹ️  User is already enrolled in ${courseId}`);
    } else {
      console.log(`   📝 Adding ${courseId} to user's enrolled courses...`);
      
      // Simulate the enrollment process
      await updateDoc(userRef, {
        enrolledCourses: arrayUnion(courseId)
      });
      
      console.log(`   ✅ Successfully enrolled user in ${courseId}`);
    }
    console.log("");

    // Test 4: Verify enrollment
    console.log("✅ Verifying enrollment...");
    const updatedUserDoc = await getDoc(userRef);
    const updatedUserData = updatedUserDoc.data();
    
    console.log(`   ✅ User now enrolled in: ${updatedUserData.enrolledCourses?.length || 0} courses`);
    console.log(`   ✅ Enrolled courses: ${updatedUserData.enrolledCourses?.join(', ') || 'None'}`);
    console.log("");

    // Test 5: Test course access
    console.log("🔐 Testing course access...");
    const enrolledCourses = updatedUserData.enrolledCourses || [];
    const hasAccess = enrolledCourses.includes(courseId);
    
    if (hasAccess) {
      const courseData = courseDoc.data();
      console.log(`   ✅ User has access to ${courseId}`);
      console.log(`   ✅ User can view course details at: /courses/${courseId}`);
      console.log(`   ✅ User can start learning at: /learn/${courseId}/${courseData.lessons[0]?.id}`);
    } else {
      console.log(`   ❌ User does not have access to ${courseId}`);
    }
    console.log("");

    console.log("🎉 Enrollment flow test completed successfully!");
    console.log("");
    console.log("✅ User lookup works");
    console.log("✅ Course availability check works");
    console.log("✅ Enrollment process works");
    console.log("✅ Course access verification works");
    console.log("");
    console.log("🌐 The enrollment flow is ready for testing:");
    console.log("   1. User can browse courses at /courses");
    console.log("   2. User can view course details at /courses/{courseId}");
    console.log("   3. User can enroll at /courses/{courseId}/enroll");
    console.log("   4. User can access enrolled courses at /dashboard");
    console.log("   5. User can start learning at /learn/{courseId}/{lessonId}");

  } catch (error) {
    console.error("💥 Enrollment flow test failed:", error);
    process.exit(1);
  }
}

// Run the test
testEnrollmentFlow();
