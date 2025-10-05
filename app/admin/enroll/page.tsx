"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { doc, setDoc, updateDoc, getDoc, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const availableCourses = [
  { id: 'hindi-fundamentals', title: 'Hindi Fundamentals' },
  { id: 'urdu-poetry', title: 'Urdu Poetry & Literature' },
  { id: 'bengali-culture', title: 'Bengali Culture & Language' }
]

export default function EnrollPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState('')
  const [customUserId, setCustomUserId] = useState('')
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrollmentResults, setEnrollmentResults] = useState<string[]>([])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/admin/enroll')
    }
  }, [user, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing if not authenticated (will redirect)
  if (!user) {
    return null
  }

  const enrollUser = async (userId: string, courseId: string) => {
    // Create enrollment record
    const enrollmentId = `${userId}_${courseId}`
    const enrollment = {
      userId,
      courseId,
      enrolledAt: serverTimestamp(),
      status: 'active'
    }

    await setDoc(doc(db, 'enrollments', enrollmentId), enrollment)

    // Update user's enrolled courses
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        enrolledCourses: arrayUnion(courseId)
      })
    } else {
      // Create basic user document if it doesn't exist
      await setDoc(userRef, {
        uid: userId,
        enrolledCourses: [courseId],
        createdAt: serverTimestamp()
      }, { merge: true })
    }

    return `Successfully enrolled in ${availableCourses.find(c => c.id === courseId)?.title}`
  }

  const handleEnrollCurrent = async () => {
    if (!user || !selectedCourse) {
      toast.error('Please select a course and ensure you are logged in')
      return
    }

    setIsEnrolling(true)
    try {
      const result = await enrollUser(user.uid, selectedCourse)
      setEnrollmentResults(prev => [...prev, result])
      toast.success(result)
      setSelectedCourse('')
    } catch (error) {
      console.error('Enrollment error:', error)
      toast.error('Failed to enroll in course')
    } finally {
      setIsEnrolling(false)
    }
  }

  const enrollInAllCourses = async () => {
    if (!user) {
      toast.error('Please log in first')
      return
    }

    setIsEnrolling(true)
    try {
      const results: any[] = []
      for (const course of availableCourses) {
        const result = await enrollUser(user.uid, course.id)
        results.push(result)
      }
      setEnrollmentResults(prev => [...prev, ...results])
      toast.success(`Enrolled in all ${availableCourses.length} courses!`)
    } catch (error) {
      console.error('Bulk enrollment error:', error)
      toast.error('Failed to enroll in all courses')
    } finally {
      setIsEnrolling(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Course Enrollment Tool</h1>
          <p className="text-muted-foreground">
            Enroll users in courses for testing purposes.
          </p>
        </div>

        {/* Current User Enrollment */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Enroll Current User
            </CardTitle>
            <CardDescription>
              {user ? `Enroll ${user.email} in a course` : 'Please log in to enroll yourself'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-select">Select Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={handleEnrollCurrent}
                disabled={!user || !selectedCourse || isEnrolling}
                className="flex-1"
              >
                {isEnrolling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  'Enroll in Selected Course'
                )}
              </Button>

              <Button 
                onClick={enrollInAllCourses}
                disabled={!user || isEnrolling}
                variant="outline"
              >
                Enroll in All Courses
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {enrollmentResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Enrollment Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {enrollmentResults.map((result, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">{result}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 flex space-x-4">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/courses'}>
            View Courses
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/admin/seed'}>
            Seed Database
          </Button>
        </div>
      </div>
    </div>
  )
}