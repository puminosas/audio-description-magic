
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
  // Always show the player if we're generating or have an audioUrl (even if empty)
  const shouldShowPlayer = isGenerating || audioUrl !== undefined;
  
  if (!shouldShowPlayer) {
    return null;
  }
  
  // Check if we have a valid audio URL to play
  const hasValidAudioUrl = !!audioUrl && audioUrl.trim() !== '';
  
  return (
    <AudioPlayerProvider 
      audioUrl={hasValidAudioUrl ? audioUrl : undefined}
      fileName={fileName}
      isGenerating={isGenerating}
    >
      <div className="flex flex-col space-y-4">
        <AudioStatus 
          audioUrl={audioUrl} 
          isGenerating={isGenerating} 
          isValidUrl={hasValidAudioUrl} 
          validationDetails={validationResult.validationDetails}
        />
        
        {(hasValidAudioUrl || isGenerating) && (
          <>
            <AudioWaveform 
              isGenerating={isGenerating} 
              audioUrl={hasValidAudioUrl ? audioUrl : undefined} 
            />
            
            <PlayerControls 
              isGenerating={isGenerating}
              fileName={fileName}
              audioUrl={hasValidAudioUrl ? audioUrl : undefined}
            />
          </>
        )}
      </div>
    </AudioPlayerProvider>
  );
};

export default AudioContainer;
