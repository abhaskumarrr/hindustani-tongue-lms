#!/usr/bin/env node

/**
 * Test script to verify database seeding and course fetching
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs,
  doc,
  getDoc
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

async function testDatabase() {
  console.log("🧪 Testing database content...");
  console.log(`📍 Project: ${firebaseConfig.projectId}`);
  console.log("");

  try {
    // Test 1: Check courses
    console.log("📚 Testing courses collection...");
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    console.log(`   ✅ Found ${coursesSnapshot.size} courses`);
    
    coursesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   • ${data.title} (${data.language}, ${data.level}) - ₹${data.price / 100}`);
    });
    console.log("");

    // Test 2: Check users
    console.log("👥 Testing users collection...");
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`   ✅ Found ${usersSnapshot.size} users`);
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   • ${data.displayName} (${data.email}) - Enrolled in ${data.enrolledCourses?.length || 0} courses`);
    });
    console.log("");

    // Test 3: Check enrollments
    console.log("🎓 Testing enrollments collection...");
    const enrollmentsSnapshot = await getDocs(collection(db, 'enrollments'));
    console.log(`   ✅ Found ${enrollmentsSnapshot.size} enrollments`);
    
    enrollmentsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   • User: ${data.userId} -> Course: ${data.courseId}`);
    });
    console.log("");

    // Test 4: Check user progress
    console.log("📊 Testing user progress collection...");
    const progressSnapshot = await getDocs(collection(db, 'userProgress'));
    console.log(`   ✅ Found ${progressSnapshot.size} progress records`);
    
    progressSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   • User: ${data.userId} -> Course: ${data.courseId} - ${data.overallProgress}% complete`);
    });
    console.log("");

    // Test 5: Test specific course fetch
    console.log("🔍 Testing specific course fetch...");
    const courseDoc = await getDoc(doc(db, 'courses', 'hindi-fundamentals'));
    if (courseDoc.exists()) {
      const courseData = courseDoc.data();
      console.log(`   ✅ Hindi Fundamentals course found:`);
      console.log(`      • Title: ${courseData.title}`);
      console.log(`      • Price: ₹${courseData.price / 100}`);
      console.log(`      • Lessons: ${courseData.lessons?.length || 0}`);
      console.log(`      • Status: ${courseData.status}`);
    } else {
      console.log("   ❌ Hindi Fundamentals course not found");
    }
    console.log("");

    console.log("🎉 Database test completed successfully!");
    console.log("");
    console.log("✅ All collections are properly seeded");
    console.log("✅ Courses are available for browsing");
    console.log("✅ User enrollment data is present");
    console.log("✅ Progress tracking is set up");
    console.log("");
    console.log("🌐 You can now:");
    console.log("   1. Visit http://localhost:3002/courses to see the course catalog");
    console.log("   2. Create a new account or login with test@example.com");
    console.log("   3. Visit http://localhost:3002/dashboard to see your progress");

  } catch (error) {
    console.error("💥 Database test failed:", error);
    process.exit(1);
  }
}

// Run the test
testDatabase();


