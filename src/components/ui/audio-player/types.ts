
import { RefObject } from 'react';

export interface AudioPlaybackState {
  isPlaying: boolean;
  playbackSpeed: number;
  volume: number;
  loop: boolean;
  
  togglePlay: () => void;
  handlePlay: () => void;
  handlePause: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  setLoop: (loop: boolean) => void;
  handlePlayPause: () => void;
  toggleLoop: () => void;
  changePlaybackSpeed: () => void;
}

export interface AudioTimeState {
  duration: number;
  currentTime: number;
  isSeeking: boolean;
  
  seek: (time: number) => void;
  startSeeking: () => void;
  endSeeking: () => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
}

export interface AudioErrorState {
  error: string | null;
  isLoading: boolean;
  
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export interface AudioDownloadState {
  handleDownload: () => void;
}

export interface AudioPlayerState extends 
  AudioPlaybackState,
  AudioTimeState,
  AudioErrorState,
  AudioDownloadState {
  audioRef: RefObject<HTMLAudioElement>;
  waveformRef: RefObject<HTMLCanvasElement>;
  isLooping: boolean;
}

export interface AudioPlayerProviderProps {
  children: React.ReactNode;
  audioUrl?: string;
  fileName?: string;
  isGenerating?: boolean;
}

export interface AudioControlsProps {
  isPlaying: boolean;
  isGenerating: boolean;
  currentTime: number;
  duration: number;
  togglePlayPause: () => void;
}

export interface ActionButtonsProps {
  fileName: string;
  audioUrl: string;
  isGenerating: boolean;
  embedCode?: string;
}

export interface AudioUrlValidationResult {
  hasValidUrl: boolean;
  isValidUrl: boolean;
  validationDetails: Record<string, any>;
}

export interface AudioContainerProps {
  audioUrl?: string;
  fileName: string;
  isGenerating: boolean;
  validationResult: AudioUrlValidationResult;
}

export interface AudioUrlValidatorProps {
  audioUrl?: string;
  isGenerating?: boolean;
}
