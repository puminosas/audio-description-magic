
import React, { useState, useEffect } from 'react';
import { AudioPlaybackState } from '../types';

interface AudioPlaybackProviderProps {
  children: (state: AudioPlaybackState) => React.ReactElement;
  audioRef: React.RefObject<HTMLAudioElement>;
  audioUrl?: string;
}

export const AudioPlaybackProvider = ({ 
  children, 
  audioRef,
  audioUrl
}: AudioPlaybackProviderProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(75);
  const [loop, setLoop] = useState(false);
  
  // Reset playback state when audio URL changes
  useEffect(() => {
    setIsPlaying(false);
  }, [audioUrl]);
  
  // Controls
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Play with proper error handling
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Error playing audio:', err);
            setIsPlaying(false);
            
            // Try one more time after a small delay
            setTimeout(() => {
              audio.play()
                .then(() => setIsPlaying(true))
                .catch(e => {
                  console.error('Retry play failed:', e);
                  setIsPlaying(false);
                });
            }, 300);
          });
      } else {
        // For older browsers that don't return a promise
        setIsPlaying(true);
      }
    }
  };
  
  const handlePlayPause = togglePlay;
  
  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Ensure audio is ready
    if (audio.readyState < 2) {
      audio.load();
    }
    
    // Play with proper error handling
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('Error playing audio:', err);
          setIsPlaying(false);
        });
    } else {
      // For older browsers that don't return a promise
      setIsPlaying(true);
    }
  };
  
  const handlePause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.pause();
    setIsPlaying(false);
  };
  
  // Additional controls (kept for interface compatibility)
  const toggleLoop = () => setLoop(!loop);
  
  const changePlaybackSpeed = () => {
    // Cycle through common playback speeds: 0.5 -> 1 -> 1.5 -> 2 -> 0.5
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };
  
  const playbackState: AudioPlaybackState = {
    isPlaying,
    playbackSpeed,
    volume,
    loop,
    
    togglePlay,
    handlePlay,
    handlePause,
    setPlaybackSpeed,
    setVolume,
    setLoop,
    handlePlayPause,
    toggleLoop,
    changePlaybackSpeed,
  };
  
  return children(playbackState);
};

export default AudioPlaybackProvider;
