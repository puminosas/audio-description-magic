
import React, { useState, useEffect } from 'react';
import { AudioPlaybackState } from '../types';
import { useAudioPlayControls } from '../hooks/useAudioPlayControls';
import { useAudioSettings } from '../hooks/useAudioSettings';

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
  const [playAttemptFailed, setPlayAttemptFailed] = useState(false);
  
  // Use custom hooks to separate concerns
  const { playbackSpeed, volume, loop, updatePlaybackSpeed, updateVolume, toggleLoop, setLoopState } = useAudioSettings();
  const { handlePlay, handlePause, togglePlay } = useAudioPlayControls({ 
    audioRef, 
    isPlaying, 
    setIsPlaying,
    setPlayAttemptFailed
  });
  
  // Reset playback state when audio URL changes
  useEffect(() => {
    setIsPlaying(false);
    setPlayAttemptFailed(false);
    
    // When URL changes, force audio element to reset
    const audio = audioRef.current;
    if (audio && audioUrl) {
      try {
        // Completely reset the audio element
        audio.pause();
        audio.currentTime = 0;
        
        // Set the new source and force reload
        audio.src = audioUrl;
        audio.load();
      } catch (err) {
        console.error("Error resetting audio element:", err);
      }
    }
  }, [audioUrl, audioRef]);
  
  // Handle audio playback errors
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleError = (e: Event) => {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
      setPlayAttemptFailed(true);
      
      // Try to recover by reloading the audio
      if (audio.src) {
        try {
          setTimeout(() => {
            audio.load();
          }, 500);
        } catch (err) {
          console.error("Error reloading audio after error:", err);
        }
      }
    };
    
    const handleCanPlay = () => {
      setPlayAttemptFailed(false);
    };
    
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    
    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioRef]);
  
  // Additional controls with more descriptive names
  const changePlaybackSpeed = () => {
    // Cycle through common playback speeds: 0.5 -> 1 -> 1.5 -> 2 -> 0.5
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    updatePlaybackSpeed(speeds[nextIndex]);
  };
    
  // Update audio element when settings change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.playbackRate = playbackSpeed;
    audio.volume = volume / 100;
    audio.loop = loop;
  }, [playbackSpeed, volume, loop, audioRef]);
  
  const playbackState: AudioPlaybackState = {
    isPlaying,
    playbackSpeed,
    volume,
    loop,
    
    togglePlay,
    handlePlay,
    handlePause,
    setPlaybackSpeed: updatePlaybackSpeed,
    setVolume: updateVolume,
    setLoop: setLoopState,
    handlePlayPause: togglePlay,
    toggleLoop,
    changePlaybackSpeed,
  };
  
  return children(playbackState);
};

export default AudioPlaybackProvider;
