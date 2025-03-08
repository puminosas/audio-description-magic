
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { XCircle } from 'lucide-react';

interface ErrorAlertProps {
  error: string | null;
  isGoogleTtsError?: boolean;
  hideWhenGoogleTtsWorking?: boolean;
}

const ErrorAlert = ({ error, isGoogleTtsError, hideWhenGoogleTtsWorking = false }: ErrorAlertProps) => {
  // If there's no error, don't show anything
  if (!error || error.trim() === '') return null;
  
  // Check if the error is related to Google TTS - expanded pattern matching
  const isGoogleTtsRelatedError = 
    isGoogleTtsError || 
    error.includes('Google TTS') || 
    error.includes('TTS') ||
    error.includes('voice') ||
    error.includes('Voice') ||
    error.includes('fallback') ||
    error.includes('Fallback') ||
    error.includes('Failed to load languages') ||
    error.includes('Failed to initialize Google voices');
  
  // Don't show Google TTS related errors
  if (isGoogleTtsRelatedError) {
    return null;
  }
  
  // If we should hide errors when Google TTS is working
  if (hideWhenGoogleTtsWorking) {
    return null;
  }
  
  return (
    <Alert variant="destructive" className="mb-6">
      <XCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
