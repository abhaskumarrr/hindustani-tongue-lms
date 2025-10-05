"use client"

import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface CourseThresholdSettingsProps {
  courseId: string
  currentThreshold: number
  onThresholdUpdate: (newThreshold: number) => void
}

export function CourseThresholdSettings({ 
  courseId, 
  currentThreshold, 
  onThresholdUpdate 
}: CourseThresholdSettingsProps) {
  const [threshold, setThreshold] = useState(currentThreshold)
  const [loading, setLoading] = useState(false)

  const updateThreshold = async () => {
    if (threshold < 1 || threshold > 100) {
      toast.error('Threshold must be between 1 and 100')
      return
    }

    try {
      setLoading(true)
      await updateDoc(doc(db, 'courses', courseId), {
        completionThreshold: threshold
      })
      onThresholdUpdate(threshold)
      toast.success('Completion threshold updated successfully')
    } catch (error) {
      console.error('Error updating threshold:', error)
      toast.error('Failed to update threshold')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion Threshold Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="threshold">Completion Threshold (%)</Label>
          <Input
            id="threshold"
            type="number"
            min="1"
            max="100"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-32"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Students must watch at least {threshold}% of each video to unlock the next lesson
          </p>
        </div>
        <Button onClick={updateThreshold} disabled={loading}>
          {loading ? 'Updating...' : 'Update Threshold'}
        </Button>
      </CardContent>
    </Card>
  )
}