
import { useEffect } from 'react';
import { AudioPlaybackState, AudioTimeState, AudioErrorState } from '../types';

interface UseAudioEventHandlersProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  audioUrl?: string;
  playbackState: AudioPlaybackState;
  timeState: AudioTimeState;
  errorState: AudioErrorState;
}

export const useAudioEventHandlers = ({
  audioRef,
  audioUrl,
  playbackState,
  timeState,
  errorState
}: UseAudioEventHandlersProps) => {
  // Set up event listeners for the audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    
    errorState.setError(null);
    errorState.setIsLoading(true);
    
    const handleLoadedMetadata = () => {
      // Make sure the duration is valid
      if (audio.duration && !isNaN(audio.duration)) {
        timeState.setDuration(audio.duration);
      } else {
        timeState.setDuration(0);
        console.warn("Invalid audio duration:", audio.duration);
      }
      errorState.setIsLoading(false);
    };
    
    const handleTimeUpdate = () => {
      if (!timeState.isSeeking && audio) {
        timeState.setCurrentTime(audio.currentTime);
      }
    };
    
    const handleEnded = () => {
      playbackState.handlePause();
      // Reset to beginning
      timeState.setCurrentTime(0);
      if (audio) audio.currentTime = 0;
    };
    
    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      // Extract more specific error details if available
      let errorMessage = "Failed to play audio file. Please try again.";
      
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Audio playback was aborted.";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error occurred during playback.";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Audio decoding failed. Try with a shorter audio or different format.";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Audio format is not supported by your browser. Try MP3 format.";
            break;
        }
      }
      
      // Add more specific error for data URLs
      if (audioUrl?.startsWith('data:audio/') && audioUrl.length < 10000) {
        errorMessage = "The audio data appears to be incomplete or truncated.";
      }
      
      errorState.setError(errorMessage);
      playbackState.handlePause();
      errorState.setIsLoading(false);
    };
    
    // Optimize audio loading by preloading
    audio.preload = "auto";
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplaythrough', () => errorState.setIsLoading(false));
    
    // Set initial values
    audio.volume = playbackState.volume / 100;
    audio.playbackRate = playbackState.playbackSpeed;
    audio.loop = playbackState.loop;
    
    // Force load to catch any immediate errors
    try {
      audio.load();
    } catch (err) {
      console.error("Error loading audio:", err);
      errorState.setError("Failed to initialize audio player.");
    }
    
    // Cleanup
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplaythrough', () => errorState.setIsLoading(false));
      
      // Proper cleanup
      try {
        audio.pause();
        playbackState.handlePause();
        timeState.setCurrentTime(0);
        
        // Clear src to release memory
        audio.removeAttribute('src');
        audio.load();
      } catch (err) {
        console.error("Error during audio cleanup:", err);
      }
    };
  }, [audioUrl, timeState.isSeeking]);
  
  // Update audio properties when they change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = playbackState.volume / 100;
    audio.playbackRate = playbackState.playbackSpeed;
    audio.loop = playbackState.loop;
  }, [playbackState.volume, playbackState.playbackSpeed, playbackState.loop]);
  
  return { audioRef };
};
