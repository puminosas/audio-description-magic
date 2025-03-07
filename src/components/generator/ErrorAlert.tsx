
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { XCircle, CloudOff } from 'lucide-react';

interface ErrorAlertProps {
  error: string | null;
  isGoogleTtsError?: boolean;
  hideWhenGoogleTtsWorking?: boolean;
}

const ErrorAlert = ({ error, isGoogleTtsError, hideWhenGoogleTtsWorking = false }: ErrorAlertProps) => {
  // If there's no error, don't show anything
  if (!error) return null;
  
  // If Google TTS is working now but we're asked to hide the error, don't show it
  if (hideWhenGoogleTtsWorking) {
    return null;
  }
  
  // Don't show Google TTS errors - always suppress them
  if (isGoogleTtsError || 
    error.includes('Google TTS') || 
    error.includes('Failed to load languages') ||
    error.includes('Failed to initialize Google voices')) {
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
