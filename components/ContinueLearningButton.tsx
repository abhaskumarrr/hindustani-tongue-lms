
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ProgressService } from '@/lib/services/progress-service'
import { CourseService } from '@/lib/services/course-service'
import { Lesson } from '@/lib/types/video'
import { Button, ButtonProps } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ContinueLearningButtonProps extends ButtonProps {
  courseId: string
  children: React.ReactNode
}

export const ContinueLearningButton = ({
  courseId,
  children,
  ...props
}: ContinueLearningButtonProps) => {
  const { user } = useAuth()
  const [nextLessonId, setNextLessonId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      // If user is not logged in, link to the course page
      setLoading(false)
      return
    }

    const determineNextLesson = async () => {
      try {
        setLoading(true)
        const course = await CourseService.getCourse(courseId)
        console.log("Fetched course data in button:", course)

        const lessons = course?.lessons || []

        if (lessons.length === 0) {
          setNextLessonId(null) // No lessons in the course
          return
        }

        const sortedLessons = lessons.sort((a, b) => a.order - b.order)
        const firstLessonId = sortedLessons[0]?.id

        const userProgress = await ProgressService.getUserProgress(user.uid, courseId)

        if (!userProgress || !userProgress.lessonProgress) {
          setNextLessonId(firstLessonId) // No progress, start from the first lesson
          return
        }

        const { lessonProgress } = userProgress

        // Find the first uncompleted lesson
        for (const lesson of sortedLessons) {
          const progress = lessonProgress[lesson.id]
          if (progress == null || !progress.isCompleted) {
            setNextLessonId(lesson.id)
            return
          }
        }

        // If all lessons are completed, link to the last lesson for review
        setNextLessonId(sortedLessons[sortedLessons.length - 1]?.id || firstLessonId)
      } catch (error) {
        console.error('Error determining next lesson:', error)
        setNextLessonId(null) // Fallback to course page on error
      } finally {
        setLoading(false)
      }
    }

    determineNextLesson()
  }, [user, courseId])

  if (loading) {
    return (
      <Button {...props} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {children}
      </Button>
    )
  }

  const href = nextLessonId
    ? `/learn/${courseId}/${nextLessonId}`
    : `/courses/${courseId}`

  console.log("ContinueLearningButton href:", href)

  return (
    <Link href={href} passHref>
      <Button {...props}>{children}</Button>
    </Link>
  )
}
