/**
 * Course Access Control System
 * 
 * Provides comprehensive access control for course content including:
 * - Course enrollment verification for all lesson access
 * - Enrollment checking service with Firestore queries
 * - Clear error messaging for unauthorized access attempts
 * 
 * Requirements: 3.1 - Content protection and enrollment verification
 */

import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { CourseService, AccessControlResult } from '@/lib/services/course-service'
import { UserData } from '@/lib/auth'

// Access control result types
export interface AccessCheckResult {
  hasAccess: boolean
  reason?: AccessDeniedReason
  message?: string
  redirectTo?: string
  enrollmentRequired?: boolean
  courseId?: string
  lessonId?: string
}

export type AccessDeniedReason = 
  | 'not_authenticated'
  | 'not_enrolled' 
  | 'payment_pending'
  | 'suspended'
  | 'expired'
  | 'lesson_locked'
  | 'previous_lessons_incomplete'
  | 'course_not_found'
  | 'lesson_not_found'
  | 'verification_error'

// Access control configuration
export interface AccessControlConfig {
  requireAuthentication: boolean
  requireEnrollment: boolean
  checkSequentialUnlock: boolean
  allowPreviewLessons: boolean
}

export class AccessControlService {
  /**
   * Default access control configuration
   */
  private static readonly DEFAULT_CONFIG: AccessControlConfig = {
    requireAuthentication: true,
    requireEnrollment: true,
    checkSequentialUnlock: true,
    allowPreviewLessons: true
  }

