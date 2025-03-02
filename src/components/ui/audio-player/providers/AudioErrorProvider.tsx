
import React, { useState, useEffect } from 'react';
import { AudioErrorState } from '../types';

interface AudioErrorProviderProps {
  children: (state: AudioErrorState) => React.ReactElement;
  audioUrl?: string;
}

export const AudioErrorProvider = ({ 
  children,
  audioUrl
}: AudioErrorProviderProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset error state when audio URL changes
  useEffect(() => {
    setError(null);
    
    if (!audioUrl) {
      setIsLoading(false);
      return;
    }
    
    // Don't try to preload if URL is invalid
    if (typeof audioUrl !== 'string' || audioUrl.trim() === '') {
      setError("Invalid audio URL format");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // Create a new Audio element to precheck if the URL is valid
    const audio = new Audio();
    
    const handleError = (e: Event) => {
      console.error("Error pre-loading audio:", audioUrl?.substring(0, 50), e);
      let errorMessage = "Failed to load audio. The file might be corrupted or in an unsupported format.";
      
      // Check for specific error types
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Audio loading was aborted.";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error occurred while loading audio.";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Audio decoding failed. The file might be corrupted.";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Audio format is not supported by your browser.";
            break;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
    };
    
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplaythrough', handleCanPlay);
    
    // Set a timeout to detect very slow loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        setError("Audio loading timed out. Please try again.");
        setIsLoading(false);
      }
    }, 10000); // 10 seconds timeout
    
    // Handle errors that might occur when setting the src
    try {
      // Set the audio source
      audio.src = audioUrl;
      
      // Force preload to start
      audio.load();
    } catch (err) {
      console.error("Error setting audio source:", err);
      setError("Failed to initialize audio player. Please try again.");
      setIsLoading(false);
    }
    
    // Clean up
    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplaythrough', handleCanPlay);
      clearTimeout(timeout);
      
      // Proper cleanup to prevent memory leaks
      try {
        audio.pause();
        audio.src = '';
        audio.load();
      } catch (err) {
        console.error("Error cleaning up audio element:", err);
      }
    };
  }, [audioUrl]);
  
  const errorState: AudioErrorState = {
    error,
    isLoading,
    
    setError,
    setIsLoading,
  };
  
  return children(errorState);
};

export default AudioErrorProvider;
