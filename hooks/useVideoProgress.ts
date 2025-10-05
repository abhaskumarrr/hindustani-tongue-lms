import { useState, useEffect, useCallback, useRef } from 'react';
import { YouTubePlayerManager, VideoProgress, YouTubeAPIError } from '@/lib/youtube/youtube-api';
import { ProgressService } from '@/lib/services/progress-service';
import { useAuth } from '@/contexts/AuthContext';

export interface UseVideoProgressOptions {
  videoId: string;
  containerId: string;
  courseId: string;
  lessonId: string;
  onProgressUpdate?: (progress: VideoProgress) => void;
  onCompletion?: (progress: VideoProgress) => void;
  onError?: (error: YouTubeAPIError) => void;
  autoplay?: boolean;
}

export interface UseVideoProgressReturn {
  // Player state
  isLoading: boolean;
  isReady: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  error: YouTubeAPIError | null;
  
  // Progress data
  progress: VideoProgress | null;
  
  // Player controls
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  setPlaybackRate: (rate: number) => void;
  
  // Player info
  getCurrentTime: () => number;
  getDuration: () => number;
  getVolume: () => number;
  isMuted: () => boolean;
  getPlaybackRate: () => number;
  getAvailablePlaybackRates: () => number[];
  
  // Cleanup
  destroy: () => void;
}

