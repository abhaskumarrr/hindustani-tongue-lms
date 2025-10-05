"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle, Database, Users, BookOpen, BarChart3 } from "lucide-react"
import { seedCourses } from "@/lib/utils/seed-data"
import { toast } from "sonner"

export default function AdminSeedPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedingStatus, setSeedingStatus] = useState<{
    courses: 'pending' | 'success' | 'error'
    message?: string
  }>({
    courses: 'pending'
  })

  const handleSeedCourses = async () => {
    setIsSeeding(true)
    setSeedingStatus({ courses: 'pending' })
    
    try {
      console.log('Starting to seed courses...')
      await seedCourses()
      
      setSeedingStatus({ 
        courses: 'success',
        message: 'Successfully seeded 3 courses with lessons'
      })
      toast.success('Database seeded successfully!')
    } catch (error) {
      console.error('Seeding error:', error)
      setSeedingStatus({ 
        courses: 'error',
        message: `Failed to seed courses: ${error}`
      })
      toast.error('Failed to seed database')
    } finally {
      setIsSeeding(false)
    }
  }

  const StatusIcon = ({ status }: { status: 'pending' | 'success' | 'error' }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Database className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Database Seeding</h1>
            <p className="text-muted-foreground">
              Populate your Firestore database with sample courses and data for testing
            </p>
          </div>

          {/* Seeding Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Seeding Status
              </CardTitle>
              <CardDescription>
                Current status of database seeding operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <StatusIcon status={seedingStatus.courses} />
                    <div>
                      <p className="font-medium">Sample Courses</p>
                      <p className="text-sm text-muted-foreground">
                        Hindi, Urdu, and Bengali courses with lessons
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    seedingStatus.courses === 'success' ? 'default' :
                    seedingStatus.courses === 'error' ? 'destructive' : 'secondary'
                  }>
                    {seedingStatus.courses === 'success' ? 'Complete' :
                     seedingStatus.courses === 'error' ? 'Failed' : 'Pending'}
                  </Badge>
                </div>
                
                {seedingStatus.message && (
                  <div className={`p-3 rounded-lg text-sm ${
                    seedingStatus.courses === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {seedingStatus.message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sample Data Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">3</div>
                <p className="text-sm text-muted-foreground">
                  Hindi Fundamentals, Urdu Poetry, Bengali Culture
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">12</div>
                <p className="text-sm text-muted-foreground">
                  Interactive lessons with YouTube videos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">100%</div>
                <p className="text-sm text-muted-foreground">
                  Complete course browsing & enrollment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Seeding Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Seed Database</CardTitle>
              <CardDescription>
                This will create sample courses, lessons, and test data in your Firestore database.
                Safe to run multiple times - existing data won't be duplicated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What will be created:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 3 sample courses (Hindi, Urdu, Bengali)</li>
                    <li>• 12 lessons with YouTube video placeholders</li>
                    <li>• Course metadata (pricing, ratings, descriptions)</li>
                    <li>• Proper lesson ordering and preview settings</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleSeedCourses}
                  disabled={isSeeding}
                  size="lg"
                  className="w-full"
                >
                  {isSeeding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Seeding Database...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Seed Sample Data
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  This operation uses your Firebase project's client SDK and requires proper authentication.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          {seedingStatus.courses === 'success' && (
            <Card className="mt-6 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">🎉 Seeding Complete!</CardTitle>
                <CardDescription className="text-green-700">
                  Your database has been populated with sample data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-green-800">
                    You can now test the following features:
                  </p>
                  <ul className="text-sm text-green-800 space-y-1 ml-4">
                    <li>• Browse courses at <code>/courses</code></li>
                    <li>• View course details and enrollment</li>
                    <li>• Test the learning interface</li>
                    <li>• Check progress tracking</li>
                  </ul>
                  <div className="flex gap-2 mt-4">
                    <Button asChild variant="outline" size="sm">
                      <a href="/courses">View Courses</a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a href="/dashboard">Dashboard</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}