  /**
   * Check if user has access to a specific course
   */
  static async checkCourseAccess(
    userId: string | null,
    courseId: string,
    config: Partial<AccessControlConfig> = {}
  ): Promise<AccessCheckResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config }

    try {
      // Check authentication if required
      if (finalConfig.requireAuthentication && !userId) {
        return {
          hasAccess: false,
          reason: 'not_authenticated',
          message: 'You must be logged in to access this course.',
          redirectTo: '/login',
          enrollmentRequired: false,
          courseId
        }
      }

      // If authentication not required, allow access
      if (!finalConfig.requireAuthentication) {
        return { hasAccess: true }
      }

      // Check if course exists
      const course = await CourseService.getCourse(courseId)
      if (!course) {
        return {
          hasAccess: false,
          reason: 'course_not_found',
          message: 'The requested course could not be found.',
          redirectTo: '/courses',
          enrollmentRequired: false,
          courseId
        }
      }

      // Check enrollment if required
      if (finalConfig.requireEnrollment) {
        const accessResult = await CourseService.verifyCourseAccess(userId!, courseId)
        
        if (!accessResult.hasAccess) {
          return this.mapAccessControlResult(accessResult, courseId)
        }
      }

      return { hasAccess: true }
    } catch (error) {
      console.error('Error checking course access:', error)
      return {
        hasAccess: false,
        reason: 'verification_error',
        message: 'Unable to verify course access. Please try again.',
        enrollmentRequired: false,
        courseId
      }
    }
  }

  /**
   * Check if user has access to a specific lesson
   */
  static async checkLessonAccess(
    userId: string | null,
    courseId: string,
    lessonId: string,
    config: Partial<AccessControlConfig> = {}
  ): Promise<AccessCheckResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config }

    try {
      // First check course access
      const courseAccess = await this.checkCourseAccess(userId, courseId, config)
      if (!courseAccess.hasAccess) {
        return {
          ...courseAccess,
          lessonId
        }
      }

      // If course access is granted but no enrollment check was required, return success
      if (!finalConfig.requireEnrollment || !userId) {
        return { hasAccess: true }
      }

      // Check specific lesson access with sequential unlock rules
      if (finalConfig.checkSequentialUnlock) {
        const lessonAccess = await CourseService.verifyLessonAccess(userId, courseId, lessonId)
        
        if (!lessonAccess.hasAccess) {
          return this.mapLessonAccessResult(lessonAccess, courseId, lessonId)
        }
      }

      return { hasAccess: true }
    } catch (error) {
      console.error('Error checking lesson access:', error)
      return {
        hasAccess: false,
        reason: 'verification_error',
        message: 'Unable to verify lesson access. Please try again.',
        enrollmentRequired: false,
        courseId,
        lessonId
      }
    }
  }

  /**
   * Check if user has access to course enrollment page
   */
  static async checkEnrollmentPageAccess(
    userId: string | null,
    courseId: string
  ): Promise<AccessCheckResult> {
    try {
      // Authentication is required for enrollment
      if (!userId) {
        return {
          hasAccess: false,
          reason: 'not_authenticated',
          message: 'You must be logged in to enroll in courses.',
          redirectTo: '/login',
          enrollmentRequired: false,
          courseId
        }
      }

      // Check if course exists
      const course = await CourseService.getCourse(courseId)
      if (!course) {
        return {
          hasAccess: false,
          reason: 'course_not_found',
          message: 'The requested course could not be found.',
          redirectTo: '/courses',
          enrollmentRequired: false,
          courseId
        }
      }

      // Check if user is already enrolled
      const isEnrolled = await CourseService.isUserEnrolled(userId, courseId)
      if (isEnrolled) {
        return {
          hasAccess: false,
          reason: 'not_enrolled', // Using this to indicate already enrolled
          message: 'You are already enrolled in this course.',
          redirectTo: `/learn/${courseId}`,
          enrollmentRequired: false,
          courseId
        }
      }

      return { hasAccess: true }
    } catch (error) {
      console.error('Error checking enrollment page access:', error)
      return {
        hasAccess: false,
        reason: 'verification_error',
        message: 'Unable to verify enrollment access. Please try again.',
        enrollmentRequired: false,
        courseId
      }
    }
  }

  /**
   * Get user's enrollment status for a course
   */
  static async getUserEnrollmentStatus(
    userId: string,
    courseId: string
  ): Promise<{
    isEnrolled: boolean
    enrollmentData?: any
    accessResult?: AccessControlResult
  }> {
    try {
      const isEnrolled = await CourseService.isUserEnrolled(userId, courseId)
      
      if (isEnrolled) {
        const accessResult = await CourseService.verifyCourseAccess(userId, courseId)
        return {
          isEnrolled: true,
          enrollmentData: accessResult.enrollmentStatus,
          accessResult
        }
      }

      return { isEnrolled: false }
    } catch (error) {
      console.error('Error getting enrollment status:', error)
      return { isEnrolled: false }
    }
  }

  /**
   * Get accessible lessons for a user in a course
   */
  static async getAccessibleLessons(
    userId: string | null,
    courseId: string,
    config: Partial<AccessControlConfig> = {}
  ): Promise<{
    lessons: any[]
    accessibleCount: number
    totalCount: number
  }> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config }

    try {
      // If no authentication required, get all lessons
      if (!finalConfig.requireAuthentication || !userId) {
        const course = await CourseService.getCourse(courseId)
        const lessons = course?.lessons || []
        
        // Return only preview lessons if not authenticated
        if (!userId && finalConfig.allowPreviewLessons) {
          const previewLessons = lessons.filter(lesson => lesson.isPreview)
          return {
            lessons: previewLessons,
            accessibleCount: previewLessons.length,
            totalCount: lessons.length
          }
        }
        
        return {
          lessons,
          accessibleCount: lessons.length,
          totalCount: lessons.length
        }
      }

      // Get accessible lessons based on enrollment and progress
      const accessibleLessons = await CourseService.getAccessibleLessons(userId, courseId)
      const course = await CourseService.getCourse(courseId)
      const totalLessons = course?.lessons || []

      return {
        lessons: accessibleLessons,
        accessibleCount: accessibleLessons.length,
        totalCount: totalLessons.length
      }
    } catch (error) {
      console.error('Error getting accessible lessons:', error)
      return {
        lessons: [],
        accessibleCount: 0,
        totalCount: 0
      }
    }
  }

  /**
   * Validate route access for middleware
   */
  static async validateRouteAccess(
    userId: string | null,
    pathname: string
  ): Promise<{
    allowed: boolean
    redirectTo?: string
    reason?: string
  }> {
    // Extract course and lesson IDs from pathname
    const courseMatch = pathname.match(/\/courses\/([^\/]+)/)
    const learnMatch = pathname.match(/\/learn\/([^\/]+)(?:\/([^\/]+))?/)
    const enrollMatch = pathname.match(/\/courses\/([^\/]+)\/enroll/)

    try {
      // Handle course enrollment pages
      if (enrollMatch) {
        const courseId = enrollMatch[1]
        const access = await this.checkEnrollmentPageAccess(userId, courseId)
        
        if (!access.hasAccess) {
          return {
            allowed: false,
            redirectTo: access.redirectTo || '/courses',
            reason: access.message
          }
        }
        
        return { allowed: true }
      }

      // Handle learning pages
      if (learnMatch) {
        const courseId = learnMatch[1]
        const lessonId = learnMatch[2]

        if (lessonId) {
          // Specific lesson access
          const access = await this.checkLessonAccess(userId, courseId, lessonId)
          
          if (!access.hasAccess) {
            return {
              allowed: false,
              redirectTo: access.redirectTo || `/courses/${courseId}`,
              reason: access.message
            }
          }
        } else {
          // Course overview access
          const access = await this.checkCourseAccess(userId, courseId)
          
          if (!access.hasAccess) {
            return {
              allowed: false,
              redirectTo: access.redirectTo || '/courses',
              reason: access.message
            }
          }
        }
        
        return { allowed: true }
      }

      // Handle course detail pages
      if (courseMatch) {
        const courseId = courseMatch[1]
        
        // Course detail pages are generally accessible for browsing
        // but we should check if course exists
        const course = await CourseService.getCourse(courseId)
        if (!course) {
          return {
            allowed: false,
            redirectTo: '/courses',
            reason: 'Course not found'
          }
        }
        
        return { allowed: true }
      }

      // For other protected routes, just check authentication
      const protectedRoutes = ['/dashboard', '/profile', '/settings']
      if (protectedRoutes.some(route => pathname.startsWith(route))) {
        if (!userId) {
          return {
            allowed: false,
            redirectTo: '/login',
            reason: 'Authentication required'
          }
        }
      }

      return { allowed: true }
    } catch (error) {
      console.error('Error validating route access:', error)
      return {
        allowed: false,
        redirectTo: '/courses',
        reason: 'Unable to verify access'
      }
    }
  }

  /**
   * Map CourseService AccessControlResult to our AccessCheckResult
   */
  private static mapAccessControlResult(
    result: AccessControlResult,
    courseId: string
  ): AccessCheckResult {
    const reasonMap: Record<string, { reason: AccessDeniedReason, message: string, redirectTo?: string }> = {
      'not_enrolled': {
        reason: 'not_enrolled',
        message: 'You need to enroll in this course to access its content.',
        redirectTo: `/courses/${courseId}/enroll`
      },
      'payment_pending': {
        reason: 'payment_pending',
        message: 'Your payment is being processed. Please try again in a few minutes.',
        redirectTo: `/courses/${courseId}`
      },
      'suspended': {
        reason: 'suspended',
        message: 'Your access to this course has been suspended. Please contact support.',
        redirectTo: '/support'
      },
      'expired': {
        reason: 'expired',
        message: 'Your access to this course has expired. Please renew your enrollment.',
        redirectTo: `/courses/${courseId}/enroll`
      }
    }

    const mapped = reasonMap[result.reason || 'not_enrolled'] || reasonMap['not_enrolled']
    
    return {
      hasAccess: false,
      reason: mapped.reason,
      message: mapped.message,
      redirectTo: mapped.redirectTo,
      enrollmentRequired: true,
      courseId
    }
  }

  /**
   * Map lesson access result to our AccessCheckResult
   */
  private static mapLessonAccessResult(
    result: { hasAccess: boolean, reason?: string },
    courseId: string,
    lessonId: string
  ): AccessCheckResult {
    const reasonMap: Record<string, { reason: AccessDeniedReason, message: string }> = {
      'not_enrolled': {
        reason: 'not_enrolled',
        message: 'You need to enroll in this course to access this lesson.'
      },
      'previous_lessons_incomplete': {
        reason: 'previous_lessons_incomplete',
        message: 'Complete the previous lessons to unlock this one. You need to watch 80% of each lesson to proceed.'
      },
      'lesson_not_found': {
        reason: 'lesson_not_found',
        message: 'The requested lesson could not be found.'
      },
      'course_not_found': {
        reason: 'course_not_found',
        message: 'The course for this lesson could not be found.'
      }
    }

    const mapped = reasonMap[result.reason || 'lesson_locked'] || {
      reason: 'lesson_locked' as AccessDeniedReason,
      message: 'This lesson is currently locked.'
    }
    
    return {
      hasAccess: false,
      reason: mapped.reason,
      message: mapped.message,
      redirectTo: `/learn/${courseId}`,
      enrollmentRequired: result.reason === 'not_enrolled',
      courseId,
      lessonId
    }
  }

  /**
   * Helper method to check if a user exists and get their data
   */
  private static async getUserData(userId: string): Promise<UserData | null> {
    try {
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        return userSnap.data() as UserData
      }
      
      return null
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }
}