export const useVideoProgress = (options: UseVideoProgressOptions): UseVideoProgressReturn => {
  const {
    videoId,
    containerId,
    courseId,
    lessonId,
    onProgressUpdate,
    onCompletion,
    onError,
    autoplay = false,
  } = options;

  const { user } = useAuth();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<YouTubeAPIError | null>(null);
  const [progress, setProgress] = useState<VideoProgress | null>(null);

  // Refs
  const playerManagerRef = useRef<YouTubePlayerManager | null>(null);
  const lastCompletionRef = useRef(false);
  const progressLoadedRef = useRef(false);

  // Initialize player
  useEffect(() => {
    let isMounted = true;

    const initializePlayer = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create player manager
        const playerManager = new YouTubePlayerManager(containerId, videoId);
        playerManagerRef.current = playerManager;

        // Set up progress tracking
        playerManager.onProgress(async (progressData: VideoProgress) => {
          if (!isMounted) return;

          setProgress(progressData);
          
          // Save progress to Firestore with offline backup
          if (user) {
            try {
              await ProgressService.saveVideoProgress(
                user.uid,
                courseId,
                lessonId,
                progressData
              );
            } catch (error) {
              console.warn('Failed to save progress:', error);
            }
          }
          
          // Call progress update callback
          if (onProgressUpdate) {
            onProgressUpdate(progressData);
          }

          // Check for completion (80% rule)
          if (progressData.isCompleted && !lastCompletionRef.current) {
            lastCompletionRef.current = true;
            
            // Mark lesson as completed in Firestore
            if (user) {
              try {
                await ProgressService.markLessonCompleted(user.uid, courseId, lessonId);
              } catch (error) {
                console.warn('Failed to mark lesson as completed:', error);
              }
            }
            
            if (onCompletion) {
              onCompletion(progressData);
            }
          }
        });

        // Set up error handling
        playerManager.onError((playerError: YouTubeAPIError) => {
          if (!isMounted) return;
          
          setError(playerError);
          if (onError) {
            onError(playerError);
          }
        });

        // Initialize the player
        await playerManager.initialize(
          {
            playerVars: {
              autoplay: autoplay ? 1 : 0,
            },
          },
          () => {
            if (isMounted) {
              setIsReady(true);
              setIsLoading(false);
            }
          }
        );
      } catch (err) {
        if (isMounted) {
          const playerError = err instanceof YouTubeAPIError 
            ? err 
            : new YouTubeAPIError('Failed to initialize video player', undefined, err);
          
          setError(playerError);
          setIsLoading(false);
          
          if (onError) {
            onError(playerError);
          }
        }
      }
    };

    initializePlayer();

    return () => {
      isMounted = false;
      if (playerManagerRef.current) {
        playerManagerRef.current.destroy();
        playerManagerRef.current = null;
      }
    };
  }, [videoId, containerId, courseId, lessonId, autoplay, onProgressUpdate, onCompletion, onError, user]);

  // Update playing state based on player state
  useEffect(() => {
    if (!playerManagerRef.current || !isReady) return;

    const checkPlayerState = () => {
      const manager = playerManagerRef.current;
      if (manager) {
        setIsPlaying(manager.isPlaying());
        setIsPaused(manager.isPaused());
      }
    };

    // Check state periodically
    const stateInterval = setInterval(checkPlayerState, 1000);

    return () => {
      clearInterval(stateInterval);
    };
  }, [isReady]);

  // Load existing progress and initialize offline sync
  useEffect(() => {
    if (!user || !isReady || progressLoadedRef.current) return;

    const loadExistingProgress = async () => {
      try {
        // Initialize offline sync
        await ProgressService.initializeOfflineSync(user.uid);

        // Load existing lesson progress
        const lessonProgress = await ProgressService.getLessonProgress(
          user.uid,
          courseId,
          lessonId
        );

        if (lessonProgress && playerManagerRef.current) {
          // Resume from last position if available
          if (lessonProgress.resumePosition > 0) {
            playerManagerRef.current.seekTo(lessonProgress.resumePosition);
          }

          // Set completion status
          if (lessonProgress.isCompleted) {
            lastCompletionRef.current = true;
          }

          // Update progress state
          const resumeProgress: VideoProgress = {
            currentTime: lessonProgress.resumePosition,
            duration: lessonProgress.totalSeconds,
            completionPercentage: lessonProgress.completionPercentage,
            isCompleted: lessonProgress.isCompleted,
            watchedSeconds: lessonProgress.watchedSeconds,
            totalSeconds: lessonProgress.totalSeconds,
            lastUpdated: new Date(),
          };

          setProgress(resumeProgress);
        }

        progressLoadedRef.current = true;
      } catch (error) {
        console.warn('Failed to load existing progress:', error);
      }
    };

    loadExistingProgress();
  }, [user, isReady, courseId, lessonId]);

  // Player control functions
  const play = useCallback(() => {
    if (playerManagerRef.current) {
      playerManagerRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (playerManagerRef.current) {
      playerManagerRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (playerManagerRef.current) {
      playerManagerRef.current.seekTo(seconds);
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (playerManagerRef.current) {
      playerManagerRef.current.setVolume(volume);
    }
  }, []);

  const mute = useCallback(() => {
    if (playerManagerRef.current) {
      playerManagerRef.current.mute();
    }
  }, []);

  const unmute = useCallback(() => {
    if (playerManagerRef.current) {
      playerManagerRef.current.unmute();
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (playerManagerRef.current) {
      playerManagerRef.current.setPlaybackRate(rate);
    }
  }, []);

  // Player info functions
  const getCurrentTime = useCallback((): number => {
    return playerManagerRef.current ? playerManagerRef.current.getCurrentTime() : 0;
  }, []);

  const getDuration = useCallback((): number => {
    return playerManagerRef.current ? playerManagerRef.current.getDuration() : 0;
  }, []);

  const getVolume = useCallback((): number => {
    return playerManagerRef.current ? playerManagerRef.current.getVolume() : 0;
  }, []);

  const isMuted = useCallback((): boolean => {
    return playerManagerRef.current ? playerManagerRef.current.isMuted() : false;
  }, []);

  const getPlaybackRate = useCallback((): number => {
    return playerManagerRef.current ? playerManagerRef.current.getPlaybackRate() : 1;
  }, []);

  const getAvailablePlaybackRates = useCallback((): number[] => {
    return playerManagerRef.current ? playerManagerRef.current.getAvailablePlaybackRates() : [1];
  }, []);

  const destroy = useCallback(() => {
    if (playerManagerRef.current) {
      playerManagerRef.current.destroy();
      playerManagerRef.current = null;
    }
    setIsReady(false);
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    // Player state
    isLoading,
    isReady,
    isPlaying,
    isPaused,
    error,
    
    // Progress data
    progress,
    
    // Player controls
    play,
    pause,
    seekTo,
    setVolume,
    mute,
    unmute,
    setPlaybackRate,
    
    // Player info
    getCurrentTime,
    getDuration,
    getVolume,
    isMuted,
    getPlaybackRate,
    getAvailablePlaybackRates,
    
    // Cleanup
    destroy,
  };
};