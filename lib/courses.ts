import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import { UserData } from './auth'
import { Lesson } from './types/video'

// Legacy Course interface - kept for backward compatibility
// New implementations should use Course interface from course-service.ts
export interface LegacyCourse {
  id: string
  title: string
  language: string
  level: string
  instructor: string
  price: number
  lessonsCount: number
  duration: string
  description: string
  thumbnail?: string
  // Video-related fields
  modules?: CourseModule[]
  lessons?: Lesson[]
  videoCount?: number
  totalVideoDuration?: number
  hasVideoContent?: boolean
  completionThreshold?: number // Default 80%
  unlockSequential?: boolean // Default true
}

// Re-export for backward compatibility
export interface Course extends LegacyCourse {}

export interface CourseModule {
  id: string
  title: string
  description: string
  moduleIndex: number
  lessons: string[] // Array of lesson IDs
  isLocked: boolean
  prerequisites?: string[]
  estimatedDuration: number
}

// Enroll user in a course
export const enrollInCourse = async (userId: string, courseId: string) => {
  try {
    const userRef = doc(db, 'users', userId)
    
    // Add course to user's enrolled courses
    await updateDoc(userRef, {
      enrolledCourses: arrayUnion(courseId)
    })
    
    return true
  } catch (error) {
    console.error('Error enrolling in course:', error)
    throw error
  }
}

// Check if user is enrolled in a course
export const isEnrolledInCourse = async (userId: string, courseId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserData
      return userData.enrolledCourses?.includes(courseId) || false
    }
    
    return false
  } catch (error) {
    console.error('Error checking course enrollment:', error)
    return false
  }
}

// Mark lesson as completed
export const markLessonCompleted = async (userId: string, lessonId: string) => {
  try {
    const userRef = doc(db, 'users', userId)
    
    await updateDoc(userRef, {
      completedLessons: arrayUnion(lessonId)
    })
    
    return true
  } catch (error) {
    console.error('Error marking lesson as completed:', error)
    throw error
  }
}

// Update user points and streak
export const updateUserProgress = async (userId: string, pointsToAdd: number) => {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserData
      const newPoints = (userData.totalPoints || 0) + pointsToAdd
      
      // Simple streak logic - in a real app, you'd check last activity date
      const newStreak = (userData.streak || 0) + 1
      
      await updateDoc(userRef, {
        totalPoints: newPoints,
        streak: newStreak
      })
      
      return { points: newPoints, streak: newStreak }
    }
    
    throw new Error('User not found')
  } catch (error) {
    console.error('Error updating user progress:', error)
    throw error
  }
}