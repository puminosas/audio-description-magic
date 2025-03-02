
import React, { createContext } from 'react';
import { AudioPlayerState } from './types';

// Create the context with default values
export const AudioPlayerContext = createContext<AudioPlayerState>({
  audioRef: { current: null },
  waveformRef: { current: null },
  isPlaying: false,
  playbackSpeed: 1,
  volume: 75,
  loop: false,
  duration: 0,
  currentTime: 0,
  isSeeking: false,
  error: null,
  isLoading: false,
  isLooping: false,
  
  togglePlay: () => {},
  handlePlay: () => {},
  handlePause: () => {},
  setPlaybackSpeed: () => {},
  setVolume: () => {},
  setLoop: () => {},
  seek: () => {},
  startSeeking: () => {},
  endSeeking: () => {},
  handleDownload: () => {},
  setError: () => {},
  handlePlayPause: () => {},
  toggleLoop: () => {},
  changePlaybackSpeed: () => {},
  
  // Add the missing properties
  setDuration: () => {},
  setCurrentTime: () => {},
  setIsLoading: () => {},
});

export default AudioPlayerContext;
