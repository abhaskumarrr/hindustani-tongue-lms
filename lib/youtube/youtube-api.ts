// YouTube IFrame API integration for video progress tracking
// Implements the 80% completion rule for lesson unlocking

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface YouTubePlayerState {
  UNSTARTED: -1;
  ENDED: 0;
  PLAYING: 1;
  PAUSED: 2;
  BUFFERING: 3;
  CUED: 5;
}

export interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  getVolume(): number;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setPlaybackRate(suggestedRate: number): void;
  getPlaybackRate(): number;
  getAvailablePlaybackRates(): number[];
  addEventListener(event: string, listener: (event: any) => void): void;
  removeEventListener(event: string, listener: (event: any) => void): void;
  destroy(): void;
}

export interface YouTubePlayerOptions {
  height?: string | number;
  width?: string | number;
  videoId: string;
  playerVars?: {
    autoplay?: 0 | 1;
    cc_load_policy?: 0 | 1;
    color?: 'red' | 'white';
    controls?: 0 | 1;
    disablekb?: 0 | 1;
    enablejsapi?: 0 | 1;
    end?: number;
    fs?: 0 | 1;
    hl?: string;
    iv_load_policy?: 1 | 3;
    list?: string;
    listType?: 'playlist' | 'user_uploads';
    loop?: 0 | 1;
    modestbranding?: 0 | 1;
    origin?: string;
    playlist?: string;
    playsinline?: 0 | 1;
    rel?: 0 | 1;
    start?: number;
    widget_referrer?: string;
  };
  events?: {
    onReady?: (event: any) => void;
    onStateChange?: (event: any) => void;
    onPlaybackQualityChange?: (event: any) => void;
    onPlaybackRateChange?: (event: any) => void;
    onError?: (event: any) => void;
    onApiChange?: (event: any) => void;
  };
}

export interface VideoProgress {
  currentTime: number;
  duration: number;
  completionPercentage: number;
  isCompleted: boolean;
  watchedSeconds: number;
  totalSeconds: number;
  lastUpdated: Date;
}

export class YouTubeAPIError extends Error {
  constructor(
    message: string,
    public code?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'YouTubeAPIError';
  }
}

// YouTube API loading and initialization
export class YouTubeAPIManager {
  private static instance: YouTubeAPIManager;
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;
  private loadAttempts = 0;
  private readonly MAX_LOAD_ATTEMPTS = 3;

  static getInstance(): YouTubeAPIManager {
    if (!YouTubeAPIManager.instance) {
      YouTubeAPIManager.instance = new YouTubeAPIManager();
    }
    return YouTubeAPIManager.instance;
  }

  async loadAPI(): Promise<void> {
    if (this.isLoaded && window.YT && window.YT.Player) {
      return Promise.resolve();
    }

    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    this.loadAttempts++;
    
    if (this.loadAttempts > this.MAX_LOAD_ATTEMPTS) {
      console.error('Exceeded maximum YouTube API load attempts');
      return Promise.reject(new YouTubeAPIError('Failed to load YouTube API after multiple attempts'));
    }

    this.isLoading = true;
    this.loadPromise = new Promise((resolve, reject) => {
      try {
        // Check if API is already loaded
        if (window.YT && window.YT.Player) {
          this.isLoaded = true;
          this.isLoading = false;
          resolve();
          return;
        }

        // Set up the callback for when API is ready
        window.onYouTubeIframeAPIReady = () => {
          this.isLoaded = true;
          this.isLoading = false;
          resolve();
        };

        // Load the API script if not already present
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          const script = document.createElement('script');
          script.src = 'https://www.youtube.com/iframe_api';
          script.async = true;
          script.onerror = () => {
            this.isLoading = false;
            reject(new YouTubeAPIError('Failed to load YouTube IFrame API script'));
          };
          document.head.appendChild(script);
        }

        // Timeout after 10 seconds
        setTimeout(() => {
          if (!this.isLoaded) {
            this.isLoading = false;
            reject(new YouTubeAPIError('YouTube API loading timeout'));
          }
        }, 10000);
      } catch (error) {
        this.isLoading = false;
        reject(new YouTubeAPIError('Error loading YouTube API', undefined, error));
      }
    });

