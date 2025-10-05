#!/usr/bin/env node

/**
 * Database Seeding Script for Hindustani Tongue LMS
 * This script populates Firestore with sample courses and data
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  deleteDoc,
  serverTimestamp,
  Timestamp 
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

// Sample courses data
const sampleCourses = [
  {
    id: "hindi-fundamentals",
    title: "Hindi Fundamentals",
    description: "Master the basics of Hindi language and culture. Learn Devanagari script, basic grammar, and essential vocabulary through interactive lessons and cultural context.",
    instructorId: "instructor-rajesh",
    instructorName: "Dr. Rajesh Kumar",
    price: 299900, // ₹2999 in paise
    currency: 'INR',
    thumbnail: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=300&fit=crop",
    status: 'published',
    totalDuration: 14400, // 4 hours
    enrollmentCount: 0,
    rating: 4.9,
    reviewCount: 1247,
    language: "Hindi",
    level: 'Beginner',
    tags: ["hindi", "devanagari", "culture", "beginner"],
    prerequisites: [],
    learningObjectives: [
      "Master Devanagari script reading and writing",
      "Understand basic Hindi grammar structure",
      "Build essential vocabulary for daily conversations",
      "Appreciate Hindi cultural context and traditions"
    ],
    completionThreshold: 80,
    unlockSequential: true,
    lessons: [
      {
        id: "lesson-1",
        title: "Introduction to Hindi and Devanagari Script",
        description: "Learn the basics of Hindi language and introduction to Devanagari script",
        videoId: "dQw4w9WgXcQ", // Placeholder YouTube video ID
        duration: 1800, // 30 minutes
        order: 1,
        objectives: [
          "Understand Hindi language basics",
          "Learn Devanagari script introduction",
          "Practice basic letter recognition"
        ],
        resources: []
      },
      {
        id: "lesson-2",
        title: "Basic Greetings and Introductions",
        description: "Learn essential Hindi greetings and how to introduce yourself",
        videoId: "dQw4w9WgXcQ", // Placeholder YouTube video ID
        duration: 1500, // 25 minutes
        order: 2,
        objectives: [
          "Learn common Hindi greetings",
          "Practice self-introduction",
          "Understand cultural context of greetings"
        ],
        resources: []
      },
      {
        id: "lesson-3",
        title: "Numbers and Counting",
        description: "Master Hindi numbers from 1 to 100",
        videoId: "dQw4w9WgXcQ", // Placeholder YouTube video ID
        duration: 1200, // 20 minutes
        order: 3,
        objectives: [
          "Learn Hindi numbers 1-100",
          "Practice counting exercises",
          "Use numbers in daily contexts"
        ],
        resources: []
      }
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: "urdu-poetry",
    title: "Urdu Poetry & Literature",
    description: "Explore the beauty of Urdu through classical poetry and modern literature. Understand the cultural significance and literary devices used in Urdu poetry.",
    instructorId: "instructor-fatima",
    instructorName: "Fatima Ali",
    price: 349900, // ₹3499 in paise
    currency: 'INR',
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    status: 'published',
    totalDuration: 10800, // 3 hours
    enrollmentCount: 0,
    rating: 4.8,
    reviewCount: 892,
    language: "Urdu",
    level: 'Intermediate',
    tags: ["urdu", "poetry", "literature", "intermediate"],
    prerequisites: [],
    learningObjectives: [
      "Understand Urdu script and calligraphy",
      "Appreciate classical Urdu poetry",
      "Learn about famous Urdu poets",
      "Write simple Urdu poetry"
    ],
    completionThreshold: 80,
    unlockSequential: true,
    lessons: [
      {
        id: "lesson-4",
        title: "Introduction to Urdu Script",
        description: "Learn the basics of Urdu script and calligraphy",
        videoId: "dQw4w9WgXcQ", // Placeholder YouTube video ID
        duration: 1800, // 30 minutes
        order: 1,
        objectives: [
          "Understand Urdu script basics",
          "Learn calligraphy fundamentals",
          "Practice letter formation"
        ],
        resources: []
      },
      {
        id: "lesson-5",
        title: "Classical Urdu Poets",
        description: "Explore the works of famous classical Urdu poets",
        videoId: "dQw4w9WgXcQ", // Placeholder YouTube video ID
        duration: 2400, // 40 minutes
        order: 2,
        objectives: [
          "Learn about Ghalib, Mir, and Faiz",
          "Understand poetic forms",
          "Analyze famous verses"
        ],
        resources: []
      }
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: "bengali-culture",
    title: "Bengali Culture & Language",
    description: "Discover the rich culture and language of Bengal. Learn Bengali script, cultural traditions, and conversational Bengali.",
    instructorId: "instructor-deb",
    instructorName: "Dr. Debashish Chatterjee",
    price: 279900, // ₹2799 in paise
    currency: 'INR',
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    status: 'published',
    totalDuration: 12600, // 3.5 hours
    enrollmentCount: 0,
    rating: 4.7,
    reviewCount: 634,
    language: "Bengali",
    level: 'Beginner',
    tags: ["bengali", "culture", "script", "beginner"],
    prerequisites: [],
    learningObjectives: [
      "Master Bengali script (Bangla)",
      "Learn cultural traditions",
      "Build conversational skills",
      "Understand Bengali literature"
    ],
    completionThreshold: 80,
    unlockSequential: true,
    lessons: [
      {
        id: "lesson-6",
        title: "Bengali Script Basics",
        description: "Introduction to Bengali script and vowels",
        videoId: "dQw4w9WgXcQ", // Placeholder YouTube video ID
        duration: 2100, // 35 minutes
        order: 1,
        objectives: [
          "Learn Bengali script fundamentals",
          "Master vowel sounds",
          "Practice basic writing"
        ],
        resources: []
      },
      {
        id: "lesson-7",
        title: "Bengali Cultural Traditions",
        description: "Explore Bengali festivals, customs, and traditions",
        videoId: "dQw4w9WgXcQ", // Placeholder YouTube video ID
        duration: 1800, // 30 minutes
        order: 2,
        objectives: [
          "Understand Bengali festivals",
          "Learn cultural customs",
          "Appreciate traditional arts"
        ],
        resources: []
      }
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Sample user data for testing
const sampleUsers = [
  {
    id: "test-user-1",
    uid: "test-user-1",
    email: "test@example.com",
    displayName: "Test User",
    firstName: "Test",
    lastName: "User",
    photoURL: "",
    preferredLanguage: "Hindi",
    learningLevel: "Beginner",
    createdAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
    streak: 5,
    totalPoints: 150,
    enrolledCourses: ["hindi-fundamentals"],
    completedLessons: ["lesson-1"],
    achievements: ["first-lesson", "week-streak"]
  }
];

async function clearExistingData() {
  console.log("🗑️  Clearing existing data...");
  
  try {
    // Clear courses
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    for (const docSnap of coursesSnapshot.docs) {
      await deleteDoc(doc(db, 'courses', docSnap.id));
    }
    console.log("   ✅ Cleared existing courses");
    
    // Clear users (be careful with this in production)
    const usersSnapshot = await getDocs(collection(db, 'users'));
    for (const docSnap of usersSnapshot.docs) {
      await deleteDoc(doc(db, 'users', docSnap.id));
    }
    console.log("   ✅ Cleared existing users");
    
    // Clear enrollments
    const enrollmentsSnapshot = await getDocs(collection(db, 'enrollments'));
    for (const docSnap of enrollmentsSnapshot.docs) {
      await deleteDoc(doc(db, 'enrollments', docSnap.id));
    }
    console.log("   ✅ Cleared existing enrollments");
    
    // Clear user progress
    const progressSnapshot = await getDocs(collection(db, 'userProgress'));
    for (const docSnap of progressSnapshot.docs) {
      await deleteDoc(doc(db, 'userProgress', docSnap.id));
    }
    console.log("   ✅ Cleared existing user progress");
    
  } catch (error) {
    console.error("   ❌ Error clearing data:", error);
    throw error;
  }
}

async function seedCourses() {
  console.log("📚 Seeding courses...");
  
  try {
    for (const course of sampleCourses) {
      const courseRef = doc(db, 'courses', course.id);
      await setDoc(courseRef, course);
      console.log(`   ✅ Added course: ${course.title}`);
    }
    console.log(`   ✅ Successfully seeded ${sampleCourses.length} courses`);
  } catch (error) {
    console.error("   ❌ Error seeding courses:", error);
    throw error;
  }
}

async function seedUsers() {
  console.log("👥 Seeding users...");
  
  try {
    for (const user of sampleUsers) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, user);
      console.log(`   ✅ Added user: ${user.displayName}`);
    }
    console.log(`   ✅ Successfully seeded ${sampleUsers.length} users`);
  } catch (error) {
    console.error("   ❌ Error seeding users:", error);
    throw error;
  }
}

async function seedEnrollments() {
  console.log("🎓 Seeding enrollments...");
  
  try {
    for (const user of sampleUsers) {
      for (const courseId of user.enrolledCourses) {
        const enrollmentId = `${user.uid}_${courseId}`;
        const enrollmentRef = doc(db, 'enrollments', enrollmentId);
        await setDoc(enrollmentRef, {
          userId: user.uid,
          courseId: courseId,
          enrolledAt: Timestamp.now(),
          status: 'active'
        });
        console.log(`   ✅ Added enrollment: ${user.displayName} -> ${courseId}`);
      }
    }
    console.log("   ✅ Successfully seeded enrollments");
  } catch (error) {
    console.error("   ❌ Error seeding enrollments:", error);
    throw error;
  }
}

async function seedUserProgress() {
  console.log("📊 Seeding user progress...");
  
  try {
    for (const user of sampleUsers) {
      for (const courseId of user.enrolledCourses) {
        const progressId = `${user.uid}_${courseId}`;
        const progressRef = doc(db, 'userProgress', progressId);
        await setDoc(progressRef, {
          userId: user.uid,
          courseId: courseId,
          enrolledAt: Timestamp.now(),
          lastAccessedAt: Timestamp.now(),
          currentLessonId: "lesson-1",
          lessonsCompleted: user.completedLessons,
          totalWatchTime: 1800, // 30 minutes
          overallProgress: 25, // 25% completion
          lessonProgress: {
            "lesson-1": {
              completed: true,
              completionPercentage: 100,
              lastWatchedAt: Timestamp.now(),
              watchTime: 1800
            }
          }
        });
        console.log(`   ✅ Added progress: ${user.displayName} -> ${courseId}`);
      }
    }
    console.log("   ✅ Successfully seeded user progress");
  } catch (error) {
    console.error("   ❌ Error seeding user progress:", error);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting database seeding for Hindustani Tongue LMS...");
  console.log(`📍 Project: ${firebaseConfig.projectId}`);
  console.log("");
  
  try {
    // Step 1: Clear existing data
    await clearExistingData();
    console.log("");
    
    // Step 2: Seed courses
    await seedCourses();
    console.log("");
    
    // Step 3: Seed users
    await seedUsers();
    console.log("");
    
    // Step 4: Seed enrollments
    await seedEnrollments();
    console.log("");
    
    // Step 5: Seed user progress
    await seedUserProgress();
    console.log("");
    
    console.log("🎉 Database seeding completed successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log(`   • Courses: ${sampleCourses.length}`);
    console.log(`   • Users: ${sampleUsers.length}`);
    console.log(`   • Enrollments: ${sampleUsers.reduce((acc, user) => acc + user.enrolledCourses.length, 0)}`);
    console.log("");
    console.log("🌐 You can now:");
    console.log("   1. Visit http://localhost:3002/login");
    console.log("   2. Login with test@example.com (or create a new account)");
    console.log("   3. Visit http://localhost:3002/dashboard");
    console.log("   4. See populated courses and progress!");
    
  } catch (error) {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding
main();
