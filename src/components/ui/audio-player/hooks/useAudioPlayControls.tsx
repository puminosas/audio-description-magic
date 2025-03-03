
import { useCallback } from 'react';

interface UseAudioPlayControlsProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlayAttemptFailed: (failed: boolean) => void;
}

export const useAudioPlayControls = ({
  audioRef,
  isPlaying,
  setIsPlaying,
  setPlayAttemptFailed
}: UseAudioPlayControlsProps) => {
  
  const handlePlay = useCallback(() => {
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
            } else if (err.name === 'AbortError') {
              // Simply log abort errors but don't show to user
              console.log('Play request was aborted.');
            } else {
              // For other errors, try a different approach
              setTimeout(() => {
                if (audioRef.current) {
                  audioRef.current.load();
                  // Try a different codec if available
                  if (audioRef.current.canPlayType('audio/mp3')) {
                    console.log('Trying MP3 format');
                  }
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
  }, [audioRef, setIsPlaying, setPlayAttemptFailed]);
  
  const handlePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    try {
      audio.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error during pause:', error);
    }
  }, [audioRef, setIsPlaying]);
  
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePlay, handlePause]);
  
  return {
    handlePlay,
    handlePause,
    togglePlay
  };
};
