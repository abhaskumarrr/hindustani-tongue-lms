// Progress service for storing and retrieving video progress with offline support
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  collection,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { VideoProgress } from '@/lib/youtube/youtube-api'
import { UserProgress, LessonProgress, OfflineProgressCache, ProgressUpdate } from '@/lib/types/progress'

export class ProgressService {
  private static readonly OFFLINE_CACHE_KEY = 'hindustani_tongue_offline_progress'
  private static readonly MAX_RETRY_ATTEMPTS = 3
  private static readonly SYNC_RETRY_DELAY = 5000 // 5 seconds

  /**
   * Save video progress to Firestore with offline backup
   */
  static async saveVideoProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    progress: VideoProgress
  ): Promise<void> {
    const progressUpdate: ProgressUpdate = {
      lessonId,
      courseId,
      progress: {
        currentTime: progress.currentTime,
        duration: progress.duration,
        completionPercentage: progress.completionPercentage,
        isCompleted: progress.isCompleted,
        timestamp: progress.lastUpdated,
        watchedSeconds: progress.watchedSeconds,
        totalSeconds: progress.totalSeconds,
      },
      timestamp: new Date(),
      retryCount: 0,
    }

    try {
      // Try to save to Firestore first
      await this.saveProgressToFirestore(userId, courseId, lessonId, progress)
      
      // If successful, remove from offline cache if it exists
      this.removeFromOfflineCache(userId, lessonId)
    } catch (error) {
      console.warn('Failed to save progress to Firestore, storing offline:', error)
      
      // Store in offline cache for later sync
      this.addToOfflineCache(userId, progressUpdate)
    }
  }

  /**
   * Save progress directly to Firestore
   */
  private static async saveProgressToFirestore(
    userId: string,
    courseId: string,
    lessonId: string,
    progress: VideoProgress
  ): Promise<void> {
    const progressDocId = `${userId}_${courseId}`
    const progressRef = doc(db, 'userProgress', progressDocId)

    // Get existing progress document
    const progressDoc = await getDoc(progressRef)
    
    const lessonProgress: LessonProgress = {
      watchedSeconds: progress.watchedSeconds,
      totalSeconds: progress.totalSeconds,
      completionPercentage: progress.completionPercentage,
      isCompleted: progress.isCompleted,
      firstWatchedAt: progressDoc.exists() && progressDoc.data().lessonProgress?.[lessonId]?.firstWatchedAt 
        ? progressDoc.data().lessonProgress[lessonId].firstWatchedAt 
        : serverTimestamp() as any,
      lastWatchedAt: serverTimestamp() as any,
      watchSessions: [], // Will be enhanced in future iterations
      notesCount: 0,
      resumePosition: progress.currentTime,
    }

    if (progressDoc.exists()) {
      // Update existing progress
      const existingData = progressDoc.data() as UserProgress
      const updatedLessonProgress = {
        ...existingData.lessonProgress,
        [lessonId]: lessonProgress
      }

      // Calculate overall progress
      const completedLessons = Object.values(updatedLessonProgress)
        .filter(lesson => lesson.isCompleted)
        .map((_, index) => `lesson-${index}`)

      await updateDoc(progressRef, {
        [`lessonProgress.${lessonId}`]: lessonProgress,
        lastAccessedAt: serverTimestamp() as any,
        currentLessonId: lessonId,
        'overallProgress.lessonsCompleted': completedLessons,
        'overallProgress.completionPercentage': this.calculateOverallProgress(updatedLessonProgress),
        'overallProgress.totalWatchTime': this.calculateTotalWatchTime(updatedLessonProgress),
      })
    } else {
      // Create new progress document
      const newProgressData: Partial<UserProgress> = {
        userId,
        courseId,
        enrolledAt: serverTimestamp() as any,
        lastAccessedAt: serverTimestamp() as any,
        currentModuleIndex: 0,
        currentLessonIndex: 0,
        overallProgress: {
          completionPercentage: progress.completionPercentage,
          lessonsCompleted: progress.isCompleted ? [lessonId] : [],
          modulesCompleted: [],
          totalWatchTime: progress.watchedSeconds,
          averageSessionTime: progress.watchedSeconds,
        },
        lessonProgress: {
          [lessonId]: lessonProgress
        },
        streakData: {
          currentStreak: 1,
          lastStudyDate: serverTimestamp() as any,
          studyDates: [serverTimestamp() as any],
        }
      }

      await setDoc(progressRef, newProgressData)
    }
  }

  /**
   * Get user progress for a specific course
   */
  static async getUserProgress(userId: string, courseId: string): Promise<UserProgress | null> {
    try {
      const progressDocId = `${userId}_${courseId}`
      const progressRef = doc(db, 'userProgress', progressDocId)
      const progressDoc = await getDoc(progressRef)

      if (progressDoc.exists()) {
        return progressDoc.data() as UserProgress
      }
      return null
    } catch (error) {
      console.error('Error fetching user progress:', error)
      return null
    }
  }

  /**
   * Get lesson progress for a specific lesson
   */
  static async getLessonProgress(
    userId: string, 
    courseId: string, 
    lessonId: string
  ): Promise<LessonProgress | null> {
    try {
      const userProgress = await this.getUserProgress(userId, courseId)
      return userProgress?.lessonProgress?.[lessonId] || null
    } catch (error) {
      console.error('Error fetching lesson progress:', error)
      return null
    }
  }

  /**
   * Check if next lesson should be unlocked (80% completion rule)
   */
  static async checkLessonUnlock(
    userId: string,
    courseId: string,
    currentLessonId: string
  ): Promise<boolean> {
    try {
      const lessonProgress = await this.getLessonProgress(userId, courseId, currentLessonId)
      return lessonProgress?.isCompleted || false
    } catch (error) {
      console.error('Error checking lesson unlock:', error)
      return false
    }
  }

  /**
   * Mark lesson as completed and unlock next lesson
   */
  static async markLessonCompleted(
    userId: string,
    courseId: string,
    lessonId: string
  ): Promise<void> {
    try {
      const progressDocId = `${userId}_${courseId}`
      const progressRef = doc(db, 'userProgress', progressDocId)

      await updateDoc(progressRef, {
        [`lessonProgress.${lessonId}.isCompleted`]: true,
        [`lessonProgress.${lessonId}.completionPercentage`]: 100,
        lastAccessedAt: serverTimestamp() as any,
      })

      console.log(`Lesson ${lessonId} marked as completed for user ${userId}`)
    } catch (error) {
      console.error('Error marking lesson as completed:', error)
      throw error
    }
  }

  /**
   * Offline cache management
   */
  private static addToOfflineCache(userId: string, progressUpdate: ProgressUpdate): void {
    try {
      const cacheKey = `${this.OFFLINE_CACHE_KEY}_${userId}`
      const existingCache = localStorage.getItem(cacheKey)
      
      let cache: OfflineProgressCache = {
        userId,
        pendingUpdates: [],
        lastSyncAttempt: new Date(),
        syncStatus: 'pending'
      }

      if (existingCache) {
        cache = JSON.parse(existingCache)
      }

      // Add or update progress for this lesson
      const existingIndex = cache.pendingUpdates.findIndex(
        update => update.lessonId === progressUpdate.lessonId
      )

      if (existingIndex >= 0) {
        cache.pendingUpdates[existingIndex] = progressUpdate
      } else {
        cache.pendingUpdates.push(progressUpdate)
      }

      cache.lastSyncAttempt = new Date()
      cache.syncStatus = 'pending'

      localStorage.setItem(cacheKey, JSON.stringify(cache))
    } catch (error) {
      console.error('Error adding to offline cache:', error)
    }
  }

  private static removeFromOfflineCache(userId: string, lessonId: string): void {
    try {
      const cacheKey = `${this.OFFLINE_CACHE_KEY}_${userId}`
      const existingCache = localStorage.getItem(cacheKey)

      if (existingCache) {
        const cache: OfflineProgressCache = JSON.parse(existingCache)
        cache.pendingUpdates = cache.pendingUpdates.filter(
          update => update.lessonId !== lessonId
        )

        if (cache.pendingUpdates.length === 0) {
          localStorage.removeItem(cacheKey)
        } else {
          localStorage.setItem(cacheKey, JSON.stringify(cache))
        }
      }
    } catch (error) {
      console.error('Error removing from offline cache:', error)
    }
  }

  /**
   * Sync offline progress when connection is restored
   */
  static async syncOfflineProgress(userId: string): Promise<void> {
    try {
      const cacheKey = `${this.OFFLINE_CACHE_KEY}_${userId}`
      const existingCache = localStorage.getItem(cacheKey)

      if (!existingCache) {
        return // No offline data to sync
      }

      const cache: OfflineProgressCache = JSON.parse(existingCache)
      
      if (cache.pendingUpdates.length === 0) {
        localStorage.removeItem(cacheKey)
        return
      }

      cache.syncStatus = 'syncing'
      localStorage.setItem(cacheKey, JSON.stringify(cache))

      // Sync each pending update
      const batch = writeBatch(db)
      let successCount = 0

      for (const update of cache.pendingUpdates) {
        try {
          if (update.retryCount < this.MAX_RETRY_ATTEMPTS) {
            await this.saveProgressToFirestore(
              userId,
              update.courseId,
              update.lessonId,
              {
                currentTime: update.progress.currentTime,
                duration: update.progress.duration,
                completionPercentage: update.progress.completionPercentage,
                isCompleted: update.progress.isCompleted,
                watchedSeconds: update.progress.watchedSeconds,
                totalSeconds: update.progress.totalSeconds,
                lastUpdated: update.progress.timestamp,
              }
            )
            successCount++
          }
        } catch (error) {
          console.warn(`Failed to sync progress for lesson ${update.lessonId}:`, error)
          update.retryCount++
        }
      }

      // Remove successfully synced updates
      cache.pendingUpdates = cache.pendingUpdates.filter(
        update => update.retryCount >= this.MAX_RETRY_ATTEMPTS
      )

      if (cache.pendingUpdates.length === 0) {
        localStorage.removeItem(cacheKey)
        console.log(`Successfully synced ${successCount} offline progress updates`)
      } else {
        cache.syncStatus = 'error'
        cache.lastSyncAttempt = new Date()
        localStorage.setItem(cacheKey, JSON.stringify(cache))
        console.warn(`${cache.pendingUpdates.length} progress updates failed to sync`)
      }
    } catch (error) {
      console.error('Error syncing offline progress:', error)
    }
  }

  /**
   * Get offline progress status
   */
  static getOfflineProgressStatus(userId: string): OfflineProgressCache | null {
    try {
      const cacheKey = `${this.OFFLINE_CACHE_KEY}_${userId}`
      const existingCache = localStorage.getItem(cacheKey)
      
      if (existingCache) {
        return JSON.parse(existingCache)
      }
      return null
    } catch (error) {
      console.error('Error getting offline progress status:', error)
      return null
    }
  }

  /**
   * Calculate overall course progress
   */
  private static calculateOverallProgress(lessonProgress: Record<string, LessonProgress>): number {
    const lessons = Object.values(lessonProgress)
    if (lessons.length === 0) return 0

    const totalProgress = lessons.reduce(
      (sum, lesson) => sum + lesson.completionPercentage, 
      0
    )
    return Math.round(totalProgress / lessons.length)
  }

  /**
   * Calculate total watch time
   */
  private static calculateTotalWatchTime(lessonProgress: Record<string, LessonProgress>): number {
    return Object.values(lessonProgress).reduce(
      (sum, lesson) => sum + lesson.watchedSeconds, 
      0
    )
  }

  /**
   * Auto-sync offline progress on app startup
   */
  static async initializeOfflineSync(userId: string): Promise<void> {
    // Check for offline progress and sync if available
    const offlineStatus = this.getOfflineProgressStatus(userId)
    
    if (offlineStatus && offlineStatus.pendingUpdates.length > 0) {
      console.log(`Found ${offlineStatus.pendingUpdates.length} offline progress updates, syncing...`)
      await this.syncOfflineProgress(userId)
    }

    // Set up periodic sync for any new offline data
    setInterval(async () => {
      const status = this.getOfflineProgressStatus(userId)
      if (status && status.pendingUpdates.length > 0 && status.syncStatus !== 'syncing') {
        await this.syncOfflineProgress(userId)
      }
    }, this.SYNC_RETRY_DELAY)
  }
}