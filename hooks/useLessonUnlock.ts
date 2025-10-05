import { useState, useEffect } from 'react';
import { ProgressService } from '@/lib/services/progress-service';
import { useAuth } from '@/contexts/AuthContext';

export interface UseLessonUnlockOptions {
  courseId: string;
  currentLessonId: string;
  nextLessonId?: string;
}

export interface UseLessonUnlockReturn {
  isCurrentLessonCompleted: boolean;
  isNextLessonUnlocked: boolean;
  checkUnlockStatus: () => Promise<void>;
  unlockNextLesson: () => Promise<void>;
}

export const useLessonUnlock = (options: UseLessonUnlockOptions): UseLessonUnlockReturn => {
  const { courseId, currentLessonId, nextLessonId } = options;
  const { user } = useAuth();
  
  const [isCurrentLessonCompleted, setIsCurrentLessonCompleted] = useState(false);
  const [isNextLessonUnlocked, setIsNextLessonUnlocked] = useState(false);

  const checkUnlockStatus = async () => {
    if (!user) return;

    try {
      // Check if current lesson is completed
      const currentCompleted = await ProgressService.checkLessonUnlock(
        user.uid,
        courseId,
        currentLessonId
      );
      setIsCurrentLessonCompleted(currentCompleted);

      // Check if next lesson is unlocked (if it exists)
      if (nextLessonId) {
        const nextUnlocked = await ProgressService.checkLessonUnlock(
          user.uid,
          courseId,
          nextLessonId
        );
        setIsNextLessonUnlocked(nextUnlocked || currentCompleted);
      }
    } catch (error) {
      console.error('Error checking unlock status:', error);
    }
  };

  const unlockNextLesson = async () => {
    if (!user || !nextLessonId) return;

    try {
      // Mark current lesson as completed
      await ProgressService.markLessonCompleted(user.uid, courseId, currentLessonId);
      
      // Update local state
      setIsCurrentLessonCompleted(true);
      setIsNextLessonUnlocked(true);
      
      console.log(`Next lesson ${nextLessonId} unlocked after completing ${currentLessonId}`);
    } catch (error) {
      console.error('Error unlocking next lesson:', error);
    }
  };

  // Check unlock status on mount and when dependencies change
  useEffect(() => {
    checkUnlockStatus();
  }, [user, courseId, currentLessonId, nextLessonId]);

  return {
    isCurrentLessonCompleted,
    isNextLessonUnlocked,
    checkUnlockStatus,
    unlockNextLesson,
  };
};