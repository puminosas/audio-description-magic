
import React, { useMemo } from 'react';
import AudioPlayerProvider from './audio-player/AudioPlayerProvider';
import AudioWaveform from './audio-player/AudioWaveform';
import AudioStatus from './audio-player/AudioStatus';
import PlayerControls from './audio-player/PlayerControls';

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
  // Enhanced validation of the audioUrl format with useMemo for efficiency
  const { hasValidUrl, isValidUrl } = useMemo(() => {
    // Don't validate if no URL or still generating
    if (!audioUrl || isGenerating) {
      return { hasValidUrl: false, isValidUrl: false };
    }
    
    // Check for valid data URL format
    const isValidDataUrl = 
      (audioUrl.startsWith('data:audio/') && audioUrl.includes('base64,')) || 
      audioUrl.startsWith('https://') || 
      audioUrl.startsWith('http://');
    
    // Check if the data URL is too short or potentially truncated
    const isValidLength = 
      (audioUrl.startsWith('data:audio/') && audioUrl.length > 1000) || 
      (audioUrl.startsWith('http'));
    
    return { 
      hasValidUrl: isValidDataUrl && isValidLength,
      isValidUrl: isValidDataUrl
    };
  }, [audioUrl, isGenerating]);

  return (
    <div className="glassmorphism rounded-xl p-4 sm:p-6 w-full max-w-3xl mx-auto shadow-lg">
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
    </div>
  );
};

export default AudioPlayer;
