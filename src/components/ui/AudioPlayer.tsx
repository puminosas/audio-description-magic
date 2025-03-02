
import React from 'react';
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
  // Validate the audioUrl format if it exists
  const isValidDataUrl = audioUrl && (
    audioUrl.startsWith('data:audio/') || 
    audioUrl.startsWith('https://') || 
    audioUrl.startsWith('http://')
  );

  return (
    <div className="glassmorphism rounded-xl p-4 sm:p-6 w-full max-w-3xl mx-auto shadow-lg">
      <AudioPlayerProvider 
        audioUrl={isValidDataUrl ? audioUrl : undefined}
        fileName={fileName}
        isGenerating={isGenerating}
      >
        <div className="flex flex-col space-y-4">
          <AudioStatus 
            audioUrl={audioUrl} 
            isGenerating={isGenerating} 
            isValidUrl={isValidDataUrl}
          />
          
          <AudioWaveform 
            isGenerating={isGenerating} 
            audioUrl={isValidDataUrl ? audioUrl : undefined} 
          />
          
          <PlayerControls 
            isGenerating={isGenerating}
            fileName={fileName}
            audioUrl={isValidDataUrl ? audioUrl : undefined}
          />
        </div>
      </AudioPlayerProvider>
    </div>
  );
};

export default AudioPlayer;
