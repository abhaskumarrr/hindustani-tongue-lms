"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  Eye, 
  BookOpen, 
  Globe, 
  BarChart3,
  IndianRupee,
  Youtube,
  CheckCircle,
  Target
} from 'lucide-react'
import { CourseFormData } from './index'

interface CoursePreviewProps {
  courseData: CourseFormData
  onComplete: () => void
}

export function CoursePreview({ courseData, onComplete }: CoursePreviewProps) {
  const [previewMode, setPreviewMode] = useState<'student' | 'instructor'>('student')

  React.useEffect(() => {
    // Auto-complete this step when component mounts
    onComplete()
  }, [onComplete])

  const totalDuration = courseData.lessons.reduce((acc, lesson) => acc + (lesson.duration || 300), 0) // Assume 5 min per lesson if no duration
  const previewLessons = courseData.lessons.filter(lesson => lesson.isPreview)
  const paidLessons = courseData.lessons.filter(lesson => !lesson.isPreview)

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Course Preview
          </CardTitle>
          <CardDescription>
            Review how your course will appear to students before publishing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={previewMode === 'student' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('student')}
            >
              Student View
            </Button>
            <Button
              variant={previewMode === 'instructor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('instructor')}
            >
              Instructor View
            </Button>
          </div>

          {previewMode === 'student' ? (
            <StudentPreview courseData={courseData} />
          ) : (
            <InstructorPreview courseData={courseData} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StudentPreview({ courseData }: { courseData: CourseFormData }) {
  const totalDuration = courseData.lessons.reduce((acc, lesson) => acc + (lesson.duration || 300), 0)
  const previewLessons = courseData.lessons.filter(lesson => lesson.isPreview)

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{courseData.title}</h1>
            <p className="text-muted-foreground mb-4">{courseData.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {courseData.language}
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                {courseData.level}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {Math.floor(totalDuration / 3600)}h {Math.floor((totalDuration % 3600) / 60)}m
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {courseData.lessons.length} lessons
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {courseData.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold flex items-center gap-1">
              <IndianRupee className="h-6 w-6" />
              {courseData.price.toLocaleString('en-IN')}
            </div>
            <Button className="mt-2 w-full">
              Enroll Now
            </Button>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* What You'll Learn */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                What You'll Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {courseData.learningObjectives.map((objective, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{objective}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {courseData.lessons.length} lessons • {Math.floor(totalDuration / 3600)}h {Math.floor((totalDuration % 3600) / 60)}m total length
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {courseData.lessons.map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <Play className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground">{lesson.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lesson.isPreview && (
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {Math.floor((lesson.duration || 300) / 60)}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Prerequisites */}
          {courseData.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {courseData.prerequisites.map((prereq, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{prereq}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Skill Level</span>
                <span className="text-sm font-medium">{courseData.level}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Language</span>
                <span className="text-sm font-medium">{courseData.language}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Lessons</span>
                <span className="text-sm font-medium">{courseData.lessons.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Free Previews</span>
                <span className="text-sm font-medium">{courseData.lessons.filter(l => l.isPreview).length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function InstructorPreview({ courseData }: { courseData: CourseFormData }) {
  const totalDuration = courseData.lessons.reduce((acc, lesson) => acc + (lesson.duration || 300), 0)
  const previewLessons = courseData.lessons.filter(lesson => lesson.isPreview)
  const paidLessons = courseData.lessons.filter(lesson => !lesson.isPreview)

  return (
    <div className="space-y-6">
      {/* Course Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Course Summary</CardTitle>
          <CardDescription>Overview of your course structure and content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{courseData.lessons.length}</div>
              <div className="text-sm text-muted-foreground">Total Lessons</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{previewLessons.length}</div>
              <div className="text-sm text-muted-foreground">Free Previews</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{Math.floor(totalDuration / 3600)}h</div>
              <div className="text-sm text-muted-foreground">Total Duration</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                <IndianRupee className="h-5 w-5" />
                {courseData.price.toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-muted-foreground">Price</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Free Preview Lessons</span>
              <span className="font-medium">{previewLessons.length} ({Math.round((previewLessons.length / courseData.lessons.length) * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Paid Lessons</span>
              <span className="font-medium">{paidLessons.length} ({Math.round((paidLessons.length / courseData.lessons.length) * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Learning Objectives</span>
              <span className="font-medium">{courseData.learningObjectives.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Prerequisites</span>
              <span className="font-medium">{courseData.prerequisites.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tags</span>
              <span className="font-medium">{courseData.tags.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Readiness Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Course title and description</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Pricing information</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Minimum 3 lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Learning objectives defined</span>
            </div>
            <div className="flex items-center gap-2">
              {previewLessons.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 border-2 border-muted-foreground rounded-full" />
              )}
              <span className="text-sm">At least one preview lesson (recommended)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Details */}
      <Card>
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
          <CardDescription>Review all your lessons and their settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {courseData.lessons.map((lesson, index) => (
              <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{lesson.title}</h4>
                    <p className="text-sm text-muted-foreground">{lesson.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Youtube className="h-3 w-3" />
                        {lesson.youtubeVideoId}
                      </span>
                      <span>{lesson.learningObjectives.length} objectives</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lesson.isPreview && (
                    <Badge variant="outline" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {Math.floor((lesson.duration || 300) / 60)}m
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}