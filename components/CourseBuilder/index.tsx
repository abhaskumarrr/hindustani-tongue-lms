"use client"

import React, { useState } from 'react'
import { CourseBasicInfo } from './CourseBasicInfo'
import { LessonManager } from './LessonManager'
import { CoursePreview } from './CoursePreview'
import { CoursePublish } from './CoursePublish'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react'
import { Course, Lesson } from '@/lib/services/course-service'
import { useAuth } from '@/contexts/AuthContext'

export interface CourseBuilderProps {
  onCourseCreated: (courseId: string) => void
  isCreating: boolean
  setIsCreating: (creating: boolean) => void
  existingCourse?: Course
}

export interface CourseFormData {
  title: string
  description: string
  language: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  price: number
  thumbnail: string
  tags: string[]
  prerequisites: string[]
  learningObjectives: string[]
  features: string[]
  requirements: string[]
  lessons: Lesson[]
}

const STEPS = [
  { id: 'basic', title: 'Basic Information', description: 'Course title, description, and pricing' },
  { id: 'lessons', title: 'Lessons & Content', description: 'Add and organize your course lessons' },
  { id: 'preview', title: 'Preview & Review', description: 'Review your course before publishing' },
  { id: 'publish', title: 'Publish Course', description: 'Submit for review and publish' }
]

export function CourseBuilder({ 
  onCourseCreated, 
  isCreating, 
  setIsCreating,
  existingCourse 
}: CourseBuilderProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [courseData, setCourseData] = useState<CourseFormData>({
    title: existingCourse?.title || '',
    description: existingCourse?.description || '',
    language: existingCourse?.language || 'Hindi',
    level: existingCourse?.level || 'Beginner',
    price: existingCourse?.price ? existingCourse.price / 100 : 0, // Convert from paise to rupees
    thumbnail: existingCourse?.thumbnail || '',
    tags: existingCourse?.tags || [],
    prerequisites: existingCourse?.prerequisites || [],
    learningObjectives: existingCourse?.learningObjectives || [],
    features: existingCourse?.features || [],
    requirements: existingCourse?.requirements || [],
    lessons: existingCourse?.lessons || []
  })

  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const updateCourseData = (updates: Partial<CourseFormData>) => {
    setCourseData(prev => ({ ...prev, ...updates }))
  }

  const markStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]))
  }

  const isStepComplete = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Basic Info
        return courseData.title.trim() !== '' && 
               courseData.description.trim() !== '' && 
               courseData.price > 0
      case 1: // Lessons
        return courseData.lessons.length >= 3 // Minimum 3 lessons for MVP
      case 2: // Preview
        return completedSteps.has(2)
      case 3: // Publish
        return completedSteps.has(3)
      default:
        return false
    }
  }

  const canProceedToStep = (stepIndex: number) => {
    if (stepIndex === 0) return true
    return isStepComplete(stepIndex - 1)
  }

  const handleNext = () => {
    if (isStepComplete(currentStep)) {
      markStepComplete(currentStep)
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    if (canProceedToStep(stepIndex)) {
      setCurrentStep(stepIndex)
    }
  }

  const progress = ((completedSteps.size + (isStepComplete(currentStep) ? 1 : 0)) / STEPS.length) * 100

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CourseBasicInfo
            courseData={courseData}
            updateCourseData={updateCourseData}
            onComplete={() => markStepComplete(0)}
          />
        )
      case 1:
        return (
          <LessonManager
            lessons={courseData.lessons}
            updateLessons={(lessons) => updateCourseData({ lessons })}
            onComplete={() => markStepComplete(1)}
          />
        )
      case 2:
        return (
          <CoursePreview
            courseData={courseData}
            onComplete={() => markStepComplete(2)}
          />
        )
      case 3:
        return (
          <CoursePublish
            courseData={courseData}
            instructorId={user?.uid || ''}
            onCourseCreated={onCourseCreated}
            isCreating={isCreating}
            setIsCreating={setIsCreating}
            existingCourseId={existingCourse?.id}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Course Creation Progress</h2>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STEPS.map((step, index) => {
          const isActive = currentStep === index
          const isComplete = completedSteps.has(index)
          const canAccess = canProceedToStep(index)

          return (
            <Card 
              key={step.id}
              className={`cursor-pointer transition-all ${
                isActive ? 'ring-2 ring-primary' : ''
              } ${!canAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => canAccess && handleStepClick(index)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {isComplete ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-medium text-sm ${isActive ? 'text-primary' : ''}`}>
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[600px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep < STEPS.length - 1 && (
                <Button
                  onClick={handleNext}
                  disabled={!isStepComplete(currentStep)}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}