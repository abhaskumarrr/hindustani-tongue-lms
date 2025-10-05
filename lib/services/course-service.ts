/**
 * Course Data Management Service
 * 
 * Provides comprehensive course data management with Firestore integration,
 * lesson fetching, course structure management, enrollment verification,
 * and course progress calculation and tracking.
 * 
 * Requirements: 2.2, 3.1 - Course navigation and access control
 */

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { UserProgress, LessonProgress, CourseProgress, ModuleProgress } from '@/lib/types/progress'
import { Course, Lesson, CourseModule } from '@/lib/types/video'

// Enrollment and Access Control interfaces
export interface CourseEnrollment {
  userId: string
  courseId: string
  enrolledAt: Timestamp
  paymentId?: string
  status: 'active' | 'suspended' | 'completed'
  accessExpiresAt?: Timestamp
  certificateIssued?: boolean
}

export interface AccessControlResult {
  hasAccess: boolean
  reason?: 'not_enrolled' | 'payment_pending' | 'suspended' | 'expired'
  enrollmentStatus?: CourseEnrollment
}

export class CourseService {
  private static readonly COURSES_COLLECTION = 'courses'
  private static readonly LESSONS_COLLECTION = 'lessons'
  private static readonly MODULES_COLLECTION = 'modules'
  private static readonly ENROLLMENTS_COLLECTION = 'enrollments'
  private static readonly USER_PROGRESS_COLLECTION = 'userProgress'

  /**
   * Course Data Management
   */

  /**
   * Get a single course by ID with full details
   */
  static async getCourse(courseId: string): Promise<Course | null> {
    try {
      const courseRef = doc(db, this.COURSES_COLLECTION, courseId)
      const courseSnap = await getDoc(courseRef)

      if (!courseSnap.exists()) {
        return null
      }

      const courseData = courseSnap.data() as Course
      
      // Fetch lessons for this course
      const lessons = await this.getCourseLessons(courseId)
      
      // Fetch modules if they exist
      const modules = await this.getCourseModules(courseId)

      return {
        ...courseData,
        id: courseSnap.id,
        lessons,
        modules
      }
    } catch (error) {
      console.error('Error fetching course:', error)
      throw new Error(`Failed to fetch course: ${error}`)
    }
  }

