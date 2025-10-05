/**
 * Script to seed sample courses into Firestore
 * Run with: node scripts/seed-courses.js
 */

const { initializeApp } = require('firebase/app')
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore')

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDkpin7IOcS-Wybwk-n2P84PPsEQd1aJ-Q",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "hindustani-tongue-lms.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "hindustani-tongue-lms",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "hindustani-tongue-lms.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1011627128879",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1011627128879:web:39828d0045a83c6e2c2eda",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const sampleCourses = [
  {
    id: "hindi-fundamentals",
    title: "Hindi Fundamentals",
    description: "Master the basics of Hindi language and culture",
    instructorId: "instructor-rajesh",
    instructorName: "Dr. Rajesh Kumar",
    price: 299900, // in paise (₹2999)
    currency: 'INR',
    thumbnail: "/hindi-course-cover.jpg",
    status: 'published',
    totalDuration: 14400, // 4 hours in seconds
    enrollmentCount: 5200,
    rating: 4.9,
    reviewCount: 1247,
    language: "Hindi",
    level: 'Beginner',
    tags: ["hindi", "devanagari", "culture", "beginner"],
    prerequisites: [],
    learningObjectives: [
      "Master Devanagari script",
      "Basic conversational Hindi",
      "Cultural understanding",
      "Pronunciation skills"
    ],
    completionThreshold: 80,
    unlockSequential: true,
    lessons: [
      {
        id: "lesson-1",
        title: "Introduction to Hindi",
        description: "Learn the basics of Hindi language and its importance",
        vimeoVideoId: "1122601079",
        duration: 600,
        order: 0,
        isPreview: true,
        learningObjectives: ["Understand Hindi's role in Indian culture"]
      },
      {
        id: "lesson-2", 
        title: "Devanagari Script Basics",
        description: "Learn to read and write Devanagari letters",
        vimeoVideoId: "1122601079",
        duration: 900,
        order: 1,
        isPreview: false,
        learningObjectives: ["Write basic Devanagari letters"]
      },
      {
        id: "lesson-3",
        title: "Basic Greetings",
        description: "Common Hindi greetings and introductions",
        vimeoVideoId: "1122601079", 
        duration: 720,
        order: 2,
        isPreview: false,
        learningObjectives: ["Use proper Hindi greetings"]
      },
      {
        id: "lesson-4",
        title: "Advanced Greetings",
        description: "Common Hindi greetings and introductions",
        vimeoVideoId: "1122601079", 
        duration: 720,
        order: 2,
        isPreview: false,
        learningObjectives: ["Use proper Hindi greetings"]
      }
    ]
  },
  {
    id: "urdu-poetry",
    title: "Urdu Poetry & Literature", 
    description: "Explore the beauty of Urdu through classical poetry",
    instructorId: "instructor-fatima",
    instructorName: "Fatima Ali",
    price: 349900, // in paise (₹3499)
    currency: 'INR',
    thumbnail: "/urdu-course-cover.jpg",
    status: 'published',
    totalDuration: 10800, // 3 hours in seconds
    enrollmentCount: 2100,
    rating: 4.8,
    reviewCount: 892,
    language: "Urdu",
    level: 'Intermediate',
    tags: ["urdu", "poetry", "literature", "intermediate"],
    prerequisites: [],
    learningObjectives: [
      "Understand classical Urdu poetry",
      "Read famous ghazals",
      "Appreciate Urdu literature",
      "Write basic poetry"
    ],
    completionThreshold: 80,
    unlockSequential: true,
    lessons: [
      {
        id: "lesson-1",
        title: "Introduction to Urdu Poetry",
        description: "Overview of Urdu literary tradition",
        vimeoVideoId: "1122601079",
        duration: 600,
        order: 0,
        isPreview: true,
        learningObjectives: ["Understand Urdu poetry history"]
      },
      {
        id: "lesson-2",
        title: "Famous Urdu Poets",
        description: "Learn about Ghalib, Iqbal, and other masters",
        vimeoVideoId: "1122601079",
        duration: 900,
        order: 1,
        isPreview: false,
        learningObjectives: ["Know major Urdu poets"]
      }
    ]
  }
]

async function seedCourses() {
  try {
    console.log('Starting to seed courses...')
    
    for (const course of sampleCourses) {
      const { lessons, ...courseData } = course
      
      // Add timestamps
      courseData.createdAt = serverTimestamp()
      courseData.updatedAt = serverTimestamp()
      
      // Create course document
      const courseRef = doc(db, 'courses', course.id)
      await setDoc(courseRef, courseData)
      console.log(`Created course: ${course.title}`)
      
      // Create lessons subcollection
      for (const lesson of lessons) {
        const lessonRef = doc(db, 'courses', course.id, 'lessons', lesson.id)
        await setDoc(lessonRef, lesson)
        console.log(`  Created lesson: ${lesson.title}`)
      }
    }
    
    console.log('Successfully seeded all courses!')
  } catch (error) {
    console.error('Error seeding courses:', error)
  }
}

// Run the seeding
seedCourses()