# Course Access Control System

This directory contains the comprehensive access control system for the Hindustani Tongue LMS, implementing requirement 3.1 for content protection and enrollment verification.

## Overview

The access control system provides:

- **Course enrollment verification** for all lesson access
- **Sequential lesson unlocking** based on 80% completion rule
- **Clear error messaging** for unauthorized access attempts
- **Flexible configuration** for different access scenarios
- **React components** for easy integration

## Core Components

### 1. AccessControlService (`access-control.ts`)

The main service class that handles all access control logic.

```typescript
import { AccessControlService } from '@/lib/security/access-control'

// Check if user can access a course
const result = await AccessControlService.checkCourseAccess(userId, courseId)

// Check if user can access a specific lesson
const result = await AccessControlService.checkLessonAccess(userId, courseId, lessonId)

// Check if user can access enrollment page
const result = await AccessControlService.checkEnrollmentPageAccess(userId, courseId)
```

### 2. AccessDenied Component (`../components/AccessDenied.tsx`)

React component that displays appropriate error messages for different access denied scenarios.

```typescript
import AccessDenied from '@/components/AccessDenied'

<AccessDenied 
  result={accessCheckResult} 
  onRetry={() => checkAccessAgain()}
/>
```

### 3. AccessControlWrapper Component (`../components/AccessControlWrapper.tsx`)

Higher-order component that wraps content and automatically handles access control.

```typescript
import AccessControlWrapper from '@/components/AccessControlWrapper'

<AccessControlWrapper
  courseId="course-123"
  lessonId="lesson-456"
  requireEnrollment={true}
  checkSequentialUnlock={true}
>
  <YourProtectedContent />
</AccessControlWrapper>
```

## Usage Examples

### Basic Course Protection

```typescript
"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { checkCourseAccess } from '@/lib/security/access-control'
import AccessDenied from '@/components/AccessDenied'

export default function CoursePage({ courseId }: { courseId: string }) {
  const { user } = useAuth()
  const [accessResult, setAccessResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyAccess = async () => {
      const result = await checkCourseAccess(user?.uid || null, courseId)
      setAccessResult(result)
      setLoading(false)
    }
    
    verifyAccess()
  }, [user?.uid, courseId])

  if (loading) return <div>Loading...</div>
  
  if (!accessResult?.hasAccess) {
    return <AccessDenied result={accessResult} />
  }

  return <div>Your course content here</div>
}
```

### Lesson Protection with Sequential Unlocking

```typescript
"use client"

import AccessControlWrapper from '@/components/AccessControlWrapper'

export default function LessonPage({ courseId, lessonId }) {
  return (
    <AccessControlWrapper
      courseId={courseId}
      lessonId={lessonId}
      requireAuthentication={true}
      requireEnrollment={true}
      checkSequentialUnlock={true}
      allowPreviewLessons={true}
    >
      <div>
        <h1>Lesson Content</h1>
        <p>This content is only visible to enrolled users who have completed previous lessons.</p>
      </div>
    </AccessControlWrapper>
  )
}
```

### Using the Access Control Hook

```typescript
"use client"

import { useAccessControl } from '@/components/AccessControlWrapper'

export default function CourseNavigation({ courseId }) {
  const { getAccessibleLessons, checkLessonAccess } = useAccessControl(courseId)
  const [lessons, setLessons] = useState([])

  useEffect(() => {
    const loadLessons = async () => {
      const { lessons } = await getAccessibleLessons()
      setLessons(lessons)
    }
    loadLessons()
  }, [getAccessibleLessons])

  const handleLessonClick = async (lessonId) => {
    const access = await checkLessonAccess()
    if (access.hasAccess) {
      // Navigate to lesson
    } else {
      // Show access denied message
    }
  }

  return (
    <div>
      {lessons.map(lesson => (
        <button key={lesson.id} onClick={() => handleLessonClick(lesson.id)}>
          {lesson.title}
        </button>
      ))}
    </div>
  )
}
```

### Higher-Order Component Pattern

```typescript
import { withAccessControl } from '@/components/AccessControlWrapper'

const LessonComponent = ({ courseId, lessonId }) => {
  return <div>Protected lesson content</div>
}

// Wrap with access control
export default withAccessControl(LessonComponent, {
  courseId: (props) => props.courseId,
  lessonId: (props) => props.lessonId,
  requireEnrollment: true,
  checkSequentialUnlock: true
})
```

## Configuration Options