  /**
   * Get multiple courses with filtering and pagination
   */
  static async getCourses(options: {
    status?: Course['status']
    instructorId?: string
    language?: string
    level?: string
    limit?: number
    startAfter?: DocumentSnapshot
    orderBy?: 'createdAt' | 'rating' | 'enrollmentCount' | 'title'
    orderDirection?: 'asc' | 'desc'
  } = {}): Promise<{ courses: Course[], lastDoc?: QueryDocumentSnapshot }> {
    try {
      const {
        status = 'published',
        instructorId,
        language,
        level,
        limit: queryLimit = 20,
        startAfter: startAfterDoc,
        orderBy: orderByField = 'createdAt',
        orderDirection = 'desc'
      } = options

      let q = query(
        collection(db, this.COURSES_COLLECTION),
        where('status', '==', status),
        limit(queryLimit)
      )

      // Add additional filters
      if (instructorId) {
        q = query(q, where('instructorId', '==', instructorId))
      }
      if (language) {
        q = query(q, where('language', '==', language))
      }
      if (level) {
        q = query(q, where('level', '==', level))
      }

      // Add pagination
      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc))
      }

      const querySnapshot = await getDocs(q)
      const courses: Course[] = []
      let lastDoc: QueryDocumentSnapshot | undefined

      for (const docSnap of querySnapshot.docs) {
        const courseData = docSnap.data() as Course
        courses.push({
          ...courseData,
          id: docSnap.id
        })
        lastDoc = docSnap
      }

      return { courses, lastDoc }
    } catch (error) {
      console.error('Error fetching courses:', error)
      throw new Error(`Failed to fetch courses: ${error}`)
    }
  }

  /**
   * Lesson Management
   */

  /**
   * Get all lessons for a course in order
   */
  static async getCourseLessons(courseId: string): Promise<Lesson[]> {
    try {
      const lessonsRef = collection(db, this.COURSES_COLLECTION, courseId, this.LESSONS_COLLECTION)
      const q = query(lessonsRef, orderBy('order', 'asc'))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Lesson))
    } catch (error) {
      console.error('Error fetching course lessons:', error)
      throw new Error(`Failed to fetch lessons for course ${courseId}: ${error}`)
    }
  }

  /**
   * Get a specific lesson by ID
   */
  static async getLesson(courseId: string, lessonId: string): Promise<Lesson | null> {
    try {
      const lessonRef = doc(db, this.COURSES_COLLECTION, courseId, this.LESSONS_COLLECTION, lessonId)
      const lessonSnap = await getDoc(lessonRef)

      if (!lessonSnap.exists()) {
        return null
      }

      return {
        ...lessonSnap.data(),
        id: lessonSnap.id
      } as Lesson
    } catch (error) {
      console.error('Error fetching lesson:', error)
      throw new Error(`Failed to fetch lesson ${lessonId}: ${error}`)
    }
  }

  /**
   * Get the next lesson in sequence
   */
  static async getNextLesson(courseId: string, currentLessonId: string): Promise<Lesson | null> {
    try {
      const lessons = await this.getCourseLessons(courseId)
      const currentIndex = lessons.findIndex(lesson => lesson.id === currentLessonId)
      
      if (currentIndex === -1 || currentIndex === lessons.length - 1) {
        return null // Current lesson not found or is the last lesson
      }

      return lessons[currentIndex + 1]
    } catch (error) {
      console.error('Error fetching next lesson:', error)
      return null
    }
  }

  /**
   * Get the previous lesson in sequence
   */
  static async getPreviousLesson(courseId: string, currentLessonId: string): Promise<Lesson | null> {
    try {
      const lessons = await this.getCourseLessons(courseId)
      const currentIndex = lessons.findIndex(lesson => lesson.id === currentLessonId)
      
      if (currentIndex <= 0) {
        return null // Current lesson not found or is the first lesson
      }

      return lessons[currentIndex - 1]
    } catch (error) {
      console.error('Error fetching previous lesson:', error)
      return null
    }
  }

  /**
   * Course Module Management
   */

  /**
   * Get all modules for a course
   */
  static async getCourseModules(courseId: string): Promise<CourseModule[]> {
    try {
      const modulesRef = collection(db, this.COURSES_COLLECTION, courseId, this.MODULES_COLLECTION)
      const q = query(modulesRef, orderBy('order', 'asc'))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as CourseModule))
    } catch (error) {
      console.error('Error fetching course modules:', error)
      return [] // Return empty array if no modules exist
    }
  }

  /**
   * Enrollment Verification and Access Control
   */

  /**
   * Check if user is enrolled in a course
   */
  static async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    // Temporary bypass for testing specific user
    if (userId === '4fhhWQhlTBZEJhkM9pTBXwD23A32') {
      return true;
    }

    try {
      const enrollmentId = `${userId}_${courseId}`
      const enrollmentRef = doc(db, this.ENROLLMENTS_COLLECTION, enrollmentId)
      const enrollmentSnap = await getDoc(enrollmentRef)

      if (!enrollmentSnap.exists()) {
        return false
      }

      const enrollment = enrollmentSnap.data() as CourseEnrollment
      return enrollment.status === 'active'
    } catch (error) {
      console.error('Error checking enrollment:', error)
      return false
    }
  }

  /**
   * Verify course access with detailed reason
   */
  static async verifyCourseAccess(userId: string, courseId: string): Promise<AccessControlResult> {
    // Temporary bypass for testing specific user
    if (userId === '4fhhWQhlTBZEJhkM9pTBXwD23A32') {
      return { hasAccess: true };
    }

    try {
      const enrollmentId = `${userId}_${courseId}`
      const enrollmentRef = doc(db, this.ENROLLMENTS_COLLECTION, enrollmentId)
      const enrollmentSnap = await getDoc(enrollmentRef)

      if (!enrollmentSnap.exists()) {
        return {
          hasAccess: false,
          reason: 'not_enrolled'
        }
      }

      const enrollment = enrollmentSnap.data() as CourseEnrollment

      // Check enrollment status
      if (enrollment.status === 'suspended') {
        return {
          hasAccess: false,
          reason: 'suspended',
          enrollmentStatus: enrollment
        }
      }

      // Check if access has expired
      if (enrollment.accessExpiresAt && enrollment.accessExpiresAt.toDate() < new Date()) {
        return {
          hasAccess: false,
          reason: 'expired',
          enrollmentStatus: enrollment
        }
      }

      // Check if payment is pending (if paymentId exists but status is not active)
      if (enrollment.paymentId && enrollment.status !== 'active') {
        return {
          hasAccess: false,
          reason: 'payment_pending',
          enrollmentStatus: enrollment
        }
      }

      return {
        hasAccess: true,
        enrollmentStatus: enrollment
      }
    } catch (error) {
      console.error('Error verifying course access:', error)
      return {
        hasAccess: false,
        reason: 'not_enrolled'
      }
    }
  }

  /**
   * Verify lesson access based on sequential unlock rules
   */
  static async verifyLessonAccess(
    userId: string, 
    courseId: string, 
    lessonId: string
  ): Promise<{ hasAccess: boolean, reason?: string }> {
    try {
      // First check course access
      const courseAccess = await this.verifyCourseAccess(userId, courseId)
      if (!courseAccess.hasAccess) {
        return {
          hasAccess: false,
          reason: courseAccess.reason
        }
      }

      // Get course details to check unlock rules
      const course = await this.getCourse(courseId)
      if (!course) {
        return {
          hasAccess: false,
          reason: 'course_not_found'
        }
      }

      // Find the lesson
      const lesson = course.lessons.find(l => l.id === lessonId)
      if (!lesson) {
        return {
          hasAccess: false,
          reason: 'lesson_not_found'
        }
      }

      // Check if it's a preview lesson (always accessible)
      if (lesson.isPreview) {
        return { hasAccess: true }
      }

      // If sequential unlocking is disabled, allow access to all lessons
      if (!course.unlockSequential) {
        return { hasAccess: true }
      }

      // Check if previous lessons are completed (80% rule)
      const userProgress = await this.getUserCourseProgress(userId, courseId)
      if (!userProgress) {
        // No progress yet, only allow first lesson
        const firstLesson = course.lessons.find(l => l.order === 0) || course.lessons[0]
        return {
          hasAccess: lesson.id === firstLesson.id,
          reason: lesson.id === firstLesson.id ? undefined : 'previous_lessons_incomplete'
        }
      }

      // Check if all previous lessons are completed
      const previousLessons = course.lessons.filter(l => l.order < lesson.order)
      for (const prevLesson of previousLessons) {
        const lessonProgress = userProgress.lessonProgress[prevLesson.id]
        if (!lessonProgress || !lessonProgress.isCompleted) {
          return {
            hasAccess: false,
            reason: 'previous_lessons_incomplete'
          }
        }
      }

      return { hasAccess: true }
    } catch (error) {
      console.error('Error verifying lesson access:', error)
      return {
        hasAccess: false,
        reason: 'verification_error'
      }
    }
  }

  /**
   * Enroll user in a course
   */
  static async enrollUser(
    userId: string, 
    courseId: string, 
    paymentId?: string
  ): Promise<CourseEnrollment> {
    try {
      const enrollmentId = `${userId}_${courseId}`
      const enrollment: CourseEnrollment = {
        userId,
        courseId,
        enrolledAt: serverTimestamp() as Timestamp,
        paymentId,
        status: 'active'
      }

      // Create enrollment record
      const enrollmentRef = doc(db, this.ENROLLMENTS_COLLECTION, enrollmentId)
      await setDoc(enrollmentRef, enrollment)

      // Update course enrollment count
      const courseRef = doc(db, this.COURSES_COLLECTION, courseId)
      await updateDoc(courseRef, {
        enrollmentCount: increment(1)
      })

      // Update user's enrolled courses list
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        enrolledCourses: arrayUnion(courseId)
      })

      return enrollment
    } catch (error) {
      console.error('Error enrolling user:', error)
      throw new Error(`Failed to enroll user in course: ${error}`)
    }
  }

  /**
   * Course Progress Calculation and Tracking
   */

  /**
   * Get user's progress for a specific course
   */
  static async getUserCourseProgress(userId: string, courseId: string): Promise<UserProgress | null> {
    try {
      const progressId = `${userId}_${courseId}`
      const progressRef = doc(db, this.USER_PROGRESS_COLLECTION, progressId)
      const progressSnap = await getDoc(progressRef)

      if (!progressSnap.exists()) {
        return null
      }

      return progressSnap.data() as UserProgress
    } catch (error) {
      console.error('Error fetching user course progress:', error)
      return null
    }
  }

  /**
   * Calculate overall course progress
   */
  static async calculateCourseProgress(userId: string, courseId: string): Promise<CourseProgress> {
    try {
      const course = await this.getCourse(courseId)
      if (!course) {
        throw new Error('Course not found')
      }

      const userProgress = await this.getUserCourseProgress(userId, courseId)
      
      const totalLessons = course.lessons.length
      let lessonsCompleted = 0
      let totalWatchTime = 0
      let currentLesson = course.lessons[0]?.id || ''
      let lastAccessedLesson = ''

      if (userProgress) {
        // Count completed lessons
        Object.values(userProgress.lessonProgress).forEach(lessonProg => {
          if (lessonProg.isCompleted) {
            lessonsCompleted++
          }
          totalWatchTime += lessonProg.watchedSeconds
        })

        // Find current lesson (first incomplete lesson)
        for (const lesson of course.lessons) {
          const lessonProg = userProgress.lessonProgress[lesson.id]
          if (!lessonProg || !lessonProg.isCompleted) {
            currentLesson = lesson.id
            break
          }
        }

        // Find last accessed lesson
        let lastAccessTime = 0
        Object.entries(userProgress.lessonProgress).forEach(([lessonId, lessonProg]) => {
          const accessTime = lessonProg.lastWatchedAt?.toDate()?.getTime() || 0
          if (accessTime > lastAccessTime) {
            lastAccessTime = accessTime
            lastAccessedLesson = lessonId
          }
        })
      }

      const overallCompletion = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0
      
      // Estimate time remaining based on average lesson duration and completion rate
      const avgLessonDuration = course.totalDuration / totalLessons
      const remainingLessons = totalLessons - lessonsCompleted
      const estimatedTimeRemaining = remainingLessons * avgLessonDuration

      return {
        courseId,
        userId,
        overallCompletion,
        lessonsCompleted,
        totalLessons,
        currentLesson,
        lastAccessedLesson,
        estimatedTimeRemaining,
        achievements: [] // Will be populated by achievement system
      }
    } catch (error) {
      console.error('Error calculating course progress:', error)
      throw new Error(`Failed to calculate course progress: ${error}`)
    }
  }

  /**
   * Get module progress for a course
   */
  static async getModuleProgress(userId: string, courseId: string): Promise<ModuleProgress[]> {
    try {
      const course = await this.getCourse(courseId)
      if (!course || !course.modules) {
        return []
      }

      const userProgress = await this.getUserCourseProgress(userId, courseId)
      const moduleProgressList: ModuleProgress[] = []

      for (const module of course.modules) {
        const moduleLessons = course.lessons.filter(lesson => 
          module.lessons.includes(lesson.id)
        )
        
        let lessonsCompleted = 0
        if (userProgress) {
          lessonsCompleted = moduleLessons.filter(lesson => 
            userProgress.lessonProgress[lesson.id]?.isCompleted
          ).length
        }

        const completionPercentage = moduleLessons.length > 0 
          ? Math.round((lessonsCompleted / moduleLessons.length) * 100) 
          : 0

        // Check if module is unlocked (previous modules completed or no prerequisites)
        let isUnlocked = true
        if (module.prerequisites.length > 0 && userProgress) {
          isUnlocked = module.prerequisites.every(prereqModuleId => {
            const prereqModule = course.modules?.find(m => m.id === prereqModuleId)
            if (!prereqModule) return true
            
            const prereqLessons = course.lessons.filter(lesson => 
              prereqModule.lessons.includes(lesson.id)
            )
            const prereqCompleted = prereqLessons.filter(lesson => 
              userProgress.lessonProgress[lesson.id]?.isCompleted
            ).length
            
            return prereqCompleted === prereqLessons.length
          })
        }

        moduleProgressList.push({
          moduleIndex: module.order,
          moduleTitle: module.title,
          lessonsCompleted,
          totalLessons: moduleLessons.length,
          completionPercentage,
          isUnlocked,
          estimatedDuration: module.estimatedDuration
        })
      }

      return moduleProgressList.sort((a, b) => a.moduleIndex - b.moduleIndex)
    } catch (error) {
      console.error('Error calculating module progress:', error)
      return []
    }
  }

  /**
   * Update lesson completion and unlock next lesson
   */
  static async updateLessonCompletion(
    userId: string,
    courseId: string,
    lessonId: string,
    completionPercentage: number
  ): Promise<{ lessonCompleted: boolean, nextLessonUnlocked?: string }> {
    try {
      const course = await this.getCourse(courseId)
      if (!course) {
        throw new Error('Course not found')
      }

      const isCompleted = completionPercentage >= (course.completionThreshold || 80)
      let nextLessonUnlocked: string | undefined

      if (isCompleted) {
        // Find next lesson to unlock
        const currentLesson = course.lessons.find(l => l.id === lessonId)
        if (currentLesson) {
          const nextLesson = course.lessons.find(l => l.order === currentLesson.order + 1)
          if (nextLesson) {
            nextLessonUnlocked = nextLesson.id
          }
        }
      }

      return {
        lessonCompleted: isCompleted,
        nextLessonUnlocked
      }
    } catch (error) {
      console.error('Error updating lesson completion:', error)
      throw new Error(`Failed to update lesson completion: ${error}`)
    }
  }

  /**
   * Get user's enrolled courses with progress
   */
  static async getUserEnrolledCourses(userId: string): Promise<Array<Course & { progress: CourseProgress }>> {
    try {
      // Get user's enrolled course IDs
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        return []
      }

      const userData = userSnap.data()
      const enrolledCourseIds = userData.enrolledCourses || []

      if (enrolledCourseIds.length === 0) {
        return []
      }

      // Fetch course details and progress for each enrolled course
      const coursesWithProgress = await Promise.all(
        enrolledCourseIds.map(async (courseId: string) => {
          const course = await this.getCourse(courseId)
          if (!course) return null

          const progress = await this.calculateCourseProgress(userId, courseId)
          return { ...course, progress }
        })
      )

      return coursesWithProgress.filter(Boolean) as Array<Course & { progress: CourseProgress }>
    } catch (error) {
      console.error('Error fetching user enrolled courses:', error)
      return []
    }
  }

  /**
   * Search courses with filters
   */
  static async searchCourses(searchParams: {
    query?: string
    language?: string
    level?: string
    instructorId?: string
    minRating?: number
    maxPrice?: number
    tags?: string[]
  }): Promise<Course[]> {
    try {
      // For MVP, we'll do client-side filtering after fetching published courses
      // In production, you'd want to use Algolia or similar for full-text search
      const { courses } = await this.getCourses({ status: 'published', limit: 100 })
      
      return courses.filter(course => {
        // Text search in title and description
        if (searchParams.query) {
          const query = searchParams.query.toLowerCase()
          const matchesText = 
            course.title.toLowerCase().includes(query) ||
            course.description.toLowerCase().includes(query) ||
            course.instructorName.toLowerCase().includes(query)
          if (!matchesText) return false
        }

        // Filter by language
        if (searchParams.language && course.language !== searchParams.language) {
          return false
        }

        // Filter by level
        if (searchParams.level && course.level !== searchParams.level) {
          return false
        }

        // Filter by instructor
        if (searchParams.instructorId && course.instructorId !== searchParams.instructorId) {
          return false
        }

        // Filter by minimum rating
        if (searchParams.minRating && course.rating < searchParams.minRating) {
          return false
        }

        // Filter by maximum price
        if (searchParams.maxPrice && course.price > searchParams.maxPrice) {
          return false
        }

        // Filter by tags
        if (searchParams.tags && searchParams.tags.length > 0) {
          const hasMatchingTag = searchParams.tags.some(tag => 
            course.tags.includes(tag)
          )
          if (!hasMatchingTag) return false
        }

        return true
      })
    } catch (error) {
      console.error('Error searching courses:', error)
      return []
    }
  }

  /**
   * Get course statistics for analytics
   */
  static async getCourseStatistics(courseId: string): Promise<{
    enrollmentCount: number
    completionRate: number
    averageRating: number
    totalRevenue: number
    activeStudents: number
  }> {
    try {
      const course = await this.getCourse(courseId)
      if (!course) {
        throw new Error('Course not found')
      }

      // Get enrollment count from course document
      const enrollmentCount = course.enrollmentCount || 0

      // Calculate completion rate (users who completed all lessons)
      const enrollmentsRef = collection(db, this.ENROLLMENTS_COLLECTION)
      const enrollmentsQuery = query(enrollmentsRef, where('courseId', '==', courseId))
      const enrollmentsSnap = await getDocs(enrollmentsQuery)
      
      let completedCount = 0
      let activeStudents = 0

      for (const enrollmentDoc of enrollmentsSnap.docs) {
        const enrollment = enrollmentDoc.data() as CourseEnrollment
        if (enrollment.status === 'active') {
          activeStudents++
        }
        
        if (enrollment.status === 'completed') {
          completedCount++
        }
      }

      const completionRate = enrollmentCount > 0 ? (completedCount / enrollmentCount) * 100 : 0

      // Calculate total revenue (price * enrollment count)
      const totalRevenue = course.price * enrollmentCount

      return {
        enrollmentCount,
        completionRate: Math.round(completionRate),
        averageRating: course.rating,
        totalRevenue,
        activeStudents
      }
    } catch (error) {
      console.error('Error calculating course statistics:', error)
      throw new Error(`Failed to calculate course statistics: ${error}`)
    }
  }

  /**
   * Integration with Progress Service
   */

  /**
   * Initialize course progress for a newly enrolled user
   */
  static async initializeCourseProgress(userId: string, courseId: string): Promise<void> {
    try {
      const course = await this.getCourse(courseId)
      if (!course) {
        throw new Error('Course not found')
      }

      const progressId = `${userId}_${courseId}`
      const progressRef = doc(db, this.USER_PROGRESS_COLLECTION, progressId)

      // Check if progress already exists
      const existingProgress = await getDoc(progressRef)
      if (existingProgress.exists()) {
        return // Progress already initialized
      }

      // Create initial progress document
      const initialProgress: Partial<UserProgress> = {
        userId,
        courseId,
        enrolledAt: serverTimestamp() as Timestamp,
        lastAccessedAt: serverTimestamp() as Timestamp,
        currentModuleIndex: 0,
        currentLessonIndex: 0,
        overallProgress: {
          completionPercentage: 0,
          lessonsCompleted: [],
          modulesCompleted: [],
          totalWatchTime: 0,
          averageSessionTime: 0,
        },
        lessonProgress: {},
        streakData: {
          currentStreak: 0,
          lastStudyDate: serverTimestamp() as Timestamp,
          studyDates: [],
        }
      }

      await setDoc(progressRef, initialProgress)
    } catch (error) {
      console.error('Error initializing course progress:', error)
      throw new Error(`Failed to initialize course progress: ${error}`)
    }
  }

  /**
   * Get lessons that are currently accessible to the user
   */
  static async getAccessibleLessons(userId: string, courseId: string): Promise<Lesson[]> {
    try {
      const course = await this.getCourse(courseId)
      if (!course) {
        return []
      }

      // Check course access first
      const courseAccess = await this.verifyCourseAccess(userId, courseId)
      if (!courseAccess.hasAccess) {
        // Return only preview lessons if not enrolled
        return course.lessons.filter(lesson => lesson.isPreview)
      }

      // If sequential unlocking is disabled, return all lessons
      if (!course.unlockSequential) {
        return course.lessons
      }

      // Get user progress to determine which lessons are unlocked
      const userProgress = await this.getUserCourseProgress(userId, courseId)
      if (!userProgress) {
        // No progress yet, return first lesson and preview lessons
        const firstLesson = course.lessons.find(l => l.order === 0) || course.lessons[0]
        const previewLessons = course.lessons.filter(l => l.isPreview)
        return firstLesson ? [firstLesson, ...previewLessons.filter(l => l.id !== firstLesson.id)] : previewLessons
      }

      const accessibleLessons: Lesson[] = []
      
      for (const lesson of course.lessons.sort((a, b) => a.order - b.order)) {
        // Always include preview lessons
        if (lesson.isPreview) {
          accessibleLessons.push(lesson)
          continue
        }

        // Check if all previous lessons are completed
        const previousLessons = course.lessons.filter(l => l.order < lesson.order && !l.isPreview)
        const allPreviousCompleted = previousLessons.every(prevLesson => 
          userProgress.lessonProgress[prevLesson.id]?.isCompleted
        )

        if (allPreviousCompleted) {
          accessibleLessons.push(lesson)
        } else {
          break // Stop at first inaccessible lesson due to sequential unlocking
        }
      }

      return accessibleLessons
    } catch (error) {
      console.error('Error getting accessible lessons:', error)
      return []
    }
  }

  /**
   * Get course navigation data for UI
   */
  static async getCourseNavigation(userId: string, courseId: string): Promise<{
    course: Course
    accessibleLessons: Lesson[]
    currentLesson?: Lesson
    nextLesson?: Lesson
    previousLesson?: Lesson
    progress: CourseProgress
    moduleProgress: ModuleProgress[]
  } | null> {
    try {
      const course = await this.getCourse(courseId)
      if (!course) {
        return null
      }

      const [accessibleLessons, progress, moduleProgress] = await Promise.all([
        this.getAccessibleLessons(userId, courseId),
        this.calculateCourseProgress(userId, courseId),
        this.getModuleProgress(userId, courseId)
      ])

      // Find current lesson
      const currentLesson = course.lessons.find(l => l.id === progress.currentLesson)
      
      // Find next and previous lessons
      let nextLesson: Lesson | undefined
      let previousLesson: Lesson | undefined

      if (currentLesson) {
        nextLesson = await this.getNextLesson(courseId, currentLesson.id) || undefined
        previousLesson = await this.getPreviousLesson(courseId, currentLesson.id) || undefined
      }

      return {
        course,
        accessibleLessons,
        currentLesson,
        nextLesson,
        previousLesson,
        progress,
        moduleProgress
      }
    } catch (error) {
      console.error('Error getting course navigation:', error)
      return null
    }
  }

  /**
   * Batch operations for performance
   */

  /**
   * Batch update multiple lesson progress records
   */
  static async batchUpdateLessonProgress(
    updates: Array<{
      userId: string
      courseId: string
      lessonId: string
      progress: Partial<LessonProgress>
    }>
  ): Promise<void> {
    try {
      const batch = writeBatch(db)

      for (const update of updates) {
        const progressId = `${update.userId}_${update.courseId}`
        const progressRef = doc(db, this.USER_PROGRESS_COLLECTION, progressId)
        
        batch.update(progressRef, {
          [`lessonProgress.${update.lessonId}`]: update.progress,
          lastAccessedAt: serverTimestamp()
        })
      }

      await batch.commit()
    } catch (error) {
      console.error('Error batch updating lesson progress:', error)
      throw new Error(`Failed to batch update lesson progress: ${error}`)
    }
  }

  /**
   * Cache management for performance optimization
   */
  private static courseCache = new Map<string, { course: Course, timestamp: number }>()
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get course with caching for better performance
   */
  static async getCachedCourse(courseId: string): Promise<Course | null> {
    const cached = this.courseCache.get(courseId)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return cached.course
    }

    const course = await this.getCourse(courseId)
    if (course) {
      this.courseCache.set(courseId, { course, timestamp: now })
    }

    return course
  }

  /**
   * Clear course cache
   */
  static clearCourseCache(courseId?: string): void {
    if (courseId) {
      this.courseCache.delete(courseId)
    } else {
      this.courseCache.clear()
    }
  }

  /**
   * Utility functions for course management
   */

  /**
   * Calculate estimated completion time for a course
   */
  static calculateEstimatedCompletionTime(course: Course, userProgress?: UserProgress): number {
    if (!userProgress) {
      return course.totalDuration
    }

    const completedSeconds = Object.values(userProgress.lessonProgress)
      .reduce((total, lesson) => total + lesson.watchedSeconds, 0)
    
    return Math.max(0, course.totalDuration - completedSeconds)
  }

  /**
   * Get course difficulty score based on completion rates
   */
  static async getCourseDifficultyScore(courseId: string): Promise<number> {
    try {
      const stats = await this.getCourseStatistics(courseId)
      
      // Simple difficulty calculation based on completion rate
      // Lower completion rate = higher difficulty
      const difficultyScore = Math.max(1, Math.min(10, 11 - (stats.completionRate / 10)))
      
      return Math.round(difficultyScore)
    } catch (error) {
      console.error('Error calculating course difficulty:', error)
      return 5 // Default medium difficulty
    }
  }

  /**
   * Get recommended courses based on user's learning history
   */
  static async getRecommendedCourses(userId: string, limit: number = 5): Promise<Course[]> {
    try {
      // Get user's enrolled courses to understand preferences
      const enrolledCourses = await this.getUserEnrolledCourses(userId)
      
      if (enrolledCourses.length === 0) {
        // New user - return popular beginner courses
        const { courses } = await this.getCourses({
          status: 'published',
          orderBy: 'enrollmentCount',
          orderDirection: 'desc',
          limit
        })
        return courses.filter(course => course.level === 'Beginner')
      }

      // Extract user preferences
      const userLanguages = [...new Set(enrolledCourses.map(c => c.language))]
      const userLevel = this.determineUserLevel(enrolledCourses)

      // Get courses in similar languages or next level
      const { courses } = await this.getCourses({
        status: 'published',
        limit: limit * 3 // Get more to filter
      })

      const recommendations = courses
        .filter(course => {
          // Don't recommend already enrolled courses
          const alreadyEnrolled = enrolledCourses.some(ec => ec.id === course.id)
          if (alreadyEnrolled) return false

          // Prefer same languages or related languages
          const languageMatch = userLanguages.includes(course.language)
          
          // Prefer appropriate level
          const levelMatch = course.level === userLevel || 
            (userLevel === 'Beginner' && course.level === 'Intermediate') ||
            (userLevel === 'Intermediate' && course.level === 'Advanced')

          return languageMatch || levelMatch
        })
        .sort((a, b) => {
          // Sort by relevance score
          let scoreA = 0
          let scoreB = 0

          // Language match bonus
          if (userLanguages.includes(a.language)) scoreA += 3
          if (userLanguages.includes(b.language)) scoreB += 3

          // Rating bonus
          scoreA += a.rating
          scoreB += b.rating

          // Popularity bonus
          scoreA += Math.log(a.enrollmentCount + 1)
          scoreB += Math.log(b.enrollmentCount + 1)

          return scoreB - scoreA
        })
        .slice(0, limit)

      return recommendations
    } catch (error) {
      console.error('Error getting recommended courses:', error)
      return []
    }
  }

  /**
   * Determine user's learning level based on enrolled courses
   */
  private static determineUserLevel(enrolledCourses: Array<Course & { progress: CourseProgress }>): string {
    if (enrolledCourses.length === 0) return 'Beginner'

    const completedCourses = enrolledCourses.filter(c => c.progress.overallCompletion >= 80)
    const hasAdvanced = completedCourses.some(c => c.level === 'Advanced')
    const hasIntermediate = completedCourses.some(c => c.level === 'Intermediate')

    if (hasAdvanced) return 'Advanced'
    if (hasIntermediate || completedCourses.length >= 2) return 'Intermediate'
    return 'Beginner'
  }
}

// Types are already exported as interfaces above