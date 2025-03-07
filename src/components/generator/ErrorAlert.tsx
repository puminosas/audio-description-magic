
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { XCircle, CloudOff } from 'lucide-react';

interface ErrorAlertProps {
  error: string | null;
  isGoogleTtsError?: boolean;
  hideWhenGoogleTtsWorking?: boolean;
}

const ErrorAlert = ({ error, isGoogleTtsError, hideWhenGoogleTtsWorking = false }: ErrorAlertProps) => {
  // If Google TTS is working now but we're asked to hide the error, don't show it
  if (hideWhenGoogleTtsWorking) {
    return null;
  }
  
  // If there's no error, don't show anything
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      {isGoogleTtsError ? (
        <CloudOff className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      <AlertTitle>{isGoogleTtsError ? 'Google TTS Error' : 'Error'}</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
      {isGoogleTtsError && (
        <p className="text-xs mt-2">
          This application requires Google Text-to-Speech to be available. 
          Please try again later when the service is accessible.
        </p>
      )}
    </Alert>
  );
};

export default ErrorAlert;
