"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AccessControlService, AccessCheckResult } from '@/lib/security/access-control'
import AccessDenied from '@/components/AccessDenied'
import { Loader2 } from 'lucide-react'

interface AccessControlWrapperProps {
  children: React.ReactNode
  courseId?: string
  lessonId?: string
  requireEnrollment?: boolean
  requireAuthentication?: boolean
  checkSequentialUnlock?: boolean
  allowPreviewLessons?: boolean
  loadingComponent?: React.ReactNode
  onAccessGranted?: () => void
  onAccessDenied?: (result: AccessCheckResult) => void
}

/**
 * Wrapper component that handles access control for course content
 * 
 * This component automatically checks user permissions and shows appropriate
 * access denied messages or loading states while verification is in progress.
 */
export default function AccessControlWrapper({
  children,
  courseId,
  lessonId,
  requireEnrollment = true,
  requireAuthentication = true,
  checkSequentialUnlock = true,
  allowPreviewLessons = true,
  loadingComponent,
  onAccessGranted,
  onAccessDenied
}: AccessControlWrapperProps) {
  const { user, loading: authLoading } = useAuth()
  const [accessResult, setAccessResult] = useState<AccessCheckResult | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return

      setIsChecking(true)

      try {
        const config = {
          requireAuthentication,
          requireEnrollment,
          checkSequentialUnlock,
          allowPreviewLessons
        }

        let result: AccessCheckResult

        if (lessonId && courseId) {
          // Check lesson access
          result = await AccessControlService.checkLessonAccess(
            user?.uid || null,
            courseId,
            lessonId,
            config
          )
        } else if (courseId) {
          // Check course access
          result = await AccessControlService.checkCourseAccess(
            user?.uid || null,
            courseId,
            config
          )
        } else {
          // No specific access check needed
          result = { hasAccess: true }
        }

        setAccessResult(result)

        if (result.hasAccess) {
          onAccessGranted?.()
        } else {
          onAccessDenied?.(result)
        }
      } catch (error) {
        console.error('Access control error:', error)
        setAccessResult({
          hasAccess: false,
          reason: 'verification_error',
          message: 'Unable to verify access. Please try again.'
        })
      } finally {
        setIsChecking(false)
      }
    }

    checkAccess()
  }, [
    user?.uid,
    authLoading,
    courseId,
    lessonId,
    requireAuthentication,
    requireEnrollment,
    checkSequentialUnlock,
    allowPreviewLessons,
    onAccessGranted,
    onAccessDenied
  ])

  // Show loading state
  if (authLoading || isChecking) {
    return (
      loadingComponent || (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Verifying access...</p>
          </div>
        </div>
      )
    )
  }

  // Show access denied if no access
  if (!accessResult?.hasAccess) {
    return (
      <AccessDenied 
        result={accessResult!} 
        onRetry={() => {
          setIsChecking(true)
          // Trigger re-check by updating a dependency
          setAccessResult(null)
        }}
      />
    )
  }

  // Render children if access is granted
  return <>{children}</>
}

/**
 * Hook for programmatic access control checks
 */
export function useAccessControl(courseId?: string, lessonId?: string) {
  const { user } = useAuth()
  const [accessResult, setAccessResult] = useState<AccessCheckResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkAccess = async (config?: {
    requireAuthentication?: boolean
    requireEnrollment?: boolean
    checkSequentialUnlock?: boolean
    allowPreviewLessons?: boolean
  }) => {
    setIsChecking(true)

    try {
      let result: AccessCheckResult

      if (lessonId && courseId) {
        result = await AccessControlService.checkLessonAccess(
          user?.uid || null,
          courseId,
          lessonId,
          config
        )
      } else if (courseId) {
        result = await AccessControlService.checkCourseAccess(
          user?.uid || null,
          courseId,
          config
        )
      } else {
        result = { hasAccess: true }
      }

      setAccessResult(result)
      return result
    } catch (error) {
      console.error('Access control error:', error)
      const errorResult: AccessCheckResult = {
        hasAccess: false,
        reason: 'verification_error',
        message: 'Unable to verify access. Please try again.'
      }
      setAccessResult(errorResult)
      return errorResult
    } finally {
      setIsChecking(false)
    }
  }

  const checkCourseAccess = (config?: Parameters<typeof checkAccess>[0]) => {
    if (!courseId) {
      throw new Error('Course ID is required for course access check')
    }
    return AccessControlService.checkCourseAccess(user?.uid || null, courseId, config)
  }

  const checkLessonAccess = (config?: Parameters<typeof checkAccess>[0]) => {
    if (!courseId || !lessonId) {
      throw new Error('Course ID and Lesson ID are required for lesson access check')
    }
    return AccessControlService.checkLessonAccess(user?.uid || null, courseId, lessonId, config)
  }

  const checkEnrollmentPageAccess = () => {
    if (!courseId) {
      throw new Error('Course ID is required for enrollment page access check')
    }
    return AccessControlService.checkEnrollmentPageAccess(user?.uid || null, courseId)
  }

  const getUserEnrollmentStatus = () => {
    if (!courseId || !user?.uid) {
      throw new Error('Course ID and user authentication are required for enrollment status')
    }
    return AccessControlService.getUserEnrollmentStatus(user.uid, courseId)
  }

  const getAccessibleLessons = (config?: Parameters<typeof checkAccess>[0]) => {
    if (!courseId) {
      throw new Error('Course ID is required to get accessible lessons')
    }
    return AccessControlService.getAccessibleLessons(user?.uid || null, courseId, config)
  }

  return {
    accessResult,
    isChecking,
    checkAccess,
    checkCourseAccess,
    checkLessonAccess,
    checkEnrollmentPageAccess,
    getUserEnrollmentStatus,
    getAccessibleLessons
  }
}

/**
 * Higher-order component for protecting routes
 */
export function withAccessControl<P extends object>(
  Component: React.ComponentType<P>,
  accessConfig: {
    courseId?: string | ((props: P) => string)
    lessonId?: string | ((props: P) => string)
    requireEnrollment?: boolean
    requireAuthentication?: boolean
    checkSequentialUnlock?: boolean
    allowPreviewLessons?: boolean
  }
) {
  return function AccessControlledComponent(props: P) {
    const courseId = typeof accessConfig.courseId === 'function' 
      ? accessConfig.courseId(props) 
      : accessConfig.courseId

    const lessonId = typeof accessConfig.lessonId === 'function' 
      ? accessConfig.lessonId(props) 
      : accessConfig.lessonId

    return (
      <AccessControlWrapper
        courseId={courseId}
        lessonId={lessonId}
        requireEnrollment={accessConfig.requireEnrollment}
        requireAuthentication={accessConfig.requireAuthentication}
        checkSequentialUnlock={accessConfig.checkSequentialUnlock}
        allowPreviewLessons={accessConfig.allowPreviewLessons}
      >
        <Component {...props} />
      </AccessControlWrapper>
    )
  }
}