### AccessControlConfig

```typescript
interface AccessControlConfig {
  requireAuthentication: boolean    // Default: true
  requireEnrollment: boolean       // Default: true
  checkSequentialUnlock: boolean   // Default: true
  allowPreviewLessons: boolean     // Default: true
}
```

### Access Check Results

```typescript
interface AccessCheckResult {
  hasAccess: boolean
  reason?: AccessDeniedReason
  message?: string
  redirectTo?: string
  enrollmentRequired?: boolean
  courseId?: string
  lessonId?: string
}
```

### Access Denied Reasons

- `not_authenticated` - User needs to log in
- `not_enrolled` - User needs to enroll in course
- `payment_pending` - Payment is being processed
- `suspended` - User access is suspended
- `expired` - User access has expired
- `lesson_locked` - Lesson is locked
- `previous_lessons_incomplete` - Previous lessons not completed (80% rule)
- `course_not_found` - Course doesn't exist
- `lesson_not_found` - Lesson doesn't exist
- `verification_error` - System error during verification

## Middleware Integration

The system includes middleware for route-level protection:

```typescript
// middleware.ts automatically protects routes like:
// /learn/* - Requires authentication and enrollment verification
// /courses/*/enroll - Requires authentication
// /dashboard - Requires authentication
```

## Error Handling

The system provides comprehensive error handling:

1. **Network Errors**: Graceful fallback with retry options
2. **Firestore Errors**: Proper error logging and user feedback
3. **Invalid Data**: Validation and sanitization
4. **Rate Limiting**: Built-in protection against abuse

## Testing

Run the access control tests:

```bash
npx vitest run __tests__/access-control.test.ts
```

The test suite covers:
- Authentication scenarios
- Enrollment verification
- Sequential unlocking logic
- Error handling
- Edge cases

## Security Considerations

1. **Client-Side Validation**: All access checks are performed on the client but verified server-side
2. **Firestore Security Rules**: Database-level protection in `firestore.rules`
3. **Token Validation**: JWT tokens validated in middleware
4. **Rate Limiting**: Protection against brute force attempts
5. **Audit Logging**: All access attempts are logged for security monitoring

## Performance Optimization

1. **Caching**: Frequently accessed data is cached locally
2. **Batch Queries**: Multiple checks combined into single requests
3. **Lazy Loading**: Access checks only performed when needed
4. **Offline Support**: Local storage fallback for offline scenarios

## Integration with Existing Systems

### Course Service Integration

The access control system integrates seamlessly with the existing CourseService:

```typescript
// Automatically checks enrollment when fetching course data
const course = await CourseService.getCourse(courseId)
const accessResult = await AccessControlService.checkCourseAccess(userId, courseId)
```

### Progress Tracking Integration

Works with the progress tracking system to enforce the 80% completion rule:

```typescript
// Progress updates automatically trigger access recalculation
const progress = await ProgressService.updateLessonProgress(userId, courseId, lessonId, 85)
// Next lesson is automatically unlocked when 80% threshold is reached
```

### Payment Integration

Integrates with the payment system for enrollment verification:

```typescript
// After successful payment, access is automatically granted
await PaymentService.processPayment(paymentData)
await CourseService.enrollUser(userId, courseId, paymentId)
// User can now access course content
```

## Troubleshooting

### Common Issues

1. **Access Denied for Enrolled Users**
   - Check Firestore security rules
   - Verify enrollment status in database
   - Check for expired access

2. **Lessons Not Unlocking**
   - Verify 80% completion threshold
   - Check progress tracking implementation
   - Ensure sequential unlocking is enabled

3. **Performance Issues**
   - Enable caching for frequently accessed data
   - Optimize Firestore queries
   - Use batch operations where possible

### Debug Mode

Enable debug logging:

```typescript
// Set environment variable
NEXT_PUBLIC_ACCESS_CONTROL_DEBUG=true

// Or programmatically
AccessControlService.setDebugMode(true)
```

## Future Enhancements

1. **Role-Based Access Control**: Support for instructor/admin roles
2. **Time-Based Access**: Scheduled content release
3. **Geographic Restrictions**: Location-based access control
4. **Device Limits**: Concurrent session management
5. **Advanced Analytics**: Detailed access pattern analysis

## Support

For issues or questions about the access control system:

1. Check the test suite for usage examples
2. Review the error messages for specific guidance
3. Check Firestore security rules for database-level issues
4. Enable debug mode for detailed logging