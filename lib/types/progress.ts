import { Timestamp } from 'firebase/firestore'

export interface UserProgress {
  userId: string
  courseId: string
  enrolledAt: Timestamp
  lastAccessedAt: Timestamp
  currentModuleIndex: number
  currentLessonIndex: number
  overallProgress: {
    completionPercentage: number
    lessonsCompleted: string[]
    modulesCompleted: number[]
    totalWatchTime: number
    averageSessionTime: number
  }
  lessonProgress: Record<string, LessonProgress>
  streakData: {
    currentStreak: number
    lastStudyDate: Timestamp
    studyDates: Timestamp[]
  }
}

export interface LessonProgress {
  watchedSeconds: number
  totalSeconds: number
  completionPercentage: number
  isCompleted: boolean
  firstWatchedAt: Timestamp
  lastWatchedAt: Timestamp
  watchSessions: WatchSession[]
  quizScore?: number
  notesCount: number
  resumePosition: number
}

export interface WatchSession {
  startTime: Timestamp
  duration: number
  progressMade: number
  platform: string
  endTime?: Timestamp
  pauseCount?: number
  seekCount?: number
}

export interface OfflineProgressCache {
  userId: string
  pendingUpdates: ProgressUpdate[]
  lastSyncAttempt: Date
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error'
}

export interface ProgressUpdate {
  lessonId: string
  courseId: string
  progress: {
    currentTime: number
    duration: number
    completionPercentage: number
    isCompleted: boolean
    timestamp: Date
    watchedSeconds: number
    totalSeconds: number
  }
  timestamp: Date
  retryCount: number
}

export interface CourseProgress {
  courseId: string
  userId: string
  overallCompletion: number
  lessonsCompleted: number
  totalLessons: number
  currentLesson: string
  lastAccessedLesson: string
  estimatedTimeRemaining: number
  achievements: string[]
}

export interface ModuleProgress {
  moduleIndex: number
  moduleTitle: string
  lessonsCompleted: number
  totalLessons: number
  completionPercentage: number
  isUnlocked: boolean
  estimatedDuration: number
}