
import { RefObject } from 'react';

export interface AudioPlayerState {
  audioRef: RefObject<HTMLAudioElement>;
  waveformRef: RefObject<HTMLCanvasElement>;
  isPlaying: boolean;
  playbackSpeed: number;
  volume: number;
  loop: boolean;
  duration: number;
  currentTime: number;
  isSeeking: boolean;
  error: string | null;
  isLoading: boolean;
  isLooping: boolean;
  
  togglePlay: () => void;
  handlePlay: () => void;
  handlePause: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  setLoop: (loop: boolean) => void;
  seek: (time: number) => void;
  startSeeking: () => void;
  endSeeking: () => void;
  handleDownload: () => void;
  setError: (error: string | null) => void;
  handlePlayPause: () => void;
  toggleLoop: () => void;
  changePlaybackSpeed: () => void;
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
