"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Database, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { CourseService } from '@/lib/services/course-service'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function DebugPage() {
  const { user, userData, loading } = useAuth()
  const [debugResults, setDebugResults] = useState<any>({})
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const results: any = {}

    try {
      // Test 1: Firebase connection
      console.log('Testing Firebase connection...')
      results.firebaseConnection = 'Testing...'
      
      try {
        const testDoc = await getDoc(doc(db, 'test', 'connection'))
        results.firebaseConnection = 'Connected ✅'
      } catch (error) {
        results.firebaseConnection = `Connection Error: ${error}`
      }

      // Test 2: Check if courses collection exists
      console.log('Checking courses collection...')
      results.coursesCollection = 'Testing...'
      
      try {
        const coursesSnapshot = await getDocs(collection(db, 'courses'))
        results.coursesCollection = `Found ${coursesSnapshot.size} courses ✅`
        results.coursesList = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title
        }))
      } catch (error) {
        results.coursesCollection = `Error: ${error}`
      }

      // Test 3: Check user document
      if (user) {
        console.log('Checking user document...')
        results.userDocument = 'Testing...'
        
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            results.userDocument = 'User document exists ✅'
            results.userDocumentData = userDoc.data()
          } else {
            results.userDocument = 'User document does not exist ❌'
          }
        } catch (error) {
          results.userDocument = `Error: ${error}`
        }

        // Test 4: Check enrollments
        console.log('Checking enrollments...')
        results.enrollments = 'Testing...'
        
        try {
          const enrollmentsSnapshot = await getDocs(collection(db, 'enrollments'))
          const userEnrollments = enrollmentsSnapshot.docs.filter(doc => 
            doc.data().userId === user.uid
          )
          results.enrollments = `Found ${userEnrollments.length} enrollments for user ✅`
          results.enrollmentsList = userEnrollments.map(doc => ({
            id: doc.id,
            courseId: doc.data().courseId,
            status: doc.data().status
          }))
        } catch (error) {
          results.enrollments = `Error: ${error}`
        }

        // Test 5: Test CourseService
        console.log('Testing CourseService...')
        results.courseService = 'Testing...'
        
        try {
          const enrolledCourses = await CourseService.getUserEnrolledCourses(user.uid)
          results.courseService = `CourseService returned ${enrolledCourses.length} courses ✅`
          results.courseServiceData = enrolledCourses
        } catch (error) {
          results.courseService = `CourseService Error: ${error}`
        }
      }

      // Test 6: Check all collections
      console.log('Checking all collections...')
      results.allCollections = 'Testing...'
      
      try {
        const collections = ['courses', 'users', 'enrollments', 'userProgress']
        const collectionSizes: any = {}
        
        for (const collectionName of collections) {
          const snapshot = await getDocs(collection(db, collectionName))
          collectionSizes[collectionName] = snapshot.size
        }
        
        results.allCollections = 'All collections checked ✅'
        results.collectionSizes = collectionSizes
      } catch (error) {
        results.allCollections = `Error: ${error}`
      }

    } catch (error) {
      results.generalError = `General Error: ${error}`
    }

    setDebugResults(results)
    setIsRunning(false)
  }

  useEffect(() => {
    if (user && !loading) {
      runDiagnostics()
    }
  }, [user, loading])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">System Debug</h1>
          <p className="text-muted-foreground">
            Comprehensive system diagnostics to identify issues with the LMS.
          </p>
        </div>

        {/* Auth Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>Loading: {loading ? '⏳' : '✅'}</div>
              <div>User: {user ? `✅ ${user.email}` : '❌ Not logged in'}</div>
              <div>User Data: {userData ? '✅ Loaded' : '❌ Not loaded'}</div>
              <div>User ID: {user?.uid || 'N/A'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnostics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              System Diagnostics
            </CardTitle>
            <CardDescription>
              Comprehensive checks of Firebase, collections, and services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={runDiagnostics} 
                disabled={isRunning || !user}
                className="mb-4"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Diagnostics...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Run Diagnostics
                  </>
                )}
              </Button>

              {Object.keys(debugResults).length > 0 && (
                <div className="space-y-3">
                  {Object.entries(debugResults).map(([key, value]) => (
                    <div key={key} className="p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium text-sm mb-1">{key}:</div>
                      <div className="text-sm text-muted-foreground">
                        {typeof value === 'object' ? (
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          String(value)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => window.location.href = '/admin/seed'}>
                Seed Database
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/admin/enroll'}>
                Enroll in Courses
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/debug-dashboard'}>
                Debug Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}