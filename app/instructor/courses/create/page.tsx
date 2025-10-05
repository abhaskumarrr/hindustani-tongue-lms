"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CourseBuilder } from '@/components/CourseBuilder'
import { InstructorNavigation } from '@/components/InstructorNavigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function CreateCoursePage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  // Redirect if not authenticated or not an instructor
  React.useEffect(() => {
    if (!loading && (!user || !userData)) {
      router.push('/login')
      return
    }
    
    // For MVP, we'll allow any authenticated user to create courses
    // In production, you'd check for instructor role
    // if (!loading && userData && userData.role !== 'instructor') {
    //   router.push('/dashboard')
    //   return
    // }
  }, [user, userData, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !userData) {
    return null
  }

  const handleCourseCreated = (courseId: string) => {
    setIsCreating(false)
    router.push(`/instructor/courses/${courseId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <InstructorNavigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/instructor/courses">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create New Course</h1>
              <p className="text-muted-foreground">
                Build and organize your course content with our easy-to-use course builder
              </p>
            </div>
          </div>
        </div>

        {/* Course Builder */}
        <div className="max-w-4xl mx-auto">
          <CourseBuilder
            onCourseCreated={handleCourseCreated}
            isCreating={isCreating}
            setIsCreating={setIsCreating}
          />
        </div>
      </div>
    </div>
  )
}