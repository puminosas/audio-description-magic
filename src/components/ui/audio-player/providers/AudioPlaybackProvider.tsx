
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
  const [playAttemptFailed, setPlayAttemptFailed] = useState(false);
  
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
    
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('error', handleError);
    };
  }, [audioRef]);
  
  // Controls
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Play with proper error handling
      try {
        setPlayAttemptFailed(false);
        
        // Make sure audio is ready
        if (audio.readyState < 2) {
          // Try reloading if not ready
          audio.load();
        }
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setPlayAttemptFailed(false);
            })
            .catch(err => {
              console.error('Error playing audio:', err);
              setIsPlaying(false);
              setPlayAttemptFailed(true);
              
              // If autoplay was blocked, try again with user interaction
              if (err.name === 'NotAllowedError') {
                console.log('Autoplay blocked. User interaction required.');
              } else if (err.name === 'AbortError') {
                console.log('Play request was aborted.');
              } else {
                // Try one more time after a small delay for other errors
                setTimeout(() => {
                  if (audioRef.current) {
                    // Try reloading before playing
                    audioRef.current.load();
                    
                    audioRef.current.play()
                      .then(() => {
                        setIsPlaying(true);
                        setPlayAttemptFailed(false);
                      })
                      .catch(e => {
                        console.error('Retry play failed:', e);
                        setIsPlaying(false);
                      });
                  }
                }, 500);
              }
            });
        } else {
          // For older browsers that don't return a promise
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Unexpected error during play:', error);
        setIsPlaying(false);
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
    try {
      setPlayAttemptFailed(false);
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setPlayAttemptFailed(false);
          })
          .catch(err => {
            console.error('Error playing audio:', err);
            setIsPlaying(false);
            setPlayAttemptFailed(true);
            
            // Special handling for autoplay policy
            if (err.name === 'NotAllowedError') {
              console.log('Play blocked by browser. User interaction required.');
            }
          });
      } else {
        // For older browsers that don't return a promise
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Unexpected error during play:', error);
      setIsPlaying(false);
    }
  };
  
  const handlePause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    try {
      audio.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error during pause:', error);
    }
  };
  
  // Additional controls
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
