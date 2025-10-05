"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Award,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  Sparkles,
  Zap,
  Trophy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { ContinueLearningButton } from '@/components/ContinueLearningButton';

declare global {
  interface Window {
    Vimeo: any;
  }
}

export interface VideoProgress {
  currentTime: number;
  duration: number;
  completionPercentage: number;
  watchedSeconds: number;
}

export interface VimeoAPIError extends Error {
  code?: string;
}

export interface VimeoPlayerProps {
  videoId: string;
  courseId: string;
  lessonId: string;
  onProgressUpdate?: (progress: VideoProgress) => void;
  onCompletion?: (progress: VideoProgress) => void;
  onError?: (error: VimeoAPIError) => void;
  onDurationUpdate?: (duration: number) => void;
  autoplay?: boolean;
  className?: string;
  showProgress?: boolean;
  completionThreshold?: number;
  initialProgress?: number;
}

export const VimeoPlayer: React.FC<VimeoPlayerProps> = ({
  videoId,
  courseId,
  lessonId,
  onProgressUpdate,
  onCompletion,
  onError,
  onDurationUpdate,
  autoplay = false,
  className = "",
  showProgress = true,
  completionThreshold = 80,
  initialProgress = 0,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<VimeoAPIError | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState<VideoProgress>({
    currentTime: 0,
    duration: 0,
    completionPercentage: initialProgress,
    watchedSeconds: 0,
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationShownRef = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Build Vimeo iframe URL
  const getVimeoEmbedUrl = () => {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      autopause: '0',
      title: '0',
      byline: '0',
      portrait: '0',
      controls: '0',
      playsinline: '1',
      dnt: '1',
      quality: quality,
    });

    return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
  };

  // Load Vimeo Player script
  const loadVimeoScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Vimeo) {
        resolve();
        return;
      }

      const existingScript = document.querySelector('script[src="https://player.vimeo.com/api/player.js"]');
      
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Vimeo SDK')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Vimeo Player SDK'));
      document.head.appendChild(script);
    });
  };

  // Mouse move handler
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Initialize player
  useEffect(() => {
    mountedRef.current = true;
    let loadTimeout: NodeJS.Timeout;

    const initPlayer = async () => {
      try {
        if (!iframeRef.current) return;
        if (!window.Vimeo) await loadVimeoScript();

        playerRef.current = new window.Vimeo.Player(iframeRef.current);

        playerRef.current.ready().then(() => {
          if (!mountedRef.current) return;
          setIsReady(true);
          setIsLoading(false);

          playerRef.current.getDuration().then((duration: number) => {
            if (!mountedRef.current) return;
            setProgress(prev => ({ ...prev, duration }));
            onDurationUpdate?.(duration);

            if (initialProgress > 0) {
              const startTime = (initialProgress / 100) * duration;
              playerRef.current.setCurrentTime(startTime);
            }
          });

          playerRef.current.getVolume().then((vol: number) => {
            setVolume(vol * 100);
            setIsMuted(vol === 0);
          });
        }).catch((err: any) => {
          if (mountedRef.current) {
            setError(new Error('Failed to initialize player'));
            setIsLoading(false);
          }
        });

        playerRef.current.on('play', () => {
          if (!mountedRef.current) return;
          setIsPlaying(true);
        });

        playerRef.current.on('pause', () => {
          if (!mountedRef.current) return;
          setIsPlaying(false);
        });

        playerRef.current.on('timeupdate', (data: { seconds: number; duration: number }) => {
          if (!mountedRef.current) return;
          
          const completionPercentage = data.duration > 0 ? (data.seconds / data.duration) * 100 : 0;
          const progressData: VideoProgress = {
            currentTime: data.seconds,
            duration: data.duration,
            completionPercentage,
            watchedSeconds: data.seconds,
          };

          setProgress(progressData);
          onProgressUpdate?.(progressData);

          if (completionPercentage >= completionThreshold && !celebrationShownRef.current) {
            celebrationShownRef.current = true;
            setShowCelebration(true);
            onCompletion?.(progressData);
          }
        });

        playerRef.current.on('volumechange', (data: { volume: number }) => {
          if (!mountedRef.current) return;
          setVolume(data.volume * 100);
          setIsMuted(data.volume === 0);
        });

        playerRef.current.on('error', (error: any) => {
          if (!mountedRef.current) return;
          
          let errorMessage = 'Video playback error. ';
          if (error.name === 'PrivacyError') {
            errorMessage += 'This video is private or has domain restrictions.';
          } else if (error.name === 'PasswordError') {
            errorMessage += 'This video requires a password.';
          } else if (error.message) {
            errorMessage += error.message;
          }
          
          setError(new Error(errorMessage));
          setIsLoading(false);
          onError?.(error);
        });

        clearTimeout(loadTimeout);

      } catch (err: any) {
        if (mountedRef.current) {
          setError(err);
          setIsLoading(false);
        }
      }
    };

    loadTimeout = setTimeout(() => {
      if (mountedRef.current && isLoading && !isReady) {
        setIsLoading(false);
        setError(new Error('Video loading timeout'));
      }
    }, 15000);

    const initTimeout = setTimeout(() => initPlayer(), 500);

    return () => {
      mountedRef.current = false;
      clearTimeout(loadTimeout);
      clearTimeout(initTimeout);
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [videoId, retryCount]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setIsReady(false);
    celebrationShownRef.current = false;
    setRetryCount(prev => prev + 1);
  };

  const togglePlay = async () => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) await playerRef.current.pause();
      else await playerRef.current.play();
    } catch (err) {}
  };

  const handleVolumeChange = async (value: number[]) => {
    if (!playerRef.current) return;
    const newVolume = value[0];
    setVolume(newVolume);
    try {
      await playerRef.current.setVolume(newVolume / 100);
    } catch (err) {}
  };

  const toggleMute = async () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) await playerRef.current.setVolume(volume / 100);
      else await playerRef.current.setVolume(0);
    } catch (err) {}
  };

  const handleSeek = async (value: number[]) => {
    if (!playerRef.current || progress.duration === 0) return;
    const seekTime = (value[0] / 100) * progress.duration;
    try {
      await playerRef.current.setCurrentTime(seekTime);
    } catch (err) {}
  };

  const skip = async (seconds: number) => {
    if (!playerRef.current) return;
    try {
      const currentTime = await playerRef.current.getCurrentTime();
      await playerRef.current.setCurrentTime(currentTime + seconds);
    } catch (err) {}
  };

  const changePlaybackRate = async (rate: number) => {
    if (!playerRef.current) return;
    setPlaybackRate(rate);
    try {
      await playerRef.current.setPlaybackRate(rate);
    } catch (err) {}
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!isFullscreen) await containerRef.current.requestFullscreen();
      else await document.exitFullscreen();
    } catch (err) {}
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const closeCelebration = () => setShowCelebration(false);

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-4 h-4" />;
    if (volume < 50) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  // Error display
  if (error) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center p-6">
          <Alert className="max-w-lg border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription>
              <div className="font-medium mb-2 text-destructive">Video Error</div>
              <div className="text-sm text-muted-foreground mb-4">{error.message}</div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleRetry} className="bg-primary hover:bg-primary/90">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(`https://vimeo.com/${videoId}`, '_blank')}
                >
                  Open on Vimeo
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden border-2 border-primary/20 shadow-xl ${className}`}>
      <div 
        ref={containerRef}
        className="relative bg-gradient-to-br from-black via-gray-900 to-black aspect-video group"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-primary/30 rounded-tl-lg pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-secondary/30 rounded-tr-lg pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-secondary/30 rounded-bl-lg pointer-events-none z-10" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-primary/30 rounded-br-lg pointer-events-none z-10" />

        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-secondary/20 flex items-center justify-center z-30 backdrop-blur-sm">
            <div className="text-center text-white">
              <div className="relative mb-4">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                <Sparkles className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary animate-pulse" />
              </div>
              <div className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Loading your lesson...
              </div>
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          src={getVimeoEmbedUrl()}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo video player"
        />

        {/* Controls */}
        {isReady && (
          <div 
            className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

            {/* Center play */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="pointer-events-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-200 border-4 border-white/20 hover:border-white/40"
                >
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </button>
              </div>
            )}

            {/* Progress bar */}
            <div className="absolute bottom-20 left-0 right-0 px-6 pointer-events-auto">
              <div className="mb-2 flex items-center justify-between text-xs text-white/90 font-medium">
                <span className="bg-black/60 px-2 py-1 rounded backdrop-blur-sm">{formatTime(progress.currentTime)}</span>
                <span className="bg-black/60 px-2 py-1 rounded backdrop-blur-sm">{formatTime(progress.duration)}</span>
              </div>
              
              <div className="relative group/slider">
                {/* Threshold marker */}
                <div 
                  className="absolute -top-6 flex flex-col items-center"
                  style={{ left: `${completionThreshold}%`, transform: 'translateX(-50%)' }}
                >
                  <Zap className="w-3 h-3 text-secondary animate-pulse" fill="currentColor" />
                  <div className="text-[10px] font-bold text-secondary">{completionThreshold}%</div>
                </div>
                
                <Slider
                  value={[progress.duration > 0 ? (progress.currentTime / progress.duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="cursor-pointer [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-primary [&_[role=slider]]:to-secondary [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:shadow-lg"
                />
              </div>
            </div>

            {/* Control buttons */}
            <div className="absolute bottom-4 left-0 right-0 px-6 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full bg-black/50 backdrop-blur-sm border border-white/30 hover:border-primary"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skip(-10)}
                  className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full bg-black/40 backdrop-blur-sm border border-white/20"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skip(10)}
                  className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full bg-black/40 backdrop-blur-sm border border-white/20"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-2 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full bg-black/40 backdrop-blur-sm border border-white/20"
                  >
                    {getVolumeIcon()}
                  </Button>
                  <div className="w-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="[&_[role=slider]]:bg-white [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 text-xs text-white font-medium bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <Sparkles className="w-3 h-3 text-secondary" />
                  <span>{Math.round(progress.completionPercentage)}%</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 h-9 px-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 font-medium text-xs"
                    >
                      {playbackRate}x
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/95 backdrop-blur-lg border-white/30">
                    <DropdownMenuLabel className="text-white/70 text-xs">Speed</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <DropdownMenuItem
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`text-white hover:bg-primary/20 cursor-pointer ${
                          playbackRate === rate ? 'bg-primary/30 text-primary font-medium' : ''
                        }`}
                      >
                        {rate === 1 ? 'Normal' : `${rate}x`}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full bg-black/40 backdrop-blur-sm border border-white/20"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/95 backdrop-blur-lg border-white/30">
                    <DropdownMenuLabel className="text-white/70 text-xs">Quality</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {['auto', '1080p', '720p', '540p', '360p'].map((q) => (
                      <DropdownMenuItem
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`text-white hover:bg-primary/20 cursor-pointer ${
                          quality === q ? 'bg-primary/30 text-primary font-medium' : ''
                        }`}
                      >
                        {q === 'auto' ? 'Auto' : q}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full bg-black/40 backdrop-blur-sm border border-white/20"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Celebration */}
        {showCelebration && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-black/90 to-secondary/40 backdrop-blur-md flex items-center justify-center z-40 animate-in fade-in duration-500">
            <Card className="p-8 text-center max-w-sm mx-4 border-2 border-primary shadow-2xl bg-gradient-to-br from-card via-card to-secondary/10">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full animate-pulse" />
                <div className="absolute inset-2 bg-card rounded-full flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                Excellent Progress!
              </h3>
              <p className="text-muted-foreground mb-6">
                You've completed {completionThreshold}% of this lesson. The next lesson is now unlocked!
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={closeCelebration} className="flex-1">
                  Continue
                </Button>
                <ContinueLearningButton courseId={courseId} className="flex-1">
                  Next Lesson
                </ContinueLearningButton>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Progress Info */}
      {showProgress && progress && progress.duration > 0 && (
        <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground font-medium">Watch Progress</span>
            <span className="text-foreground font-semibold">
              {Math.round(progress.completionPercentage)}% complete
            </span>
          </div>
          <Progress value={progress.completionPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Start</span>
            <span className="flex items-center gap-1 text-secondary font-medium">
              <Zap className="w-3 h-3" />
              {completionThreshold}% to unlock
            </span>
            <span>Complete</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default VimeoPlayer;
