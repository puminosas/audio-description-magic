
import React, { useState } from 'react';
import { AudioTimeState } from '../types';

interface AudioTimeProviderProps {
  children: (state: AudioTimeState) => React.ReactElement;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const AudioTimeProvider = ({ 
  children,
  audioRef
}: AudioTimeProviderProps) => {
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = time;
    setCurrentTime(time);
  };
  
  const startSeeking = () => setIsSeeking(true);
  const endSeeking = () => setIsSeeking(false);
  
  const timeState: AudioTimeState = {
    duration,
    currentTime,
    isSeeking,
    
    seek,
    startSeeking,
    endSeeking,
    setDuration,
    setCurrentTime,
  };
  
  return children(timeState);
};

export default AudioTimeProvider;
