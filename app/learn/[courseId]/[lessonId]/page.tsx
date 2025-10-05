"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  Play, 
  CheckCircle, 
  Lock, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Clock, 
  AlertTriangle,
  Loader2,
  FileText,
  StickyNote
} from 'lucide-react'
import VimeoPlayer from '@/components/VimeoPlayer'
import { EnrollmentService } from '@/lib/services/enrollment-service'

interface Lesson {
  id: string
  title: string
  description: string
  vimeoVideoId: string
  duration: number
  order: number
  isPreview: boolean
  learningObjectives: string[]
  resources: any[]
}

interface Course {
  id: string
  title: string
  description: string
  instructorName: string
  completionThreshold: number
  unlockSequential: boolean
  language: string
  level: string
}

interface LessonProgress {
  lessonId: string
  watchedSeconds: number
  totalSeconds: number
  completionPercentage: number
  isCompleted: boolean
  lastWatchedAt: Date
}

export default function LessonPage({ params }: { params: { courseId: string, lessonId: string } }) {
  const { courseId, lessonId } = params
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [progressData, setProgressData] = useState<Map<string, LessonProgress>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoProgress, setVideoProgress] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return
      
      if (!user) {
        router.push(`/login?redirect=/learn/${courseId}/${lessonId}`)
        return
      }

      try {
        setLoading(true)
        console.log('Fetching course and lessons...', { courseId, lessonId })

        // Fetch course data
        const courseDoc = await getDoc(doc(db, 'courses', courseId))
        if (!courseDoc.exists()) {
          setError('Course not found')
          return
        }

        const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course
        setCourse(courseData)

        // Check if user is enrolled
        const isEnrolled = await EnrollmentService.isUserEnrolled(user.uid, courseId)
        if (!isEnrolled) {
          setError('You are not enrolled in this course. Please enroll first.')
          return
        }

        // Fetch lessons from subcollection
        const lessonsQuery = query(
          collection(db, 'courses', courseId, 'lessons'),
          orderBy('order', 'asc')
        )
        const lessonsSnapshot = await getDocs(lessonsQuery)
        const lessonsData = lessonsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Lesson[]

        setLessons(lessonsData)

        // Find current lesson
        const currentLessonData = lessonsData.find(l => l.id === lessonId)
        if (!currentLessonData) {
          setError('Lesson not found')
          return
        }
        setCurrentLesson(currentLessonData)

        // Fetch user progress for all lessons
        const progressMap = new Map<string, LessonProgress>()
        for (const lesson of lessonsData) {
          try {
            const progressDoc = await getDoc(doc(db, 'progress', `${user.uid}_${courseId}_${lesson.id}`))
            if (progressDoc.exists()) {
              progressMap.set(lesson.id, progressDoc.data() as LessonProgress)
            }
          } catch (e) {
            console.log('No progress found for lesson:', lesson.id)
          }
        }
        setProgressData(progressMap)

        // Set current lesson progress
        const currentProgress = progressMap.get(lessonId)
        setVideoProgress(currentProgress?.completionPercentage || 0)

      } catch (e) {
        console.error('Error fetching data:', e)
        setError('Failed to load lesson data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, authLoading, courseId, lessonId, router])

  // Determine unlocked lessons based on completion
  const getUnlockedLessons = () => {
    if (!course?.unlockSequential) {
      return new Set(lessons.map(l => l.id))
    }

    const unlocked = new Set<string>()
    
    for (const lesson of lessons) {
      if (lesson.isPreview) {
        unlocked.add(lesson.id)
        continue
      }
      
      if (lesson.order === 0) {
        unlocked.add(lesson.id)
        continue
      }
      
      // Check if previous lesson is completed
      const prevLesson = lessons.find(l => l.order === lesson.order - 1)
      if (prevLesson) {
        const prevProgress = progressData.get(prevLesson.id)
        if (prevProgress?.isCompleted) {
          unlocked.add(lesson.id)
        }
      }
    }
    
    return unlocked
  }

  // Calculate overall course progress
  const calculateCourseProgress = () => {
    if (lessons.length === 0) return { percentage: 0, watchedTime: 0, totalTime: 0 }
    
    let totalWatchedSeconds = 0
    let totalCourseSeconds = 0
    
    lessons.forEach(lesson => {
      const progress = progressData.get(lesson.id)
      totalWatchedSeconds += progress?.watchedSeconds || 0
      totalCourseSeconds += lesson.duration
    })
    
    const percentage = totalCourseSeconds > 0 ? Math.round((totalWatchedSeconds / totalCourseSeconds) * 100) : 0
    
    return {
      percentage,
      watchedTime: totalWatchedSeconds,
      totalTime: totalCourseSeconds
    }
  }
  
  const courseProgress = calculateCourseProgress()
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }
  
  // Handle duration update from YouTube player
  const handleDurationUpdate = (newDuration: number) => {
    if (currentLesson) {
      // Update the current lesson's duration in local state
      setCurrentLesson(prev => prev ? { ...prev, duration: newDuration } : null)
      
      // Update the lessons array
      setLessons(prev => 
        prev.map(lesson => 
          lesson.id === lessonId 
            ? { ...lesson, duration: newDuration }
            : lesson
        )
      )
    }
  }

  // Mock video progress update (replace with actual YouTube player)
  const handleVideoProgressUpdate = async (progress: number) => {
    if (!user || !currentLesson) return

    setVideoProgress(progress)
    
    const isCompleted = progress >= (course?.completionThreshold || 80)
    const progressData: LessonProgress = {
      lessonId: currentLesson.id,
      watchedSeconds: (progress / 100) * currentLesson.duration,
      totalSeconds: currentLesson.duration,
      completionPercentage: progress,
      isCompleted,
      lastWatchedAt: new Date()
    }

    // Save progress to Firestore
    try {
      await setDoc(doc(db, 'progress', `${user.uid}_${courseId}_${currentLesson.id}`), {
        ...progressData,
        lastWatchedAt: serverTimestamp()
      })

      // Update local state
      setProgressData(prev => new Map(prev.set(currentLesson.id, progressData)))
      
      if (isCompleted) {
        console.log(`Lesson ${currentLesson.title} completed at ${progress}%`)
      }
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  // Navigate to next lesson
  const goToNextLesson = () => {
    const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id)
    if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1]
      if (unlockedLessons.has(nextLesson.id)) {
        router.push(`/learn/${courseId}/${nextLesson.id}`)
      }
    }
  }

  // Navigate to previous lesson
  const goToPreviousLesson = () => {
    const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id)
    if (currentIndex > 0) {
      const prevLesson = lessons[currentIndex - 1]
      router.push(`/learn/${courseId}/${prevLesson.id}`)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-muted/40">
        <div className="container mx-auto p-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="aspect-video w-full mb-4" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="md:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Failed to load lesson'}</AlertDescription>
          <Button onClick={() => router.push('/courses')} className="mt-4">
            Back to Courses
          </Button>
        </Alert>
      </div>
    )
  }

  const unlockedLessons = getUnlockedLessons()
  const isLessonUnlocked = unlockedLessons.has(currentLesson.id)
  const canProceedToNext = videoProgress >= (course.completionThreshold || 80)
  const currentIndex = lessons.findIndex(l => l.id === currentLesson.id)
  const hasNextLesson = currentIndex < lessons.length - 1
  const hasPrevLesson = currentIndex > 0

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="font-semibold text-lg">{course.title}</h1>
              <p className="text-sm text-muted-foreground">{currentLesson.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary">{course.language}</Badge>
            <Badge variant="outline">{course.level}</Badge>
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Video Area */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0">
                {isLessonUnlocked ? (
                  <VimeoPlayer
                    videoId={currentLesson.vimeoVideoId}
                    courseId={courseId}
                    lessonId={lessonId}
                    onProgressUpdate={(progress) => {
                      handleVideoProgressUpdate(progress.completionPercentage);
                    }}
                    completionThreshold={course.completionThreshold || 80}
                    initialProgress={videoProgress}
                    onDurationUpdate={handleDurationUpdate}
                  />
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Lesson Locked</p>
                      <p className="text-muted-foreground">Complete the previous lesson to unlock this content</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lesson Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  About this Lesson
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{currentLesson.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {Math.floor(currentLesson.duration / 60)} minutes
                  </div>
                  <Badge variant="outline">
                    Lesson {currentLesson.order + 1} of {lessons.length}
                  </Badge>
                  {currentLesson.isPreview && (
                    <Badge variant="secondary">Free Preview</Badge>
                  )}
                </div>

                {currentLesson.learningObjectives.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Learning Objectives:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {currentLesson.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Materials
                  </Button>
                  <Button variant="outline" size="sm">
                    <StickyNote className="w-4 h-4 mr-2" />
                    Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Course Navigation */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1 p-4">
                    {lessons.map((lesson, index) => {
                      const isUnlocked = unlockedLessons.has(lesson.id)
                      const progress = progressData.get(lesson.id)
                      const isCompleted = progress?.isCompleted || false
                      const isCurrent = lesson.id === currentLesson.id
                      
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            if (isUnlocked) {
                              router.push(`/learn/${courseId}/${lesson.id}`)
                            }
                          }}
                          className={`
                            flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer
                            ${isCurrent ? 'bg-primary/10 border border-primary/20' : ''}
                            ${isUnlocked ? 'hover:bg-muted/50' : 'opacity-60 cursor-not-allowed'}
                          `}
                        >
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : isCurrent ? (
                              <Play className="w-5 h-5 text-primary" />
                            ) : !isUnlocked ? (
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isCurrent ? 'text-primary' : ''}`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                              <span>Lesson {lesson.order + 1}</span>
                              <span>{Math.floor(lesson.duration / 60)} min</span>
                            </div>
                            {progress && progress.completionPercentage > 0 && (
                              <Progress 
                                value={progress.completionPercentage} 
                                className="h-1 mt-2" 
                              />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur border-t">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToPreviousLesson}
              disabled={!hasPrevLesson}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
          </div>
          
          <div className="flex-1 max-w-md mx-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Course Progress</span>
              <span>{courseProgress.percentage}% • {formatTime(courseProgress.watchedTime)} / {formatTime(courseProgress.totalTime)}</span>
            </div>
            <Progress value={courseProgress.percentage} className="h-2" />
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              size="sm"
              onClick={goToNextLesson}
              disabled={!canProceedToNext || !hasNextLesson}
            >
              Next Lesson
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}