/**
 * Convenience functions for common access checks
 */

/**
 * Check if user can access a course
 */
export const checkCourseAccess = (
  userId: string | null,
  courseId: string,
  config?: Partial<AccessControlConfig>
) => AccessControlService.checkCourseAccess(userId, courseId, config)

/**
 * Check if user can access a lesson
 */
export const checkLessonAccess = (
  userId: string | null,
  courseId: string,
  lessonId: string,
  config?: Partial<AccessControlConfig>
) => AccessControlService.checkLessonAccess(userId, courseId, lessonId, config)

/**
 * Check if user can access enrollment page
 */
export const checkEnrollmentPageAccess = (
  userId: string | null,
  courseId: string
) => AccessControlService.checkEnrollmentPageAccess(userId, courseId)

/**
 * Get user's enrollment status
 */
export const getUserEnrollmentStatus = (
  userId: string,
  courseId: string
) => AccessControlService.getUserEnrollmentStatus(userId, courseId)

/**
 * Get accessible lessons for user
 */
export const getAccessibleLessons = (
  userId: string | null,
  courseId: string,
  config?: Partial<AccessControlConfig>
) => AccessControlService.getAccessibleLessons(userId, courseId, config)

/**
 * Validate route access for middleware
 */
export const validateRouteAccess = (
  userId: string | null,
  pathname: string
) => AccessControlService.validateRouteAccess(userId, pathname)