"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Award,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { ContinueLearningButton } from '@/components/ContinueLearningButton';
import { VideoProgress, YouTubeAPIError, YouTubeAPIManager } from '@/lib/youtube/youtube-api';

export interface YouTubePlayerProps {
  videoId: string;
  courseId: string;
  lessonId: string;
  onProgressUpdate?: (progress: VideoProgress) => void;
  onCompletion?: (progress: VideoProgress) => void;
  onError?: (error: YouTubeAPIError) => void;
  autoplay?: boolean;
  className?: string;
  showControls?: boolean;
  showProgress?: boolean;
  completionThreshold?: number;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  courseId,
  lessonId,
  onProgressUpdate,
  onCompletion,
  onError,
  autoplay = false,
  className = "",
  showControls = true,
  showProgress = true,
  completionThreshold = 80,
}) => {
  const playerContainerId = `youtube-player-${videoId}`;
  const [volume, setVolumeState] = useState(100);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const celebrationShownRef = useRef(false);

  // Set a timeout to detect if player gets stuck loading
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    isLoading,
    isReady,
    isPlaying,
    isPaused,
    error,
    progress,
    play,
    pause,
    seekTo,
    setVolume,
    mute,
    unmute,
    setPlaybackRate,
    getCurrentTime,
    getDuration,
    getVolume,
    isMuted,
    getPlaybackRate,
    getAvailablePlaybackRates,
    destroy,
  } = useVideoProgress({
    videoId,
    courseId,
    lessonId,
    containerId: playerContainerId,
    onProgressUpdate: (progressData) => {
      // Show celebration when reaching completion threshold
      if (progressData.completionPercentage >= completionThreshold && !celebrationShownRef.current) {
        celebrationShownRef.current = true;
        setShowCelebration(true);
      }
      
      if (onProgressUpdate) {
        onProgressUpdate(progressData);
      }
    },
    onCompletion,
    onError,
    autoplay,
    retryKey: loadAttempts,
  });

  // Loading timeout with limited retries
  useEffect(() => {
    if (!isLoading || isReady || error) return;

    const timeout = setTimeout(() => {
      if (loadAttempts < 3) {
        console.error(`YouTube player loading timeout - retry attempt ${loadAttempts + 1}`);
        YouTubeAPIManager.reset();
        destroy(); // Destroy current player instance
        setLoadAttempts(prev => prev + 1);
      } else {
        const timeoutError = new YouTubeAPIError('Failed to load YouTube player after 3 attempts');
        onError?.(timeoutError);
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [isLoading, isReady, error, loadAttempts, destroy, onError]);
  
  // Update local volume state when player volume changes
  useEffect(() => {
    if (isReady) {
      const currentVolume = getVolume();
      setVolumeState(currentVolume);
    }
  }, [isReady, getVolume]);

  // Update local playback rate state
  useEffect(() => {
    if (isReady) {
      const currentRate = getPlaybackRate();
      setPlaybackRateState(currentRate);
    }
  }, [isReady, getPlaybackRate]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleToggleMute = () => {
    if (isMuted()) {
      unmute();
    } else {
      mute();
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setVolumeState(newVolume);
  };

  const handleSeek = (percentage: number) => {
    const duration = getDuration();
    if (duration > 0) {
      const seekTime = (percentage / 100) * duration;
      seekTo(seekTime);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    setPlaybackRateState(rate);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const closeCelebration = () => {
    setShowCelebration(false);
  };

  // Error display
  if (error) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <div className="aspect-video bg-muted flex items-center justify-center">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-1">Video Error</div>
              <div className="text-sm text-muted-foreground">{error.message}</div>
              {error.code && (
                <div className="text-xs text-muted-foreground mt-1">
                  Error Code: {error.code}
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative bg-black aspect-video">
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <div className="text-sm">Loading video...</div>
            </div>
          </div>
        )}

        {/* YouTube Player Container */}
        <div
          id={playerContainerId}
          className="w-full h-full"
        />

        {/* Custom Controls Overlay */}
        {showControls && isReady && !isLoading && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            {showProgress && progress && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-white text-xs">
                    {formatTime(progress.currentTime)}
                  </span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(progress.currentTime / progress.duration) * 100 || 0}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${progress.completionPercentage}%, rgba(255,255,255,0.3) ${progress.completionPercentage}%, rgba(255,255,255,0.3) 100%)`,
                      }}
                    />
                    {/* Completion Threshold Marker */}
                    <div
                      className="absolute top-0 w-1 h-1 bg-secondary rounded-full transform -translate-y-0.5"
                      style={{ left: `${completionThreshold}%` }}
                    />
                  </div>
                  <span className="text-white text-xs">
                    {formatTime(progress.duration)}
                  </span>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTogglePlay}
                  className="text-white hover:bg-white/20"
                  disabled={!isReady}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleMute}
                    className="text-white hover:bg-white/20"
                    disabled={!isReady}
                  >
                    {isMuted() ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                    disabled={!isReady}
                  />
                </div>

                <div className="flex items-center space-x-1">
                  {getAvailablePlaybackRates().map((rate) => (
                    <Button
                      key={rate}
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlaybackRateChange(rate)}
                      className={`text-white hover:bg-white/20 text-xs px-2 py-1 ${
                        playbackRate === rate ? "bg-primary" : ""
                      }`}
                      disabled={!isReady}
                    >
                      {rate}x
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  disabled={!isReady}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  disabled={!isReady}
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Completion Celebration */}
        {showCelebration && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Card className="p-6 text-center max-w-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Great Progress!</h3>
              <p className="text-muted-foreground mb-4">
                You've completed {completionThreshold}% of this lesson. The next lesson is now unlocked!
              </p>
              <ContinueLearningButton courseId={courseId} className="w-full">
                Continue Learning
              </ContinueLearningButton>
            </Card>
          </div>
        )}
      </div>

      {/* Progress Info */}
      {showProgress && progress && (
        <div className="p-4 bg-card">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Watch Progress</span>
            <span className="text-foreground">
              {Math.round(progress.completionPercentage)}% complete
            </span>
          </div>
          <Progress value={progress.completionPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Start</span>
            <span className="text-secondary">{completionThreshold}% to unlock next</span>
            <span>Complete</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default YouTubePlayer;