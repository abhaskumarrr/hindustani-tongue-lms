"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  CheckCircle,
  Lock,
  Play,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import YouTubePlayer from "@/components/YouTubePlayer"
import AccessControlWrapper, { useAccessControl } from "@/components/AccessControlWrapper"
import { CourseService } from "@/lib/services/course-service"

/**
 * Example of a lesson page with integrated access control
 * 
 * This demonstrates how to use the AccessControlWrapper and useAccessControl hook
 * to protect lesson content and provide appropriate user feedback.
 */

interface LessonPageContentProps {
  courseId: string
  lessonId: string
}

function LessonPageContent({ courseId, lessonId }: LessonPageContentProps) {
  const [lesson, setLesson] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [accessibleLessons, setAccessibleLessons] = useState<any[]>([])
  const [watchProgress, setWatchProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  const {
    getUserEnrollmentStatus,
    getAccessibleLessons,
    checkLessonAccess
  } = useAccessControl(courseId, lessonId)

  useEffect(() => {
    const loadLessonData = async () => {
      try {
        setLoading(true)

        // Load course and lesson data
        const [courseData, lessonData] = await Promise.all([
          CourseService.getCourse(courseId),
          CourseService.getLesson(courseId, lessonId)
        ])

        setCourse(courseData)
        setLesson(lessonData)

        // Get accessible lessons for navigation
        const { lessons } = await getAccessibleLessons()
        setAccessibleLessons(lessons)

      } catch (error) {
        console.error('Error loading lesson data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLessonData()
  }, [courseId, lessonId, getAccessibleLessons])

  const handleProgressUpdate = (progress: any) => {
    setWatchProgress(progress.completionPercentage)
  }

  const handleVideoCompletion = async (progress: any) => {
    console.log('Video completed at 80%:', progress)
    
    // Refresh accessible lessons after completion
    try {
      const { lessons } = await getAccessibleLessons()
      setAccessibleLessons(lessons)
    } catch (error) {
      console.error('Failed to refresh accessible lessons:', error)
    }
  }

  const isLessonAccessible = (checkLessonId: string) => {
    return accessibleLessons.some(l => l.id === checkLessonId)
  }

  const getNextAccessibleLesson = () => {
    if (!lesson || !course) return null
    
    const currentIndex = course.lessons.findIndex((l: any) => l.id === lessonId)
    if (currentIndex === -1) return null

    for (let i = currentIndex + 1; i < course.lessons.length; i++) {
      const nextLesson = course.lessons[i]
      if (isLessonAccessible(nextLesson.id)) {
        return nextLesson
      }
    }
    return null
  }

  const getPreviousAccessibleLesson = () => {
    if (!lesson || !course) return null
    
    const currentIndex = course.lessons.findIndex((l: any) => l.id === lessonId)
    if (currentIndex === -1) return null

    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevLesson = course.lessons[i]
      if (isLessonAccessible(prevLesson.id)) {
        return prevLesson
      }
    }
    return null
  }

  if (loading || !lesson || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    )
  }

  const nextLesson = getNextAccessibleLesson()
  const previousLesson = getPreviousAccessibleLesson()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ह</span>
              </div>
              <span className="text-xl font-bold text-foreground">Hindustani Tongue</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link href={`/courses/${courseId}`} className="text-muted-foreground hover:text-foreground">
              {course.title}
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{lesson.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{course.language}</Badge>
            <span className="text-sm text-muted-foreground">{course.level}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Video Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* YouTube Video Player */}
            <YouTubePlayer
              videoId={lesson.youtubeVideoId}
              courseId={courseId}
              lessonId={lessonId}
              onProgressUpdate={handleProgressUpdate}
              onCompletion={handleVideoCompletion}
              autoplay={false}
              showControls={true}
              showProgress={true}
              completionThreshold={80}
              className="w-full"
            />

            {/* Lesson Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{lesson.title}</CardTitle>
                    <CardDescription className="mt-2">{lesson.description}</CardDescription>
                    <div className="flex items-center space-x-4 mt-3">
                      <span className="text-sm text-muted-foreground">By {course.instructorName}</span>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Progress</div>
                    <div className="text-2xl font-bold text-primary">{Math.round(watchProgress)}%</div>
                    {watchProgress >= 80 && (
                      <div className="text-xs text-green-600 font-medium">✓ Completed</div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Learning Objectives */}
            {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-primary" />
                    Learning Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {lesson.learningObjectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Curriculum</CardTitle>
                <CardDescription>{course.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.lessons.map((curriculumLesson: any) => {
                  const isAccessible = isLessonAccessible(curriculumLesson.id)
                  const isCurrent = curriculumLesson.id === lessonId
                  const isCompleted = watchProgress >= 80 && isCurrent // Simplified completion check

                  return (
                    <div
                      key={curriculumLesson.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        isCurrent
                          ? "bg-primary/10 border-primary/20"
                          : isCompleted
                            ? "bg-muted/50 border-border hover:bg-muted"
                            : !isAccessible
                              ? "bg-muted/30 border-border opacity-60"
                              : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          ) : isCurrent ? (
                            <Play className="w-5 h-5 text-primary" />
                          ) : !isAccessible ? (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {isAccessible ? (
                            <Link href={`/learn/${courseId}/${curriculumLesson.id}`}>
                              <h4 className="text-sm font-medium text-foreground hover:text-primary">
                                {curriculumLesson.title}
                              </h4>
                            </Link>
                          ) : (
                            <h4 className="text-sm font-medium text-muted-foreground">
                              {curriculumLesson.title}
                            </h4>
                          )}
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {Math.floor(curriculumLesson.duration / 60)}:{(curriculumLesson.duration % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-transparent" 
                disabled={!previousLesson}
                asChild={!!previousLesson}
              >
                {previousLesson ? (
                  <Link href={`/learn/${courseId}/${previousLesson.id}`}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Link>
                ) : (
                  <>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </>
                )}
              </Button>
              <Button 
                size="sm" 
                className="flex-1" 
                disabled={!nextLesson}
                asChild={!!nextLesson}
              >
                {nextLesson ? (
                  <Link href={`/learn/${courseId}/${nextLesson.id}`}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>

            {/* Access Control Info */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Access Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Enrolled:</span>
                    <span className="text-green-600">✓ Yes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Progress:</span>
                    <span>{Math.round(watchProgress)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accessible Lessons:</span>
                    <span>{accessibleLessons.length}/{course.lessons.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Main lesson page component with access control wrapper
 */
export default function AccessControlledLessonPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  return (
    <AccessControlWrapper
      courseId={courseId}
      lessonId={lessonId}
      requireAuthentication={true}
      requireEnrollment={true}
      checkSequentialUnlock={true}
      allowPreviewLessons={true}
      onAccessGranted={() => {
        console.log('Access granted to lesson:', lessonId)
      }}
      onAccessDenied={(result) => {
        console.log('Access denied:', result)
      }}
    >
      <LessonPageContent courseId={courseId} lessonId={lessonId} />
    </AccessControlWrapper>
  )
}