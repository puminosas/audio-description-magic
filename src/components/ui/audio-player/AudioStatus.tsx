
import React from 'react';
import { useAudioPlayer } from './useAudioPlayer';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { XCircle } from 'lucide-react';

interface AudioStatusProps {
  audioUrl?: string;
  isGenerating?: boolean;
}

const AudioStatus = ({ audioUrl, isGenerating = false }: AudioStatusProps) => {
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
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default AudioStatus;
