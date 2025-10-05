import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Enrollment {
  userId: string
  courseId: string
  enrolledAt: Date
  status: 'active' | 'completed' | 'suspended'
  progress: {
    lessonsCompleted: string[]
    overallCompletionPercentage: number
    lastAccessedAt: Date
  }
}

export class EnrollmentService {
  static async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    try {
      const enrollmentId = `${userId}_${courseId}`
      const enrollmentDoc = await getDoc(doc(db, 'enrollments', enrollmentId))
      
      if (!enrollmentDoc.exists()) return false
      
      const enrollment = enrollmentDoc.data() as Enrollment
      return enrollment.status === 'active'
    } catch (error) {
      console.error('Error checking enrollment:', error)
      return false
    }
  }

  static async enrollUser(userId: string, courseId: string): Promise<void> {
    try {
      const enrollmentId = `${userId}_${courseId}`
      const enrollment: Enrollment = {
        userId,
        courseId,
        enrolledAt: new Date(),
        status: 'active',
        progress: {
          lessonsCompleted: [],
          overallCompletionPercentage: 0,
          lastAccessedAt: new Date()
        }
      }

      await setDoc(doc(db, 'enrollments', enrollmentId), {
        ...enrollment,
        enrolledAt: serverTimestamp(),
        'progress.lastAccessedAt': serverTimestamp()
      })
    } catch (error) {
      console.error('Error enrolling user:', error)
      throw error
    }
  }

  static async updateEnrollmentProgress(
    userId: string, 
    courseId: string, 
    completedLessons: string[],
    overallProgress: number
  ): Promise<void> {
    try {
      const enrollmentId = `${userId}_${courseId}`
      await setDoc(doc(db, 'enrollments', enrollmentId), {
        'progress.lessonsCompleted': completedLessons,
        'progress.overallCompletionPercentage': overallProgress,
        'progress.lastAccessedAt': serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error('Error updating enrollment progress:', error)
    }
  }
}