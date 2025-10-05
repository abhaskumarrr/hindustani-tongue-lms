# Course Service Documentation

The CourseService provides comprehensive course data management with Firestore integration, lesson fetching, course structure management, enrollment verification, and course progress calculation and tracking.

## Features

### Core Course Management
- **Course Data Retrieval**: Get single courses or paginated course lists with filtering
- **Lesson Management**: Fetch lessons, navigate between lessons, manage lesson order
- **Module Support**: Handle course modules and hierarchical content structure
- **Caching**: Built-in caching for improved performance

### Access Control & Enrollment
- **Enrollment Verification**: Check if users are enrolled in courses
- **Access Control**: Verify course and lesson access with detailed reasons
- **Sequential Unlocking**: Implement 80% completion rule for lesson progression
- **Preview Lessons**: Support for free preview content

### Progress Tracking
- **Course Progress**: Calculate overall course completion and statistics
- **Module Progress**: Track progress within course modules
- **Lesson Completion**: Handle lesson completion and unlocking logic
- **Analytics**: Generate course statistics and performance metrics

### Integration Features
- **Offline Support**: Works with ProgressService for offline progress sync
- **Batch Operations**: Efficient batch updates for performance
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Type Safety**: Full TypeScript support with detailed interfaces

## Quick Start

```typescript
import { CourseService } from '@/lib/services/course-service'

// Get a course with full details
const course = await CourseService.getCourse('course-id')

// Check if user can access a lesson
const access = await CourseService.verifyLessonAccess('user-id', 'course-id', 'lesson-id')

// Calculate user's progress in a course
const progress = await CourseService.calculateCourseProgress('user-id', 'course-id')

// Get navigation data for course UI
const navigation = await CourseService.getCourseNavigation('user-id', 'course-id')
```

## API Reference

### Course Data Management

#### `getCourse(courseId: string): Promise<Course | null>`
Retrieves a single course with full details including lessons and modules.

#### `getCourses(options): Promise<{ courses: Course[], lastDoc?: QueryDocumentSnapshot }>`
Retrieves multiple courses with filtering and pagination support.

Options:
- `status`: Filter by course status ('draft' | 'published' | 'archived')
- `instructorId`: Filter by instructor
- `language`: Filter by language
- `level`: Filter by difficulty level
- `limit`: Number of courses to return (default: 20)
- `orderBy`: Sort field ('createdAt' | 'rating' | 'enrollmentCount' | 'title')
- `orderDirection`: Sort direction ('asc' | 'desc')

### Lesson Management

#### `getCourseLessons(courseId: string): Promise<Lesson[]>`
Gets all lessons for a course in order.

#### `getLesson(courseId: string, lessonId: string): Promise<Lesson | null>`
Gets a specific lesson by ID.

#### `getNextLesson(courseId: string, currentLessonId: string): Promise<Lesson | null>`
Gets the next lesson in sequence.

#### `getPreviousLesson(courseId: string, currentLessonId: string): Promise<Lesson | null>`
Gets the previous lesson in sequence.

### Access Control

#### `isUserEnrolled(userId: string, courseId: string): Promise<boolean>`
Checks if a user is enrolled in a course.

#### `verifyCourseAccess(userId: string, courseId: string): Promise<AccessControlResult>`
Verifies course access with detailed reason if access is denied.

#### `verifyLessonAccess(userId: string, courseId: string, lessonId: string): Promise<{ hasAccess: boolean, reason?: string }>`
Verifies lesson access based on enrollment and sequential unlock rules.

### Enrollment Management

#### `enrollUser(userId: string, courseId: string, paymentId?: string): Promise<CourseEnrollment>`
Enrolls a user in a course and updates enrollment count.

#### `initializeCourseProgress(userId: string, courseId: string): Promise<void>`
Initializes progress tracking for a newly enrolled user.

### Progress Tracking

#### `calculateCourseProgress(userId: string, courseId: string): Promise<CourseProgress>`
Calculates comprehensive course progress including completion percentage and current lesson.

#### `getModuleProgress(userId: string, courseId: string): Promise<ModuleProgress[]>`
Gets progress for each module in a course.

#### `updateLessonCompletion(userId: string, courseId: string, lessonId: string, completionPercentage: number): Promise<{ lessonCompleted: boolean, nextLessonUnlocked?: string }>`
Updates lesson completion status and determines if next lesson should be unlocked.

### Navigation & UI Support

#### `getCourseNavigation(userId: string, courseId: string): Promise<NavigationData | null>`
Gets comprehensive navigation data for course UI including accessible lessons, progress, and current position.

#### `getAccessibleLessons(userId: string, courseId: string): Promise<Lesson[]>`
Gets all lessons that are currently accessible to the user based on enrollment and progress.

### Analytics & Statistics

#### `getCourseStatistics(courseId: string): Promise<CourseStats>`
Gets comprehensive course statistics including enrollment count, completion rate, and revenue.

#### `getRecommendedCourses(userId: string, limit?: number): Promise<Course[]>`
Gets personalized course recommendations based on user's learning history.

### Utility Functions

#### `searchCourses(searchParams): Promise<Course[]>`
Searches courses with text and filter-based criteria.

#### `getUserEnrolledCourses(userId: string): Promise<Array<Course & { progress: CourseProgress }>>`
Gets all courses a user is enrolled in with their progress.

#### `getCachedCourse(courseId: string): Promise<Course | null>`
Gets a course with caching for improved performance.

#### `clearCourseCache(courseId?: string): void`
Clears course cache for specific course or all courses.

## Integration Examples

See `course-integration-example.ts` for complete examples of:
- Loading lesson page data
- Handling course enrollment
- Video progress updates with lesson unlocking
- Dashboard data loading
- Course browsing with enrollment status
- Instructor analytics
- Offline sync management

## Error Handling

All methods include comprehensive error handling:
- Firestore connection errors
- Invalid course/lesson IDs
- Access control violations
- Data validation errors

Errors are logged and re-thrown with descriptive messages for debugging.

## Performance Considerations

- **Caching**: Course data is cached for 5 minutes to reduce Firestore reads
- **Batch Operations**: Use batch operations for multiple updates
- **Pagination**: Large course lists support pagination
- **Offline Support**: Integrates with ProgressService for offline functionality

## Requirements Satisfied

This service satisfies the following spec requirements:

**Requirement 2.2** - Course navigation and progress indicators:
- ✅ Structured course curriculum with progress tracking
- ✅ Real-time progress updates and completion status
- ✅ Module and lesson navigation with unlock states

**Requirement 3.1** - Content protection and enrollment verification:
- ✅ Enrollment verification for all course access
- ✅ Sequential lesson unlocking based on 80% completion
- ✅ Access control with detailed error messaging
- ✅ Preview lesson support for non-enrolled users