
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
}

export interface AudioPlayerProviderProps {
  children: React.ReactNode;
  audioUrl?: string;
  fileName?: string;
  isGenerating?: boolean;
}
