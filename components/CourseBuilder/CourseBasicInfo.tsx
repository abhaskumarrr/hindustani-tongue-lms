"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, IndianRupee, BookOpen, Globe, BarChart3 } from 'lucide-react'
import { CourseFormData } from './index'

interface CourseBasicInfoProps {
  courseData: CourseFormData
  updateCourseData: (updates: Partial<CourseFormData>) => void
  onComplete: () => void
}

const LANGUAGES = [
  'Hindi',
  'Urdu',
  'Bengali',
  'Punjabi',
  'Gujarati',
  'Marathi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam'
]

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const

const COMMON_TAGS = [
  'Grammar',
  'Vocabulary',
  'Conversation',
  'Writing',
  'Reading',
  'Pronunciation',
  'Culture',
  'Literature',
  'Business',
  'Academic'
]

export function CourseBasicInfo({ courseData, updateCourseData, onComplete }: CourseBasicInfoProps) {
  const [newTag, setNewTag] = useState('')
  const [newPrerequisite, setNewPrerequisite] = useState('')
  const [newObjective, setNewObjective] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!courseData.title.trim()) {
      newErrors.title = 'Course title is required'
    } else if (courseData.title.length < 10) {
      newErrors.title = 'Course title must be at least 10 characters'
    }

    if (!courseData.description.trim()) {
      newErrors.description = 'Course description is required'
    } else if (courseData.description.length < 50) {
      newErrors.description = 'Course description must be at least 50 characters'
    }

    if (courseData.price <= 0) {
      newErrors.price = 'Course price must be greater than 0'
    } else if (courseData.price > 50000) {
      newErrors.price = 'Course price cannot exceed ₹50,000'
    }

    if (courseData.learningObjectives.length === 0) {
      newErrors.objectives = 'At least one learning objective is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    if (validateForm()) {
      onComplete()
    }
  }, [courseData, onComplete])

  const addTag = (tag: string) => {
    if (tag && !courseData.tags.includes(tag)) {
      updateCourseData({ tags: [...courseData.tags, tag] })
    }
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    updateCourseData({ tags: courseData.tags.filter(tag => tag !== tagToRemove) })
  }

  const addPrerequisite = () => {
    if (newPrerequisite && !courseData.prerequisites.includes(newPrerequisite)) {
      updateCourseData({ prerequisites: [...courseData.prerequisites, newPrerequisite] })
    }
    setNewPrerequisite('')
  }

  const removePrerequisite = (prereqToRemove: string) => {
    updateCourseData({ 
      prerequisites: courseData.prerequisites.filter(prereq => prereq !== prereqToRemove) 
    })
  }

  const addObjective = () => {
    if (newObjective && !courseData.learningObjectives.includes(newObjective)) {
      updateCourseData({ 
        learningObjectives: [...courseData.learningObjectives, newObjective] 
      })
    }
    setNewObjective('')
  }

  const removeObjective = (objToRemove: string) => {
    updateCourseData({ 
      learningObjectives: courseData.learningObjectives.filter(obj => obj !== objToRemove) 
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Basic Course Information
          </CardTitle>
          <CardDescription>
            Provide the essential details about your course that students will see first
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Course Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Complete Hindi Grammar for Beginners"
              value={courseData.title}
              onChange={(e) => updateCourseData({ title: e.target.value })}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {courseData.title.length}/100 characters
            </p>
          </div>

          {/* Course Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Course Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn in this course, who it's for, and what makes it unique..."
              value={courseData.description}
              onChange={(e) => updateCourseData({ description: e.target.value })}
              className={`min-h-[120px] ${errors.description ? 'border-destructive' : ''}`}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {courseData.description.length}/500 characters
            </p>
          </div>

          {/* Language and Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language *</Label>
              <Select
                value={courseData.language}
                onValueChange={(value) => updateCourseData({ language: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((language) => (
                    <SelectItem key={language} value={language}>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {language}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level *</Label>
              <Select
                value={courseData.level}
                onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => 
                  updateCourseData({ level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        {level}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Course Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Course Price (₹) *</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                placeholder="999"
                value={courseData.price || ''}
                onChange={(e) => updateCourseData({ price: parseFloat(e.target.value) || 0 })}
                className={`pl-10 ${errors.price ? 'border-destructive' : ''}`}
                min="1"
                max="50000"
              />
            </div>
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Recommended price range: ₹299 - ₹2,999 for language courses
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Course Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Course Tags</CardTitle>
          <CardDescription>
            Add tags to help students find your course more easily
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {courseData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Add Custom Tag</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag(newTag)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addTag(newTag)}
                disabled={!newTag}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Common Tags</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.filter(tag => !courseData.tags.includes(tag)).map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => addTag(tag)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
          <CardDescription>
            What should students know before taking this course?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {courseData.prerequisites.map((prereq) => (
              <div key={prereq} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{prereq}</span>
                <X
                  className="h-4 w-4 cursor-pointer hover:text-destructive"
                  onClick={() => removePrerequisite(prereq)}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="e.g., Basic understanding of Devanagari script"
              value={newPrerequisite}
              onChange={(e) => setNewPrerequisite(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPrerequisite()}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addPrerequisite}
              disabled={!newPrerequisite}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Objectives *</CardTitle>
          <CardDescription>
            What will students be able to do after completing this course?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {courseData.learningObjectives.map((objective) => (
              <div key={objective} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{objective}</span>
                <X
                  className="h-4 w-4 cursor-pointer hover:text-destructive"
                  onClick={() => removeObjective(objective)}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="e.g., Construct basic sentences in Hindi"
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addObjective()}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addObjective}
              disabled={!newObjective}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {errors.objectives && (
            <p className="text-sm text-destructive">{errors.objectives}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}