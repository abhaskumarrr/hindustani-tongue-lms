/**
 * Course Service Integration Example
 * 
 * This file demonstrates how to integrate the CourseService with existing components
 * and shows the integration with the ProgressService for complete functionality.
 */

import { CourseService } from './course-service'
import { ProgressService } from './progress-service'

/**
 * Example: Complete lesson page data loading
 * This shows how a lesson page component would load all necessary data
 */
export async function loadLessonPageData(
  userId: string,
  courseId: string,
  lessonId: string
) {
  try {
    // 1. Verify user has access to this lesson
    const lessonAccess = await CourseService.verifyLessonAccess(userId, courseId, lessonId)
    
    if (!lessonAccess.hasAccess) {
      return {
        error: `Access denied: ${lessonAccess.reason}`,
        redirectTo: lessonAccess.reason === 'not_enrolled' ? `/courses/${courseId}/enroll` : '/courses'
      }
    }

    // 2. Load course navigation data
    const navigationData = await CourseService.getCourseNavigation(userId, courseId)
    
    if (!navigationData) {
      return { error: 'Course not found' }
    }

    // 3. Load lesson-specific progress
    const lessonProgress = await ProgressService.getLessonProgress(userId, courseId, lessonId)

    // 4. Get current lesson details
    const currentLesson = await CourseService.getLesson(courseId, lessonId)

    return {
      course: navigationData.course,
      currentLesson,
      nextLesson: navigationData.nextLesson,
      previousLesson: navigationData.previousLesson,
      accessibleLessons: navigationData.accessibleLessons,
      courseProgress: navigationData.progress,
      moduleProgress: navigationData.moduleProgress,
      lessonProgress,
      hasAccess: true
    }
  } catch (error) {
    console.error('Error loading lesson page data:', error)
    return { error: 'Failed to load lesson data' }
  }
}

/**
 * Example: Course enrollment flow
 * This shows how to handle the complete enrollment process
 */
export async function handleCourseEnrollment(
  userId: string,
  courseId: string,
  paymentId?: string
) {
  try {
    // 1. Check if user is already enrolled
    const isAlreadyEnrolled = await CourseService.isUserEnrolled(userId, courseId)
    
    if (isAlreadyEnrolled) {
      return { success: false, message: 'Already enrolled in this course' }
    }

    // 2. Enroll user in course
    const enrollment = await CourseService.enrollUser(userId, courseId, paymentId)

    // 3. Initialize course progress
    await CourseService.initializeCourseProgress(userId, courseId)

    // 4. Initialize offline sync for this user
    await ProgressService.initializeOfflineSync(userId)

    return {
      success: true,
      enrollment,
      message: 'Successfully enrolled in course',
      redirectTo: `/learn/${courseId}`
    }
  } catch (error) {
    console.error('Error enrolling user:', error)
    return { success: false, message: 'Failed to enroll in course' }
  }
}

/**
 * Example: Video progress update with lesson unlocking
 * This shows how to handle video progress updates and automatic lesson unlocking
 */
export async function handleVideoProgressUpdate(
  userId: string,
  courseId: string,
  lessonId: string,
  currentTime: number,
  duration: number
) {
  try {
    const completionPercentage = (currentTime / duration) * 100

    // 1. Save progress using ProgressService
    await ProgressService.saveVideoProgress(userId, courseId, lessonId, {
      currentTime,
      duration,
      completionPercentage,
      isCompleted: completionPercentage >= 80,
      watchedSeconds: currentTime,
      totalSeconds: duration,
      lastUpdated: new Date()
    })

    // 2. Check if lesson should be unlocked using CourseService
    const unlockResult = await CourseService.updateLessonCompletion(
      userId,
      courseId,
      lessonId,
      completionPercentage
    )

    // 3. Return update results
    return {
      progressUpdated: true,
      lessonCompleted: unlockResult.lessonCompleted,
      nextLessonUnlocked: unlockResult.nextLessonUnlocked,
      completionPercentage: Math.round(completionPercentage)
    }
  } catch (error) {
    console.error('Error updating video progress:', error)
    return { progressUpdated: false, error: 'Failed to update progress' }
  }
}

/**
 * Example: Dashboard data loading
 * This shows how to load all data needed for a user dashboard
 */
