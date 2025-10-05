# YouTube Progress Tracking System

This system implements the core 80% video completion rule for lesson unlocking in the Hindustani Tongue LMS.

## Features Implemented

### ✅ YouTube IFrame API Integration
- **File**: `lib/youtube/youtube-api.ts`
- **Features**:
  - YouTube API loading and initialization
  - Player state management
  - Error handling with custom error types
  - Player controls (play, pause, seek, volume, etc.)

### ✅ 30-Second Interval Progress Tracking
- **Implementation**: `YouTubePlayerManager.trackProgress()`
- **Interval**: Every 30 seconds as per requirements
- **Data Tracked**:
  - Current playback time
  - Video duration
  - Completion percentage
  - Watch time accumulation
  - Last updated timestamp

### ✅ 80% Completion Detection
- **Rule**: Lessons are marked complete when 80% watched
- **Implementation**: `progress.completionPercentage >= 80`
- **Triggers**: Next lesson unlock automatically

### ✅ Firestore Integration with Offline Backup
- **File**: `lib/services/progress-service.ts`
- **Features**:
  - Real-time progress saving to Firestore
  - Offline localStorage backup when Firestore fails
  - Automatic sync when connection restored
  - Retry logic with exponential backoff

### ✅ React Hook Integration
- **File**: `hooks/useVideoProgress.ts`
- **Features**:
  - Complete player state management
  - Progress callbacks
  - Error handling
  - Cleanup on unmount

### ✅ Lesson Unlocking System
- **File**: `hooks/useLessonUnlock.ts`
- **Features**:
  - 80% completion rule enforcement
  - Next lesson unlock logic
  - Progress persistence
  - Real-time unlock status

## Data Schema

### VideoProgress Interface
```typescript
interface VideoProgress {
  currentTime: number;        // Current playback position
  duration: number;           // Total video duration
  completionPercentage: number; // Calculated percentage
  isCompleted: boolean;       // True when >= 80%
  watchedSeconds: number;     // Total time watched
  totalSeconds: number;       // Video duration
  lastUpdated: Date;         // Timestamp
}
```

### Firestore Schema
```typescript
// Collection: userProgress/{userId}_{courseId}
interface UserProgress {
  userId: string;
  courseId: string;
  enrolledAt: Timestamp;
  lastAccessedAt: Timestamp;
  lessonProgress: Record<string, LessonProgress>;
  overallProgress: {
    completionPercentage: number;
    lessonsCompleted: string[];
    totalWatchTime: number;
  };
}

// Lesson progress within user progress
interface LessonProgress {
  watchedSeconds: number;
  totalSeconds: number;
  completionPercentage: number;
  isCompleted: boolean;        // True when >= 80%
  firstWatchedAt: Timestamp;
  lastWatchedAt: Timestamp;
  resumePosition: number;      // For resuming playback
}
```

## Usage Example

```typescript
// In a lesson component
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useLessonUnlock } from '@/hooks/useLessonUnlock';

const LessonComponent = () => {
  // Progress tracking
  const { progress, isReady, play, pause } = useVideoProgress({
    videoId: 'dQw4w9WgXcQ',
    courseId: 'hindi-fundamentals',
    lessonId: 'lesson-15',
    containerId: 'youtube-player',
    onProgressUpdate: (progress) => {
      console.log(`Progress: ${progress.completionPercentage}%`);
    },
    onCompletion: (progress) => {
      console.log('80% completion reached!');
    }
  });

  // Lesson unlocking
  const { isNextLessonUnlocked, unlockNextLesson } = useLessonUnlock({
    courseId: 'hindi-fundamentals',
    currentLessonId: 'lesson-15',
    nextLessonId: 'lesson-16'
  });

  return (
    <div>
      <div id="youtube-player" />
      <p>Progress: {progress?.completionPercentage}%</p>
      <button disabled={!isNextLessonUnlocked}>
        Next Lesson
      </button>
    </div>
  );
};
```

## Offline Support

The system includes robust offline support:

1. **Automatic Fallback**: When Firestore is unavailable, progress is stored in localStorage
2. **Sync on Reconnect**: Offline progress is automatically synced when connection is restored
3. **Retry Logic**: Failed sync attempts are retried with exponential backoff
4. **Data Integrity**: No progress is lost even during network interruptions

## Error Handling

- **YouTube API Errors**: Custom error types with specific error codes
- **Network Errors**: Graceful fallback to offline storage
- **Invalid Video IDs**: Clear error messages and recovery options
- **Permission Errors**: Proper error reporting for restricted videos

## Performance Optimizations

- **Efficient Updates**: Progress only saved every 30 seconds to minimize Firestore writes
- **Batch Operations**: Multiple progress updates batched together
- **Local Caching**: Frequently accessed data cached in memory
- **Lazy Loading**: YouTube API loaded only when needed

## Testing

The system includes comprehensive tests covering:
- Progress calculation accuracy
- 80% completion detection
- Offline storage functionality
- Lesson unlocking logic
- Error handling scenarios

## Requirements Satisfied

✅ **Requirement 2.1**: Progress tracking and lesson unlocking
- 30-second interval tracking implemented
- 80% completion rule enforced
- Next lesson unlock automation
- Firestore integration with offline backup
- Resume functionality for interrupted sessions

This implementation provides a robust, scalable video progress tracking system that meets all the specified requirements while providing excellent user experience and data reliability.