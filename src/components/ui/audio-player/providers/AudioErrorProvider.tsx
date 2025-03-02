
import React, { useState } from 'react';
import { AudioErrorState } from '../types';

export const AudioErrorProvider = ({ 
  children
}: { 
  children: React.ReactNode;
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const errorState: AudioErrorState = {
    error,
    isLoading,
    
    setError,
    setIsLoading,
  };
  
  return (
    <>
      {children(errorState)}
    </>
  );
};

export default AudioErrorProvider;
