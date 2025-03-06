
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
  const { hasValidUrl, isValidUrl, validationDetails } = validationResult;

  return (
    <AudioPlayerProvider 
      audioUrl={hasValidUrl ? audioUrl : undefined}
      fileName={fileName}
      isGenerating={isGenerating}
    >
      <div className="flex flex-col space-y-4">
        <AudioStatus 
          audioUrl={audioUrl} 
          isGenerating={isGenerating} 
          isValidUrl={hasValidUrl}
          validationDetails={validationDetails}
        />
        
        <AudioWaveform 
          isGenerating={isGenerating} 
          audioUrl={hasValidUrl ? audioUrl : undefined} 
        />
        
        <PlayerControls 
          isGenerating={isGenerating}
          fileName={fileName}
          audioUrl={hasValidUrl ? audioUrl : undefined}
        />
      </div>
    </AudioPlayerProvider>
  );
};

export default AudioContainer;