export async function loadDashboardData(userId: string) {
  try {
    // 1. Get user's enrolled courses with progress
    const enrolledCourses = await CourseService.getUserEnrolledCourses(userId)

    // 2. Get recommended courses
    const recommendedCourses = await CourseService.getRecommendedCourses(userId, 5)

    // 3. Calculate overall learning statistics
    const totalCourses = enrolledCourses.length
    const completedCourses = enrolledCourses.filter(c => c.progress.overallCompletion >= 80).length
    const totalLessonsCompleted = enrolledCourses.reduce(
      (sum, course) => sum + course.progress.lessonsCompleted, 0
    )

    // 4. Find current course (most recently accessed)
    const currentCourse = enrolledCourses.reduce((latest, course) => {
      if (!latest) return course
      return course.progress.overallCompletion < 100 && 
             course.progress.overallCompletion > latest.progress.overallCompletion 
        ? course : latest
    }, enrolledCourses[0])

    return {
      enrolledCourses,
      recommendedCourses,
      currentCourse,
      stats: {
        totalCourses,
        completedCourses,
        totalLessonsCompleted,
        completionRate: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0
      }
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    return { error: 'Failed to load dashboard data' }
  }
}

/**
 * Example: Course browsing with enrollment status
 * This shows how to load courses for browsing with user-specific enrollment status
 */
export async function loadCourseBrowsingData(
  userId: string,
  filters: {
    language?: string
    level?: string
    search?: string
    page?: number
  } = {}
) {
  try {
    // 1. Search courses based on filters
    const courses = await CourseService.searchCourses({
      query: filters.search,
      language: filters.language,
      level: filters.level
    })

    // 2. Get user's enrolled course IDs for enrollment status
    const enrolledCourses = await CourseService.getUserEnrolledCourses(userId)
    const enrolledCourseIds = new Set(enrolledCourses.map(c => c.id))

    // 3. Add enrollment status to each course
    const coursesWithStatus = courses.map(course => ({
      ...course,
      isEnrolled: enrolledCourseIds.has(course.id),
      userProgress: enrolledCourses.find(ec => ec.id === course.id)?.progress
    }))

    // 4. Implement simple pagination
    const pageSize = 12
    const page = filters.page || 1
    const startIndex = (page - 1) * pageSize
    const paginatedCourses = coursesWithStatus.slice(startIndex, startIndex + pageSize)

    return {
      courses: paginatedCourses,
      totalCourses: coursesWithStatus.length,
      currentPage: page,
      totalPages: Math.ceil(coursesWithStatus.length / pageSize),
      hasNextPage: startIndex + pageSize < coursesWithStatus.length
    }
  } catch (error) {
    console.error('Error loading course browsing data:', error)
    return { error: 'Failed to load courses' }
  }
}

/**
 * Example: Instructor analytics data
 * This shows how an instructor can get analytics for their courses
 */
export async function loadInstructorAnalytics(instructorId: string) {
  try {
    // 1. Get instructor's courses
    const { courses } = await CourseService.getCourses({
      instructorId,
      status: 'published'
    })

    // 2. Get statistics for each course
    const courseAnalytics = await Promise.all(
      courses.map(async (course) => {
        const stats = await CourseService.getCourseStatistics(course.id)
        const difficulty = await CourseService.getCourseDifficultyScore(course.id)
        
        return {
          course,
          stats,
          difficulty
        }
      })
    )

    // 3. Calculate overall instructor statistics
    const totalRevenue = courseAnalytics.reduce((sum, ca) => sum + ca.stats.totalRevenue, 0)
    const totalStudents = courseAnalytics.reduce((sum, ca) => sum + ca.stats.enrollmentCount, 0)
    const averageRating = courseAnalytics.length > 0 
      ? courseAnalytics.reduce((sum, ca) => sum + ca.stats.averageRating, 0) / courseAnalytics.length
      : 0

    return {
      courses: courseAnalytics,
      overallStats: {
        totalCourses: courses.length,
        totalRevenue,
        totalStudents,
        averageRating: Math.round(averageRating * 10) / 10
      }
    }
  } catch (error) {
    console.error('Error loading instructor analytics:', error)
    return { error: 'Failed to load analytics' }
  }
}

/**
 * Example: Offline sync management
 * This shows how to handle offline progress synchronization
 */
export async function handleOfflineSync(userId: string) {
  try {
    // 1. Check offline progress status
    const offlineStatus = ProgressService.getOfflineProgressStatus(userId)
    
    if (!offlineStatus || offlineStatus.pendingUpdates.length === 0) {
      return { message: 'No offline progress to sync' }
    }

    // 2. Attempt to sync offline progress
    await ProgressService.syncOfflineProgress(userId)

    // 3. Check if sync was successful
    const updatedStatus = ProgressService.getOfflineProgressStatus(userId)
    const remainingUpdates = updatedStatus?.pendingUpdates.length || 0

    return {
      syncCompleted: true,
      syncedUpdates: offlineStatus.pendingUpdates.length - remainingUpdates,
      remainingUpdates,
      message: remainingUpdates > 0 
        ? `Synced progress, ${remainingUpdates} updates still pending`
        : 'All offline progress synced successfully'
    }
  } catch (error) {
    console.error('Error syncing offline progress:', error)
    return { syncCompleted: false, error: 'Failed to sync offline progress' }
  }
}