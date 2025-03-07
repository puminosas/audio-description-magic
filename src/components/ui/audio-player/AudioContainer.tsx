
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
  // Always show the player if we have a URL or are generating
  const shouldShowPlayer = !!audioUrl || isGenerating;
  
  if (!shouldShowPlayer) {
    return null;
  }
  
  return (
    <AudioPlayerProvider 
      audioUrl={audioUrl}
      fileName={fileName}
      isGenerating={isGenerating}
    >
      <div className="flex flex-col space-y-4">
        <AudioStatus 
          audioUrl={audioUrl} 
          isGenerating={isGenerating} 
          isValidUrl={!!audioUrl} // Treat as valid if we have a URL
          validationDetails={validationResult.validationDetails}
        />
        
        <AudioWaveform 
          isGenerating={isGenerating} 
          audioUrl={audioUrl} 
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
