"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { EnrollmentService } from '@/lib/services/enrollment-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Clock, BookOpen, ChevronLeft, Star } from 'lucide-react'

export default function EnrollPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      if (authLoading) return
      if (!user) {
        router.push(`/login?redirect=/courses/${courseId}/enroll`)
        return
      }

      try {
        const courseDoc = await getDoc(doc(db, 'courses', courseId))
        if (courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() })
        } else {
          router.push('/courses')
        }
      } catch (error) {
        console.error('Error fetching course:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [user, authLoading, courseId, router])

  const handleEnroll = async () => {
    if (!user || !course) return

    try {
      setEnrolling(true)
      await EnrollmentService.enrollUser(user.uid, courseId)
      router.push(`/learn/${courseId}/lesson-1`)
    } catch (error) {
      console.error('Enrollment failed:', error)
      alert('Failed to enroll. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-muted/40">
        <div className="container mx-auto p-4 max-w-4xl">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p>Course not found</p>
            <Button onClick={() => router.push('/courses')} className="mt-4">
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/courses')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-3">{course.title}</CardTitle>
                <p className="text-muted-foreground mb-4 text-lg">{course.description}</p>
                <div className="flex gap-2 mb-4">
                  <Badge className="text-sm">{course.language}</Badge>
                  <Badge variant="outline" className="text-sm">{course.level}</Badge>
                  <Badge variant="secondary" className="text-sm flex items-center">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {course.rating || 4.8}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{course.enrollmentCount || 0} students enrolled</span>
                  <span>By {course.instructorName}</span>
                </div>
              </div>
              <div className="text-right ml-6">
                <div className="text-3xl font-bold text-primary">
                  ₹{((course.price || 0) / 100).toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">One-time payment</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Course Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{course.lessons?.length || 0} Lessons</div>
                  <div className="text-sm text-muted-foreground">Step-by-step curriculum</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{Math.floor((course.totalDuration || 0) / 3600)}h {Math.floor(((course.totalDuration || 0) % 3600) / 60)}m</div>
                  <div className="text-sm text-muted-foreground">At your own pace</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Certificate</div>
                  <div className="text-sm text-muted-foreground">Upon completion</div>
                </div>
              </div>
            </div>

            {/* Learning Objectives */}
            {course.learningObjectives && course.learningObjectives.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">What you'll learn:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {course.learningObjectives.map((objective: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Details */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-3">Course Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Skill Level:</span>
                    <span>{course.level || 'Beginner'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span>{course.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{Math.floor((course.totalDuration || 0) / 3600)} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completion Threshold:</span>
                    <span>{course.completionThreshold || 80}% per lesson</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Instructor</h3>
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                    {course.instructorName?.charAt(0) || 'I'}
                  </div>
                  <div>
                    <div className="font-medium">{course.instructorName}</div>
                    <div className="text-sm text-muted-foreground">Language Expert</div>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 fill-current text-yellow-500 mr-1" />
                      <span className="text-sm">{course.rating || 4.8} instructor rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment Section */}
            <div className="border-t pt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleEnroll} 
                  disabled={enrolling}
                  size="lg"
                  className="flex-1 sm:flex-none sm:min-w-48"
                >
                  {enrolling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enrolling...
                    </>
                  ) : (
                    'Enroll Now'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => router.push('/courses')}
                  className="flex-1 sm:flex-none sm:min-w-48"
                >
                  Browse More Courses
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                30-day money-back guarantee • Lifetime access
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}