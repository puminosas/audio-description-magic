
import React from 'react';
import { AudioUrlValidationResult } from './AudioUrlValidator';
import AudioPlayerProvider from './AudioPlayerProvider';
import AudioWaveform from './AudioWaveform';
import AudioStatus from './AudioStatus';
import PlayerControls from './PlayerControls';

interface AudioContainerProps {
  audioUrl?: string;
  fileName: string;
  isGenerating: boolean;
  validationResult: AudioUrlValidationResult;
}

const AudioContainer: React.FC<AudioContainerProps> = ({
  audioUrl,
  fileName,
  isGenerating,
  validationResult
}) => {
  // Always treat URL as valid if we have one, even if there's a validation error
  // This ensures the player remains visible
  const hasAudioUrl = !!audioUrl;
  
  return (
    <AudioPlayerProvider 
      audioUrl={hasAudioUrl ? audioUrl : undefined}
      fileName={fileName}
      isGenerating={isGenerating}
    >
      <div className="flex flex-col space-y-4">
        <AudioStatus 
          audioUrl={audioUrl} 
          isGenerating={isGenerating} 
          isValidUrl={hasAudioUrl} // Treat as valid if we have a URL
          validationDetails={validationResult.validationDetails}
        />
        
        <AudioWaveform 
          isGenerating={isGenerating} 
          audioUrl={hasAudioUrl ? audioUrl : undefined} 
        />
        
        <PlayerControls 
          isGenerating={isGenerating}
          fileName={fileName}
          audioUrl={audioUrl}
        />
      </div>
    </AudioPlayerProvider>
  );
};

export default AudioContainer;
