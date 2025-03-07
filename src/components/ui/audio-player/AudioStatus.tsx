
import React from 'react';
import { useAudioPlayer } from './useAudioPlayer';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { XCircle } from 'lucide-react';

interface AudioStatusProps {
  audioUrl?: string;
  isGenerating?: boolean;
  isValidUrl?: boolean;
  validationDetails?: any;
}

const AudioStatus = ({ 
  audioUrl, 
  isGenerating = false, 
  isValidUrl = true,
  validationDetails
}: AudioStatusProps) => {
  const { error, isLoading } = useAudioPlayer();
  
  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-sm font-medium">Generating audio...</span>
      </div>
    );
  }
  
  if (isLoading && audioUrl) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-sm font-medium">Loading audio...</span>
      </div>
    );
  }
  
  // Only show error if we have an audioUrl and there's an error
  if (error && audioUrl) {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Audio Playback Error</AlertTitle>
        <AlertDescription>
          {error}
          {validationDetails && validationDetails.urlLength && (
            <div className="mt-2 text-xs space-y-1">
              <p>Audio data: {Math.round(validationDetails.urlLength / 1024)}KB</p>
              {validationDetails.urlLength > 1000000 && (
                <p className="font-medium">Try generating shorter audio as your browser may have limits on playback size.</p>
              )}
              <p>For large files, consider downloading the audio instead of streaming.</p>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (audioUrl && !isValidUrl) {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Audio Format Error</AlertTitle>
        <AlertDescription>
          The audio file appears to be invalid or incomplete.
          {validationDetails && validationDetails.urlLength && (
            <div className="mt-2 text-xs space-y-1">
              <p>Audio data size: {Math.round(validationDetails.urlLength / 1024)}KB</p>
              {validationDetails.urlLength > 1000000 && (
                <p>The file might be too large for your browser to process.</p>
              )}
              <p>Try generating a shorter audio description or downloading the file.</p>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default AudioStatus;
