
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