    return this.loadPromise;
  }

  isAPILoaded(): boolean {
    return this.isLoaded;
  }
  
  reset(): void {
    this.isLoaded = false;
    this.isLoading = false;
    this.loadPromise = null;
    this.loadAttempts = 0;
    
    // Remove any existing YouTube API scripts
    const scripts = document.querySelectorAll('script[src*="youtube.com/iframe_api"]');
    scripts.forEach(script => script.remove());
    
    // Clear the global YT object
    if (window.YT) {
      // @ts-ignore
      window.YT = undefined;
    }
    
    console.log('YouTube API manager has been reset');
  }
}

// YouTube Player wrapper with progress tracking
export class YouTubePlayerManager {
  private player: YouTubePlayer | null = null;
  private progressInterval: NodeJS.Timeout | null = null;
  private onProgressCallback: ((progress: VideoProgress) => void) | null = null;
  private onErrorCallback: ((error: YouTubeAPIError) => void) | null = null;
  private onReadyCallback: (() => void) | null = null;
  private containerId: string;
  private videoId: string;
  private startTime = 0;
  private readonly PROGRESS_INTERVAL = 30000; // 30 seconds as per requirements

  constructor(containerId: string, videoId: string) {
    // Validate inputs to prevent infinite loading
    if (!containerId) {
      throw new YouTubeAPIError('Container ID is required');
    }
    
    if (!videoId) {
      throw new YouTubeAPIError('Video ID is required');
    }
    
    this.containerId = containerId;
    this.videoId = videoId;
  }

