import { useState } from 'react';

export const useAudioSettings = () => {
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(75);
  const [loop, setLoop] = useState(false);
  
  const updatePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
  };
  
  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
  };
  
  const toggleLoop = () => {
    setLoop(prevLoop => !prevLoop);
  };
  
  const setLoopState = (newLoopState: boolean) => {
    setLoop(newLoopState);
  };
  
  return {
    playbackSpeed,
    volume,
    loop,
    updatePlaybackSpeed,
    updateVolume,
    toggleLoop,
    setLoopState
  };
};
