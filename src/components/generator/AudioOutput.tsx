
import React from 'react';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { XCircle } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface AudioOutputProps {
  isGenerating: boolean;
  audioUrl: string | null;
  generatedText: string | null;
  error?: string | null;
}

const AudioOutput = ({ isGenerating, audioUrl, generatedText, error }: AudioOutputProps) => {
  if (!isGenerating && !audioUrl && !error) return null;
  
  // Enhanced validation for audio URL - increase the required base64 length for better reliability
  const isAudioUrlInvalid = audioUrl && (
    !audioUrl.includes('base64,') || 
    (audioUrl.startsWith('data:audio/') && audioUrl.split('base64,')[1]?.length < 20000)
  );
  
  // Calculate size of audio data for debugging
  const audioDataSize = audioUrl && audioUrl.startsWith('data:audio/') 
    ? Math.round((audioUrl.length / 1024)) 
    : null;
  
  return (
    <div className="border-t border-border p-4 sm:p-6 bg-secondary/20 rounded-md">
      <h3 className="text-xl font-semibold mb-4">
        {isGenerating ? 'Generating Your Audio...' : 'Your Generated Audio'}
      </h3>
      
      {isGenerating && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span className="text-md font-medium">Creating your audio description...</span>
        </div>
      )}
      
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Generation Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : isAudioUrlInvalid ? (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Audio Format Error</AlertTitle>
          <AlertDescription>
            The audio file appears to be invalid or incomplete. Please try generating again with shorter text.
            {audioDataSize && <span className="block mt-1 text-xs opacity-70">Audio data size: {audioDataSize}KB (minimum 20KB required)</span>}
          </AlertDescription>
        </Alert>
      ) : audioUrl && !isGenerating ? (
        <AudioPlayer 
          audioUrl={audioUrl} 
          isGenerating={isGenerating}
          fileName={`audio-description-${Date.now()}.mp3`}
        />
      ) : null}
      
      {/* Display the AI-generated product description below the player */}
      {generatedText && !isGenerating && (
        <div className="mt-6 p-4 rounded-md bg-background/80 border">
          <h4 className="text-sm font-medium mb-2">Generated Text:</h4>
          <p className="text-sm whitespace-pre-wrap">{generatedText}</p>
        </div>
      )}
    </div>
  );
};

export default AudioOutput;
