"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Play, 
  Clock, 
  Eye, 
  EyeOff,
  Youtube,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Lesson } from '@/lib/services/course-service'
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

interface LessonManagerProps {
  lessons: Lesson[]
  updateLessons: (lessons: Lesson[]) => void
  onComplete: () => void
}

interface LessonFormData {
  title: string
  description: string
  youtubeVideoId: string
  isPreview: boolean
  learningObjectives: string[]
}

const YOUTUBE_URL_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/

export function LessonManager({ lessons, updateLessons, onComplete }: LessonManagerProps) {
  const [editingLesson, setEditingLesson] = useState<number | null>(null)
  const [lessonForm, setLessonForm] = useState<LessonFormData>({
    title: '',
    description: '',
    youtubeVideoId: '',
    isPreview: false,
    learningObjectives: []
  })
  const [newObjective, setNewObjective] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [validatingVideo, setValidatingVideo] = useState(false)

  useEffect(() => {
    if (lessons.length >= 3) {
      onComplete()
    }
  }, [lessons, onComplete])

  const extractVideoId = (url: string): string | null => {
    const match = url.match(YOUTUBE_URL_REGEX)
    return match ? match[1] : null
  }

  const validateYouTubeUrl = async (url: string): Promise<boolean> => {
    const videoId = extractVideoId(url)
    if (!videoId) return false

    setValidatingVideo(true)
    try {
      // Check if video exists by trying to load thumbnail
      const response = await fetch(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`)
      setValidatingVideo(false)
      return response.ok
    } catch {
      setValidatingVideo(false)
      return false
    }
  }

  const handleYouTubeUrlChange = async (url: string) => {
    setYoutubeUrl(url)
    setUrlError('')

    if (!url) {
      setLessonForm(prev => ({ ...prev, youtubeVideoId: '' }))
      return
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      setUrlError('Please enter a valid YouTube URL')
      setLessonForm(prev => ({ ...prev, youtubeVideoId: '' }))
      return
    }

    const isValid = await validateYouTubeUrl(url)
    if (isValid) {
      setLessonForm(prev => ({ ...prev, youtubeVideoId: videoId }))
    } else {
      setUrlError('Video not found or not accessible. Please check the URL.')
      setLessonForm(prev => ({ ...prev, youtubeVideoId: '' }))
    }
  }

  const addObjective = () => {
    if (newObjective && !lessonForm.learningObjectives.includes(newObjective)) {
      setLessonForm(prev => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, newObjective]
      }))
    }
    setNewObjective('')
  }

  const removeObjective = (objToRemove: string) => {
    setLessonForm(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter(obj => obj !== objToRemove)
    }))
  }

  const startNewLesson = () => {
    setEditingLesson(-1) // -1 indicates new lesson
    setLessonForm({
      title: '',
      description: '',
      youtubeVideoId: '',
      isPreview: false,
      learningObjectives: []
    })
    setYoutubeUrl('')
    setUrlError('')
  }

  const editLesson = (index: number) => {
    const lesson = lessons[index]
    setEditingLesson(index)
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      youtubeVideoId: lesson.youtubeVideoId,
      isPreview: lesson.isPreview,
      learningObjectives: lesson.learningObjectives
    })
    setYoutubeUrl(`https://www.youtube.com/watch?v=${lesson.youtubeVideoId}`)
    setUrlError('')
  }

  const saveLesson = () => {
    if (!lessonForm.title || !lessonForm.youtubeVideoId) return

    const newLesson: Lesson = {
      id: editingLesson === -1 ? `lesson-${Date.now()}` : lessons[editingLesson!].id,
      title: lessonForm.title,
      description: lessonForm.description,
      youtubeVideoId: lessonForm.youtubeVideoId,
      duration: 0, // Will be populated later when video metadata is fetched
      order: editingLesson === -1 ? lessons.length : lessons[editingLesson!].order,
      isPreview: lessonForm.isPreview,
      learningObjectives: lessonForm.learningObjectives
    }

    if (editingLesson === -1) {
      updateLessons([...lessons, newLesson])
    } else {
      const updatedLessons = [...lessons]
      updatedLessons[editingLesson!] = newLesson
      updateLessons(updatedLessons)
    }

    cancelEdit()
  }

  const cancelEdit = () => {
    setEditingLesson(null)
    setLessonForm({
      title: '',
      description: '',
      youtubeVideoId: '',
      isPreview: false,
      learningObjectives: []
    })
    setYoutubeUrl('')
    setUrlError('')
  }

  const deleteLesson = (index: number) => {
    const updatedLessons = lessons.filter((_, i) => i !== index)
    // Reorder lessons
    const reorderedLessons = updatedLessons.map((lesson, i) => ({
      ...lesson,
      order: i
    }))
    updateLessons(reorderedLessons)
  }

  const moveLesson = (fromIndex: number, toIndex: number) => {
    const items = Array.from(lessons)
    const [reorderedItem] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, reorderedItem)

    // Update order property
    const reorderedLessons = items.map((lesson, index) => ({
      ...lesson,
      order: index
    }))

    updateLessons(reorderedLessons)
  }

  const canSaveLesson = lessonForm.title.trim() && lessonForm.youtubeVideoId && !urlError

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Course Lessons
          </CardTitle>
          <CardDescription>
            Add and organize your course lessons. You need at least 3 lessons to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} added
              </span>
              {lessons.length >= 3 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Minimum met
                </Badge>
              )}
            </div>
            <Button onClick={startNewLesson} disabled={editingLesson !== null}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </div>

          {lessons.length === 0 && editingLesson === null && (
            <div className="text-center py-8 text-muted-foreground">
              <Youtube className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No lessons added yet. Click "Add Lesson" to get started.</p>
            </div>
          )}

          {/* Lesson List */}
          {lessons.length > 0 && (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <Card key={lesson.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => index > 0 && moveLesson(index, index - 1)}
                          disabled={index === 0 || editingLesson !== null}
                          className="h-6 w-6 p-0"
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => index < lessons.length - 1 && moveLesson(index, index + 1)}
                          disabled={index === lessons.length - 1 || editingLesson !== null}
                          className="h-6 w-6 p-0"
                        >
                          ↓
                        </Button>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{lesson.title}</h4>
                          {lesson.isPreview && (
                            <Badge variant="outline" className="text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {lesson.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Youtube className="h-3 w-3" />
                            {lesson.youtubeVideoId}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Order: {lesson.order + 1}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editLesson(index)}
                          disabled={editingLesson !== null}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteLesson(index)}
                          disabled={editingLesson !== null}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lesson Form */}
      {editingLesson !== null && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingLesson === -1 ? 'Add New Lesson' : 'Edit Lesson'}
            </CardTitle>
            <CardDescription>
              Fill in the lesson details and provide a YouTube video URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lesson Title */}
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Lesson Title *</Label>
              <Input
                id="lesson-title"
                placeholder="e.g., Introduction to Hindi Vowels"
                value={lessonForm.title}
                onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Lesson Description */}
            <div className="space-y-2">
              <Label htmlFor="lesson-description">Lesson Description</Label>
              <Textarea
                id="lesson-description"
                placeholder="Describe what students will learn in this lesson..."
                value={lessonForm.description}
                onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

            {/* YouTube URL */}
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube Video URL *</Label>
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                className={urlError ? 'border-destructive' : ''}
              />
              {urlError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {urlError}
                </div>
              )}
              {validatingVideo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Validating video...
                </div>
              )}
              {lessonForm.youtubeVideoId && !urlError && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Video validated successfully
                </div>
              )}
            </div>

            {/* Preview Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-preview"
                checked={lessonForm.isPreview}
                onChange={(e) => setLessonForm(prev => ({ ...prev, isPreview: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is-preview" className="flex items-center gap-2">
                {lessonForm.isPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Make this a free preview lesson
              </Label>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-2">
              <Label>Learning Objectives</Label>
              <div className="space-y-2">
                {lessonForm.learningObjectives.map((objective) => (
                  <div key={objective} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{objective}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeObjective(objective)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Identify all Hindi vowels"
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
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button onClick={saveLesson} disabled={!canSaveLesson}>
                {editingLesson === -1 ? 'Add Lesson' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Minimum Lessons Warning */}
      {lessons.length < 3 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                You need at least 3 lessons to proceed to the next step. 
                Currently you have {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}