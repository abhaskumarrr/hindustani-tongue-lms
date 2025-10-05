import { Timestamp } from 'firebase/firestore'

// Centralized type definitions for Course and Lesson structures

export interface Course {
  id: string
  title: string
  description: string
  instructorId: string
  instructorName: string
  price: number // in paise (INR)
  currency: 'INR'
  thumbnail: string
  status: 'draft' | 'published' | 'archived'
  lessons: Lesson[]
  modules?: CourseModule[]
  totalDuration: number // in seconds
  enrollmentCount: number
  rating: number
  reviewCount: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
  language: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  tags: string[]
  prerequisites: string[]
  learningObjectives: string[]
  features?: string[]
  requirements?: string[]
  completionThreshold: number // Default 80%
  unlockSequential: boolean // Default true
}

export interface Lesson {
  id: string
  title: string
  description: string
  vimeoVideoId: string
  duration: number // in seconds
  order: number
  moduleId?: string
  isPreview: boolean // free preview lesson
  learningObjectives?: string[]
  resources?: LessonResource[]
  quiz?: LessonQuiz
}

export interface CourseModule {
  id: string
  title: string
  description: string
  courseId: string
  order: number
  lessons: string[] // Array of lesson IDs
  isLocked: boolean
  prerequisites: string[]
  estimatedDuration: number
  learningObjectives: string[]
}

export interface LessonResource {
  id: string
  title: string
  type: 'pdf' | 'link' | 'text' | 'image'
  url?: string
  content?: string
  downloadable: boolean
}

export interface LessonQuiz {
  id: string
  questions: QuizQuestion[]
  passingScore: number
  timeLimit?: number // in minutes
}

export interface QuizQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'fill-blank'
  options?: string[]
  correctAnswer: string | number
  explanation?: string
}