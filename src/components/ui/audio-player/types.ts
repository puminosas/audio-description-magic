
export interface AudioPlayerContextProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  playbackSpeed: number;
  embedCode: string;
  audioLoaded: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  togglePlayPause: () => void;
  handleTimeChange: (value: number[]) => void;
  handleVolumeChange: (value: number[]) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  changePlaybackSpeed: () => void;
}

export interface AudioPlayerProviderProps {
  children: React.ReactNode;
  audioUrl?: string;
  fileName?: string;
  isGenerating?: boolean;
}
