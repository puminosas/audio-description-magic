
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
    
    try {
      // Check for valid data URL format
      const isValidDataUrl = 
        (audioUrl.startsWith('data:audio/') && audioUrl.includes('base64,')) || 
        audioUrl.startsWith('https://') || 
        audioUrl.startsWith('http://');
      
      // Check if the data URL is too short or potentially truncated
      // Data URLs for audio need to be quite long to contain actual audio data
      const isValidLength = 
        (audioUrl.startsWith('data:audio/') && audioUrl.length > 1000) || 
        (audioUrl.startsWith('http'));
      
      // Check if the base64 part seems valid
      const isValidBase64 = !audioUrl.startsWith('data:audio/') || 
        (audioUrl.split('base64,')[1]?.length > 100);
      
      return { 
        hasValidUrl: isValidDataUrl && isValidLength && isValidBase64,
        isValidUrl: isValidDataUrl
      };
    } catch (err) {
      console.error("Error validating audio URL:", err);
      return { hasValidUrl: false, isValidUrl: false };
    }
  }, [audioUrl, isGenerating]);

  // Add logging to help debug issues
  React.useEffect(() => {
    if (audioUrl && !hasValidUrl) {
      console.log("Audio URL validation failed:", { 
        urlLength: audioUrl?.length,
        startsWithDataAudio: audioUrl?.startsWith('data:audio/'),
        includesBase64: audioUrl?.includes('base64,'),
        base64Length: audioUrl?.split('base64,')[1]?.length
      });
    }
  }, [audioUrl, hasValidUrl]);

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
