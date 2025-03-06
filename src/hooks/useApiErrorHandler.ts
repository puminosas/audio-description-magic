
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

type ApiErrorHandler = {
  error: string | null;
  setError: (error: string | null) => void;
  handleError: (error: unknown) => void;
  clearError: () => void;
};

export const useApiErrorHandler = (): ApiErrorHandler => {
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown) => {
    console.error('API Error:', err);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
      errorMessage = err.message;
    }
    
    // Don't show technical details in production
    if (process.env.NODE_ENV === 'production') {
      if (errorMessage.includes('network error') || 
          errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again later.';
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorMessage = 'Authentication error. Please sign in again.';
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        errorMessage = 'The requested resource was not found.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      }
    }
    
    setError(errorMessage);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    return errorMessage;
  }, []);

  return { error, setError, handleError, clearError };
};
