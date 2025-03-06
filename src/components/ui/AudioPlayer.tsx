
import React from 'react';
import { useAudioUrlValidator } from './audio-player/AudioUrlValidator';
import AudioContainer from './audio-player/AudioContainer';

interface AudioPlayerProps {
  audioUrl?: string;
  fileName?: string;
  isGenerating?: boolean;
}

const AudioPlayer = ({ 
  audioUrl, 
  fileName = 'audio-description.mp3', 
  isGenerating = false 
}: AudioPlayerProps) => {
  // Use the extracted URL validator
  const validationResult = useAudioUrlValidator({ audioUrl, isGenerating });

  return (
    <div className="glassmorphism rounded-xl p-4 sm:p-6 w-full max-w-3xl mx-auto shadow-lg">
      <AudioContainer
        audioUrl={audioUrl}
        fileName={fileName}
        isGenerating={isGenerating}
        validationResult={validationResult}
      />
    </div>
  );
};

export default AudioPlayer;
