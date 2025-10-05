/**
 * Utility functions to seed sample data for development
 */

import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Course, Lesson } from '@/lib/services/course-service'

export const sampleCourses = [
  {
    id: "hindi-fundamentals",
    title: "Hindi Fundamentals",
    description: "Master the basics of Hindi language and culture",
    instructorId: "instructor-rajesh",
    instructorName: "Dr. Rajesh Kumar",
    price: 299900, // in paise (₹2999)
    currency: 'INR' as const,
    thumbnail: "/hindi-course-cover.jpg",
    status: 'published' as const,
    totalDuration: 14400, // 4 hours in seconds
    enrollmentCount: 5200,
    rating: 4.9,
    reviewCount: 1247,
    language: "Hindi",
    level: 'Beginner' as const,
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
        youtubeVideoId: "dQw4w9WgXcQ",
        duration: 600,
        order: 0,
        isPreview: true,
        learningObjectives: ["Understand Hindi's role in Indian culture"],
        resources: []
      },
      {
        id: "lesson-2", 
        title: "Devanagari Script Basics",
        description: "Learn to read and write Devanagari letters",
        youtubeVideoId: "dQw4w9WgXcQ",
        duration: 900,
        order: 1,
        isPreview: false,
        learningObjectives: ["Write basic Devanagari letters"],
        resources: []
      },
      {
        id: "lesson-3",
        title: "Basic Greetings",
        description: "Common Hindi greetings and introductions",
        youtubeVideoId: "dQw4w9WgXcQ", 
        duration: 720,
        order: 2,
        isPreview: false,
        learningObjectives: ["Use proper Hindi greetings"],
        resources: []
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
    currency: 'INR' as const,
    thumbnail: "/urdu-course-cover.jpg",
    status: 'published' as const,
    totalDuration: 10800, // 3 hours in seconds
    enrollmentCount: 2100,
    rating: 4.8,
    reviewCount: 892,
    language: "Urdu",
    level: 'Intermediate' as const,
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
        youtubeVideoId: "dQw4w9WgXcQ",
        duration: 600,
        order: 0,
        isPreview: true,
        learningObjectives: ["Understand Urdu poetry history"],
        resources: []
      },
      {
        id: "lesson-2",
        title: "Famous Urdu Poets",
        description: "Learn about Ghalib, Iqbal, and other masters",
        youtubeVideoId: "dQw4w9WgXcQ",
        duration: 900,
        order: 1,
        isPreview: false,
        learningObjectives: ["Know major Urdu poets"],
        resources: []
      }
    ]
  }
]

export async function seedCourses(): Promise<void> {
  try {
    console.log('Starting to seed courses...')
    
    for (const course of sampleCourses) {
      const { lessons, ...courseData } = course
      
      // Add timestamps
      const courseWithTimestamps = {
        ...courseData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      // Create course document
      const courseRef = doc(db, 'courses', course.id)
      await setDoc(courseRef, courseWithTimestamps)
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
    throw error
  }
}

export async function enrollUserInCourseForSeeding(userId: string, courseId: string): Promise<void> {
  try {
    const enrollmentId = `${userId}_${courseId}`
    const enrollment = {
      userId,
      courseId,
      enrolledAt: serverTimestamp(),
      status: 'active'
    }

    // Create enrollment record
    const enrollmentRef = doc(db, 'enrollments', enrollmentId)
    await setDoc(enrollmentRef, enrollment)

    // Update user's enrolled courses list
    const userRef = doc(db, 'users', userId)
    const userData = await import('@/lib/auth').then(m => m.getUserData(userId))
    
    if (userData) {
      const enrolledCourses = userData.enrolledCourses || []
      if (!enrolledCourses.includes(courseId)) {
        enrolledCourses.push(courseId)
        await setDoc(userRef, { ...userData, enrolledCourses }, { merge: true })
      }
    }

    console.log(`Enrolled user ${userId} in course ${courseId}`)
  } catch (error) {
    console.error('Error enrolling user:', error)
    throw error
  }
}

// Helper function to seed data from browser console
export function seedDataFromConsole() {
  if (typeof window !== 'undefined') {
    (window as any).seedCourses = seedCourses
    // (window as any).enrollUserInCourse = enrollUserInCourseForSeeding
    console.log('Seeding functions available: seedCourses(), enrollUserInCourse(userId, courseId)')
  }
}