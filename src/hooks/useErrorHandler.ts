
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

type ErrorHandlerOptions = {
  showToast?: boolean;
  logError?: boolean;
  captureToAnalytics?: boolean;
};

const defaultOptions: ErrorHandlerOptions = {
  showToast: true,
  logError: true,
  captureToAnalytics: false,
};

export function useErrorHandler(defaultMessage = 'An unexpected error occurred', options = defaultOptions) {
  const [error, setError] = useState<Error | string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const formatErrorMessage = useCallback((err: unknown): string => {
    let errorMessage = defaultMessage;
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
      errorMessage = err.message;
    }
    
    // Make the error message more user-friendly in production
    if (process.env.NODE_ENV === 'production') {
      if (errorMessage.includes('network error') || 
          errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('Network request failed')) {
        return 'Network error. Please check your connection and try again.';
      }
      
      if (errorMessage.includes('timeout')) {
        return 'Request timed out. Please try again later.';
      }
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        return 'Authentication error. Please sign in again.';
      }
      
      if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        return 'You do not have permission to perform this action.';
      }
      
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        return 'The requested resource was not found.';
      }
      
      if (errorMessage.includes('500')) {
        return 'Server error. Please try again later.';
      }
    }
    
    return errorMessage;
  }, [defaultMessage]);
  
  const handleError = useCallback((err: unknown, customOptions?: ErrorHandlerOptions) => {
    const mergedOptions = { ...defaultOptions, ...options, ...customOptions };
    const { showToast, logError, captureToAnalytics } = mergedOptions;
    
    const errorMessage = formatErrorMessage(err);
    setError(errorMessage);
    
    if (logError) {
      console.error('Error handled:', err);
    }
    
    if (showToast) {
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
    
    if (captureToAnalytics && process.env.NODE_ENV === 'production') {
      // Here you would call your analytics service
      // Example: Analytics.captureException(err);
    }
    
    return errorMessage;
  }, [formatErrorMessage, options, toast]);
  
  // Utility to wrap async functions with error handling
  const withErrorHandling = useCallback(<T>(promise: Promise<T>, errorHandlingOptions?: ErrorHandlerOptions): Promise<T> => {
    setLoading(true);
    clearError();
    
    return promise
      .catch((err) => {
        handleError(err, errorHandlingOptions);
        throw err; // Re-throw to allow further handling if needed
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clearError, handleError]);
  
  return {
    error,
    loading,
    setError,
    handleError,
    clearError,
    withErrorHandling,
  };
}