  async initialize(options: Partial<YouTubePlayerOptions> = {}, onReady?: () => void): Promise<void> {
    this.onReadyCallback = onReady || null;
    try {
      const apiManager = YouTubeAPIManager.getInstance();
      await apiManager.loadAPI();

      // Check if videoId is valid
      if (!this.videoId || typeof this.videoId !== 'string' || this.videoId.trim() === '') {
        throw new YouTubeAPIError('Invalid YouTube video ID: ' + this.videoId);
      }

      // Check if container exists
      const container = document.getElementById(this.containerId);
      if (!container) {
        throw new YouTubeAPIError(`Container element with ID "${this.containerId}" not found`);
      }

      const defaultOptions: YouTubePlayerOptions = {
        height: '100%',
        width: '100%',
        videoId: this.videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
          playsinline: 1,
        },
        events: {
          onReady: this.onPlayerReady.bind(this),
          onStateChange: this.onPlayerStateChange.bind(this),
          onError: this.onPlayerError.bind(this),
        },
      };

      const finalOptions: YouTubePlayerOptions = {
        height: '100%',
        width: '100%',
        videoId: this.videoId,
        playerVars: {
          ...defaultOptions.playerVars,
          ...options.playerVars,
        },
        events: {
          onReady: this.onPlayerReady.bind(this),
          onStateChange: this.onPlayerStateChange.bind(this),
          onError: this.onPlayerError.bind(this),
        },
      };

      this.player = new window.YT.Player(this.containerId, finalOptions);
    } catch (error) {
      const ytError = new YouTubeAPIError(
        'Failed to initialize YouTube player',
        undefined,
        error
      );
      this.handleError(ytError);
      throw ytError;
    }
  }

  private onPlayerReady(event: any): void {
    console.log('YouTube player ready');
    // Set isReady flag and clear any loading timeouts
    if (this.onReadyCallback) {
      this.onReadyCallback();
    }
    
    // Ensure player is actually ready and has valid methods
    if (event.target && typeof event.target.playVideo === 'function') {
      // Initialize with saved progress if available
      this.trackProgress();
    } else {
      this.handleError(new YouTubeAPIError('Player ready event received but player is not properly initialized'));
    }
  }

  private onPlayerStateChange(event: any): void {
    const state = event.data;
    
    switch (state) {
      case window.YT.PlayerState.PLAYING:
        this.startProgressTracking();
        break;
      case window.YT.PlayerState.PAUSED:
      case window.YT.PlayerState.ENDED:
        this.stopProgressTracking();
        break;
      case window.YT.PlayerState.BUFFERING:
        // Continue tracking during buffering
        break;
    }
  }

  private onPlayerError(event: any): void {
    const errorCode = event.data;
    let errorMessage = 'Unknown YouTube player error';

    switch (errorCode) {
      case 2:
        errorMessage = 'Invalid video ID';
        break;
      case 5:
        errorMessage = 'HTML5 player error';
        break;
      case 100:
        errorMessage = 'Video not found or private';
        break;
      case 101:
      case 150:
        errorMessage = 'Video cannot be played in embedded players';
        break;
    }

    const error = new YouTubeAPIError(errorMessage, errorCode);
    this.handleError(error);
  }

  private startProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    // Track progress immediately when starting
    this.trackProgress();

    // Then track every 30 seconds
    this.progressInterval = setInterval(() => {
      this.trackProgress();
    }, this.PROGRESS_INTERVAL);
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    
    // Track final progress when stopping
    this.trackProgress();
  }

  private trackProgress(): void {
    if (!this.player) {
      console.warn('Cannot track progress: Player not initialized');
      return;
    }

    try {
      // Safely get current time and duration with fallbacks
      let currentTime = 0;
      let duration = 0;
      
      try {
        currentTime = typeof this.player.getCurrentTime === 'function' ? this.player.getCurrentTime() : 0;
      } catch (e) {
        console.warn('Error getting current time:', e);
      }
      
      try {
        duration = typeof this.player.getDuration === 'function' ? this.player.getDuration() : 0;
      } catch (e) {
        console.warn('Error getting duration:', e);
      }
      
      // Skip invalid data
      if (isNaN(currentTime) || isNaN(duration) || duration <= 0) {
        console.warn('Invalid video data:', { currentTime, duration });
        return;
      }

      const completionPercentage = Math.min(Math.round((currentTime / duration) * 100), 100);
      const isCompleted = completionPercentage >= 80; // 80% rule as per requirements

      const progress: VideoProgress = {
        currentTime,
        duration,
        completionPercentage,
        isCompleted,
        watchedSeconds: currentTime,
        totalSeconds: duration,
        lastUpdated: new Date(),
      };

      if (this.onProgressCallback) {
        this.onProgressCallback(progress);
      }
    } catch (error) {
      console.error('Error tracking progress:', error);
      // Don't throw here to prevent breaking the player
    }
  }

  private handleError(error: YouTubeAPIError): void {
    console.error('YouTube Player Error:', error);
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  // Public methods for controlling the player
  play(): void {
    if (this.player) {
      this.player.playVideo();
    }
  }

  pause(): void {
    if (this.player) {
      this.player.pauseVideo();
    }
  }

  seekTo(seconds: number): void {
    if (this.player) {
      this.player.seekTo(seconds, true);
    }
  }

  getCurrentTime(): number {
    return this.player ? this.player.getCurrentTime() : 0;
  }

  getDuration(): number {
    return this.player ? this.player.getDuration() : 0;
  }

  getVolume(): number {
    return this.player ? this.player.getVolume() : 0;
  }

  setVolume(volume: number): void {
    if (this.player) {
      this.player.setVolume(Math.max(0, Math.min(100, volume)));
    }
  }

  mute(): void {
    if (this.player) {
      this.player.mute();
    }
  }

  unmute(): void {
    if (this.player) {
      this.player.unMute();
    }
  }

  isMuted(): boolean {
    return this.player ? this.player.isMuted() : false;
  }

  setPlaybackRate(rate: number): void {
    if (this.player) {
      this.player.setPlaybackRate(rate);
    }
  }

  getPlaybackRate(): number {
    return this.player ? this.player.getPlaybackRate() : 1;
  }

  getAvailablePlaybackRates(): number[] {
    return this.player ? this.player.getAvailablePlaybackRates() : [1];
  }

  getPlayerState(): number {
    return this.player ? this.player.getPlayerState() : -1;
  }

  isPlaying(): boolean {
    return this.getPlayerState() === window.YT?.PlayerState?.PLAYING;
  }

  isPaused(): boolean {
    return this.getPlayerState() === window.YT?.PlayerState?.PAUSED;
  }

  // Event handlers
  onProgress(callback: (progress: VideoProgress) => void): void {
    this.onProgressCallback = callback;
  }

  onError(callback: (error: YouTubeAPIError) => void): void {
    this.onErrorCallback = callback;
  }

  // Cleanup
  destroy(): void {
    this.stopProgressTracking();
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    this.onProgressCallback = null;
    this.onErrorCallback = null;
  }
}

// Utility functions
export const extractVideoIdFromUrl = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

export const validateVideoId = (videoId: string): boolean => {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
};

export const generateThumbnailUrl = (videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): string => {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
};