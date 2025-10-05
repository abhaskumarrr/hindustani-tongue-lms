"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InstructorNavigation } from '@/components/InstructorNavigation'
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp,
  Plus,
  BarChart3,
  Clock,
  Star
} from 'lucide-react'
import Link from 'next/link'

export default function InstructorDashboard() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && (!user || !userData)) {
      router.push('/login')
      return
    }
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

  return (
    <div className="min-h-screen bg-background">
      <InstructorNavigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Manage your courses and track your teaching performance.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Total Courses</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">₹0</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">0.0</div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with creating and managing your courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/instructor/courses/create">
                <Button className="w-full justify-start" size="lg">
                  <Plus className="h-5 w-5 mr-3" />
                  Create New Course
                </Button>
              </Link>
              
              <Link href="/instructor/courses">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <BookOpen className="h-5 w-5 mr-3" />
                  Manage Courses
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full justify-start" size="lg" disabled>
                <BarChart3 className="h-5 w-5 mr-3" />
                View Analytics
                <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Tips to help you create successful courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Plan Your Course</h4>
                    <p className="text-sm text-muted-foreground">
                      Define clear learning objectives and structure your content
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Create Quality Content</h4>
                    <p className="text-sm text-muted-foreground">
                      Use clear audio, good lighting, and engaging teaching methods
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Engage Students</h4>
                    <p className="text-sm text-muted-foreground">
                      Add interactive elements and respond to student questions
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest course activities and student interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Create your first course to see activity here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}