
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
    if (audioUrl) {
      setIsLoading(true);
      
      // Create a new Audio element to precheck if the URL is valid
      const audio = new Audio();
      
      const handleError = () => {
        console.error("Error pre-loading audio:", audioUrl);
        setError("Failed to load audio. The audio file might be corrupted or in an unsupported format.");
        setIsLoading(false);
      };
      
      const handleCanPlay = () => {
        setIsLoading(false);
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
      
      // Set the audio source
      audio.src = audioUrl;
      
      // Clean up
      return () => {
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplaythrough', handleCanPlay);
        clearTimeout(timeout);
        audio.src = '';
      };
    }
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
