"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Send,
  BookOpen,
  Users,
  DollarSign
} from 'lucide-react'
import { CourseFormData } from './index'
import { Course } from '@/lib/services/course-service'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface CoursePublishProps {
  courseData: CourseFormData
  instructorId: string
  onCourseCreated: (courseId: string) => void
  isCreating: boolean
  setIsCreating: (creating: boolean) => void
  existingCourseId?: string
}

export function CoursePublish({ 
  courseData, 
  instructorId, 
  onCourseCreated, 
  isCreating, 
  setIsCreating,
  existingCourseId 
}: CoursePublishProps) {
  const [publishStatus, setPublishStatus] = useState<'draft' | 'submitting' | 'submitted' | 'error'>('draft')
  const [error, setError] = useState<string>('')

  const handlePublish = async () => {
    setIsCreating(true)
    setPublishStatus('submitting')
    setError('')

    try {
      const batch = writeBatch(db)

      // Calculate total duration (estimate 5 minutes per lesson if not provided)
      const totalDuration = courseData.lessons.reduce((acc, lesson) => acc + (lesson.duration || 300), 0)

      // Prepare course data
      const courseDoc: Omit<Course, 'id'> = {
        title: courseData.title,
        description: courseData.description,
        instructorId,
        instructorName: 'Instructor', // This should come from user data in production
        price: courseData.price * 100, // Convert to paise
        currency: 'INR',
        thumbnail: courseData.thumbnail || '/placeholder.jpg',
        status: 'draft', // Always start as draft for admin approval
        lessons: courseData.lessons.map((lesson, index) => ({
          ...lesson,
          order: index,
          duration: lesson.duration || 300 // Default 5 minutes
        })),
        totalDuration,
        enrollmentCount: 0,
        rating: 0,
        reviewCount: 0,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        language: courseData.language,
        level: courseData.level,
        tags: courseData.tags,
        prerequisites: courseData.prerequisites,
        learningObjectives: courseData.learningObjectives,
        features: courseData.features,
        requirements: courseData.requirements,
        completionThreshold: 80, // 80% completion rule
        unlockSequential: true // Sequential unlocking enabled
      }

      let courseId: string

      if (existingCourseId) {
        // Update existing course
        const courseRef = doc(db, 'courses', existingCourseId)
        batch.update(courseRef, {
          ...courseDoc,
          updatedAt: serverTimestamp()
        })
        courseId = existingCourseId
      } else {
        // Create new course
        const courseRef = doc(collection(db, 'courses'))
        batch.set(courseRef, courseDoc)
        courseId = courseRef.id

        // Create lessons as subcollection
        courseData.lessons.forEach((lesson, index) => {
          const lessonRef = doc(collection(db, 'courses', courseId, 'lessons'))
          batch.set(lessonRef, {
            ...lesson,
            order: index,
            duration: lesson.duration || 300,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        })
      }

      await batch.commit()

      setPublishStatus('submitted')
      
      // Simulate a brief delay for better UX
      setTimeout(() => {
        onCourseCreated(courseId)
      }, 1500)

    } catch (err) {
      console.error('Error publishing course:', err)
      setError(err instanceof Error ? err.message : 'Failed to publish course')
      setPublishStatus('error')
      setIsCreating(false)
    }
  }

  const getStatusIcon = () => {
    switch (publishStatus) {
      case 'submitting':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
      case 'submitted':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />
      default:
        return <Send className="h-5 w-5" />
    }
  }

  const getStatusMessage = () => {
    switch (publishStatus) {
      case 'submitting':
        return 'Creating your course...'
      case 'submitted':
        return 'Course submitted successfully!'
      case 'error':
        return 'Failed to create course'
      default:
        return 'Ready to publish'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Publish Course
          </CardTitle>
          <CardDescription>
            Submit your course for review and make it available to students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Publishing Process */}
          <div className="space-y-4">
            <h3 className="font-medium">What happens next?</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                  <span className="text-sm font-medium">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Course Submission</h4>
                  <p className="text-sm text-muted-foreground">
                    Your course will be saved as a draft and submitted for review
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                  <span className="text-sm font-medium">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Admin Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your course content and quality (1-2 business days)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                  <span className="text-sm font-medium">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Go Live</h4>
                  <p className="text-sm text-muted-foreground">
                    Once approved, your course will be published and available for enrollment
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Summary */}
          <div className="space-y-4">
            <h3 className="font-medium">Course Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <BookOpen className="h-8 w-8 text-primary" />
                <div>
                  <div className="font-medium">{courseData.lessons.length}</div>
                  <div className="text-sm text-muted-foreground">Lessons</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <div className="font-medium">
                    {Math.floor(courseData.lessons.length * 5 / 60)}h {(courseData.lessons.length * 5) % 60}m
                  </div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <div className="font-medium">₹{courseData.price.toLocaleString('en-IN')}</div>
                  <div className="text-sm text-muted-foreground">Price</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quality Guidelines */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Quality Guidelines:</strong> Ensure your videos are clear, audio is audible, 
              and content is educational. Courses with poor quality may be rejected.
            </AlertDescription>
          </Alert>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Status Display */}
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            {getStatusIcon()}
            <div>
              <div className="font-medium">{getStatusMessage()}</div>
              {publishStatus === 'submitted' && (
                <div className="text-sm text-muted-foreground">
                  You will be redirected to your course dashboard shortly...
                </div>
              )}
            </div>
          </div>

          {/* Publish Button */}
          <div className="flex justify-end">
            <Button
              onClick={handlePublish}
              disabled={isCreating || publishStatus === 'submitted'}
              size="lg"
              className="min-w-[200px]"
            >
              {publishStatus === 'submitting' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              )}
              {publishStatus === 'submitted' ? 'Course Created!' : 
               publishStatus === 'submitting' ? 'Creating Course...' : 
               existingCourseId ? 'Update Course' : 'Create Course'}
            </Button>
          </div>

          {/* Terms and Conditions */}
          <div className="text-xs text-muted-foreground border-t pt-4">
            <p>
              By publishing this course, you agree to our{' '}
              <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>{' '}
              and confirm that you have the rights to all content included in this course.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}