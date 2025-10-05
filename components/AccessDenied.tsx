"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Lock, 
  ShoppingCart, 
  AlertCircle, 
  Clock, 
  UserX, 
  FileX, 
  Home,
  ArrowLeft,
  CreditCard,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { ContinueLearningButton } from '@/components/ContinueLearningButton'
import { AccessCheckResult, AccessDeniedReason } from '@/lib/security/access-control'

interface AccessDeniedProps {
  result: AccessCheckResult
  showRetry?: boolean
  onRetry?: () => void
  className?: string
}

interface AccessDeniedConfig {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  variant: 'destructive' | 'warning' | 'secondary' | 'default'
  primaryAction?: {
    label: string
    href?: string
    onClick?: () => void
    variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

const ACCESS_DENIED_CONFIGS: Record<AccessDeniedReason, AccessDeniedConfig> = {
  not_authenticated: {
    icon: UserX,
    title: 'Authentication Required',
    description: 'You need to be logged in to access this content.',
    variant: 'warning',
    primaryAction: {
      label: 'Sign In',
      href: '/login',
      variant: 'default'
    },
    secondaryAction: {
      label: 'Create Account',
      href: '/signup'
    }
  },
  not_enrolled: {
    icon: ShoppingCart,
    title: 'Enrollment Required',
    description: 'You need to enroll in this course to access its content.',
    variant: 'secondary',
    primaryAction: {
      label: 'Enroll Now',
      variant: 'default'
    },
    secondaryAction: {
      label: 'View Course Details'
    }
  },
  payment_pending: {
    icon: CreditCard,
    title: 'Payment Processing',
    description: 'Your payment is being processed. This usually takes a few minutes.',
    variant: 'warning',
    primaryAction: {
      label: 'Check Payment Status',
      variant: 'outline'
    },
    secondaryAction: {
      label: 'Contact Support',
      href: '/support'
    }
  },
  suspended: {
    icon: AlertCircle,
    title: 'Access Suspended',
    description: 'Your access to this course has been temporarily suspended.',
    variant: 'destructive',
    primaryAction: {
      label: 'Contact Support',
      href: '/support',
      variant: 'destructive'
    },
    secondaryAction: {
      label: 'View My Courses',
      href: '/dashboard'
    }
  },
  expired: {
    icon: Clock,
    title: 'Access Expired',
    description: 'Your access to this course has expired. Renew to continue learning.',
    variant: 'warning',
    primaryAction: {
      label: 'Renew Access',
      variant: 'default'
    },
    secondaryAction: {
      label: 'View Other Courses',
      href: '/courses'
    }
  },
  lesson_locked: {
    icon: Lock,
    title: 'Lesson Locked',
    description: 'This lesson is currently locked. Complete previous lessons to unlock it.',
    variant: 'secondary',
    primaryAction: {
      label: 'View Course Progress',
      variant: 'outline'
    },
    secondaryAction: {
      label: 'Go to Current Lesson'
    }
  },
  previous_lessons_incomplete: {
    icon: BookOpen,
    title: 'Previous Lessons Required',
    description: 'Complete the previous lessons first. You need to watch 80% of each lesson to proceed.',
    variant: 'secondary',
    primaryAction: {
      label: 'Continue Learning',
      variant: 'default'
    },
    secondaryAction: {
      label: 'View Progress'
    }
  },
  course_not_found: {
    icon: FileX,
    title: 'Course Not Found',
    description: 'The requested course could not be found or may have been removed.',
    variant: 'destructive',
    primaryAction: {
      label: 'Browse Courses',
      href: '/courses',
      variant: 'default'
    },
    secondaryAction: {
      label: 'Go Home',
      href: '/'
    }
  },
  lesson_not_found: {
    icon: FileX,
    title: 'Lesson Not Found',
    description: 'The requested lesson could not be found in this course.',
    variant: 'destructive',
    primaryAction: {
      label: 'View Course',
      variant: 'default'
    },
    secondaryAction: {
      label: 'Browse Courses',
      href: '/courses'
    }
  },
  verification_error: {
    icon: AlertCircle,
    title: 'Verification Error',
    description: 'Unable to verify your access. Please try again or contact support if the problem persists.',
    variant: 'destructive',
    primaryAction: {
      label: 'Try Again',
      variant: 'outline'
    },
    secondaryAction: {
      label: 'Contact Support',
      href: '/support'
    }
  }
}

export default function AccessDenied({ 
  result, 
  showRetry = true, 
  onRetry,
  className = ""
}: AccessDeniedProps) {
  const config = ACCESS_DENIED_CONFIGS[result.reason || 'verification_error']
  const IconComponent = config.icon

  // Determine primary action href
  const getPrimaryActionHref = () => {
    if (config.primaryAction?.href) {
      return config.primaryAction.href
    }
    
    // Dynamic hrefs based on result data
    switch (result.reason) {
      case 'not_enrolled':
        return result.courseId ? `/courses/${result.courseId}/enroll` : '/courses'
      case 'payment_pending':
        return result.courseId ? `/courses/${result.courseId}` : '/dashboard'
      case 'expired':
        return result.courseId ? `/courses/${result.courseId}/enroll` : '/courses'
      case 'lesson_locked':
      case 'previous_lessons_incomplete':
        return result.courseId ? `/learn/${result.courseId}` : '/dashboard'
      case 'lesson_not_found':
        return result.courseId ? `/courses/${result.courseId}` : '/courses'
      default:
        return result.redirectTo || '/courses'
    }
  }

  // Determine secondary action href
  const getSecondaryActionHref = () => {
    if (config.secondaryAction?.href) {
      return config.secondaryAction.href
    }
    
    switch (result.reason) {
      case 'not_enrolled':
        return result.courseId ? `/courses/${result.courseId}` : '/courses'
      case 'lesson_locked':
      case 'previous_lessons_incomplete':
        return result.courseId ? `/learn/${result.courseId}` : '/dashboard'
      default:
        return '/courses'
    }
  }

  const handlePrimaryAction = () => {
    if (config.primaryAction?.onClick) {
      config.primaryAction.onClick()
    } else if (result.reason === 'verification_error' && onRetry) {
      onRetry()
    }
  }

  const primaryActionHref = getPrimaryActionHref()
  const secondaryActionHref = getSecondaryActionHref()

  return (
    <div className={`min-h-screen bg-background flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <IconComponent className={`w-8 h-8 ${
              config.variant === 'destructive' ? 'text-destructive' :
              config.variant === 'warning' ? 'text-orange-500' :
              config.variant === 'secondary' ? 'text-muted-foreground' :
              'text-primary'
            }`} />
          </div>
          <CardTitle className="text-xl">{config.title}</CardTitle>
          <CardDescription className="text-center">
            {result.message || config.description}
          </CardDescription>
          
          {/* Show additional context if available */}
          {result.courseId && (
            <div className="flex justify-center mt-2">
              <Badge variant="outline" className="text-xs">
                Course ID: {result.courseId}
              </Badge>
            </div>
          )}
          
          {result.lessonId && (
            <div className="flex justify-center mt-1">
              <Badge variant="outline" className="text-xs">
                Lesson ID: {result.lessonId}
              </Badge>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Primary Action */}
          {config.primaryAction && (
            <div>
              {result.reason === 'previous_lessons_incomplete' && result.courseId ? (
                <ContinueLearningButton courseId={result.courseId} className="w-full">
                  {config.primaryAction.label}
                </ContinueLearningButton>
              ) : config.primaryAction.onClick || result.reason === 'verification_error' ? (
                <Button
                  onClick={handlePrimaryAction}
                  variant={config.primaryAction.variant || 'default'}
                  className="w-full"
                  disabled={result.reason === 'verification_error' && !onRetry}
                >
                  {config.primaryAction.label}
                </Button>
              ) : (
                <Button asChild variant={config.primaryAction.variant || 'default'} className="w-full">
                  <Link href={primaryActionHref}>
                    {config.primaryAction.label}
                  </Link>
                </Button>
              )}
            </div>
          )}
          
          {/* Secondary Action */}
          {config.secondaryAction && (
            <div>
              {config.secondaryAction.onClick ? (
                <Button
                  onClick={config.secondaryAction.onClick}
                  variant="outline"
                  className="w-full"
                >
                  {config.secondaryAction.label}
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full">
                  <Link href={secondaryActionHref}>
                    {config.secondaryAction.label}
                  </Link>
                </Button>
              )}
            </div>
          )}
          
          {/* Retry Button */}
          {showRetry && onRetry && result.reason === 'verification_error' && (
            <Button
              onClick={onRetry}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {/* Always show a way to go back */}
          <div className="pt-2 border-t">
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/courses">
                <Home className="w-4 h-4 mr-2" />
                Browse All Courses
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Specialized components for common access denied scenarios
 */

interface CourseAccessDeniedProps {
  courseId: string
  reason?: AccessDeniedReason
  message?: string
  onRetry?: () => void
}

export function CourseAccessDenied({ 
  courseId, 
  reason = 'not_enrolled', 
  message,
  onRetry 
}: CourseAccessDeniedProps) {
  const result: AccessCheckResult = {
    hasAccess: false,
    reason,
    message,
    courseId,
    enrollmentRequired: reason === 'not_enrolled'
  }
  
  return <AccessDenied result={result} onRetry={onRetry} />
}

interface LessonAccessDeniedProps {
  courseId: string
  lessonId: string
  reason?: AccessDeniedReason
  message?: string
  onRetry?: () => void
}

export function LessonAccessDenied({ 
  courseId, 
  lessonId, 
  reason = 'lesson_locked', 
  message,
  onRetry 
}: LessonAccessDeniedProps) {
  const result: AccessCheckResult = {
    hasAccess: false,
    reason,
    message,
    courseId,
    lessonId,
    enrollmentRequired: reason === 'not_enrolled'
  }
  
  return <AccessDenied result={result} onRetry={onRetry} />
}

/**
 * Hook for handling access denied states
 */
export function useAccessDenied() {
  const [accessResult, setAccessResult] = React.useState<AccessCheckResult | null>(null)
  
  const showAccessDenied = (result: AccessCheckResult) => {
    setAccessResult(result)
  }
  
  const clearAccessDenied = () => {
    setAccessResult(null)
  }
  
  const AccessDeniedComponent = accessResult ? (
    <AccessDenied 
      result={accessResult} 
      onRetry={clearAccessDenied}
    />
  ) : null
  
  return {
    showAccessDenied,
    clearAccessDenied,
    AccessDeniedComponent,
    hasAccessDenied: !!accessResult
  }
}