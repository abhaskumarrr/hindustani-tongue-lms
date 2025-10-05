"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { CourseThresholdSettings } from '@/components/admin/CourseThresholdSettings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function CourseSettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesSnapshot = await getDocs(collection(db, 'courses'))
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setCourses(coursesData)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && !authLoading) {
      fetchCourses()
    }
  }, [user, authLoading])

  const handleThresholdUpdate = (courseId: string, newThreshold: number) => {
    setCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, completionThreshold: newThreshold }
          : course
      )
    )
  }

  if (loading || authLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Course Settings</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Course Settings</h1>
      
      <div className="space-y-6">
        {courses.map(course => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <p className="text-muted-foreground">
                {course.language} • {course.level} • Instructor: {course.instructorName}
              </p>
            </CardHeader>
            <CardContent>
              <CourseThresholdSettings
                courseId={course.id}
                currentThreshold={course.completionThreshold || 80}
                onThresholdUpdate={(newThreshold) => handleThresholdUpdate(course.id, newThreshold)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}