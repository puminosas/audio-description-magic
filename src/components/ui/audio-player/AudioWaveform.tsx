import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAudioPlayer } from './useAudioPlayer';

interface AudioWaveformProps {
  isGenerating: boolean;
  audioUrl?: string;
}

const AudioWaveform = ({ isGenerating, audioUrl }: AudioWaveformProps) => {
  const { isPlaying } = useAudioPlayer();
  
  return (
    <div className="h-20 w-full bg-secondary/50 rounded-lg flex items-center justify-center">
      {isGenerating ? (
        <div className="text-center">
          <div className="sound-wave inline-flex mx-auto">
            <div className="bar animate-pulse-sound-1"></div>
            <div className="bar animate-pulse-sound-2"></div>
            <div className="bar animate-pulse-sound-3"></div>
            <div className="bar animate-pulse-sound-4"></div>
            <div className="bar animate-pulse-sound-2"></div>
            <div className="bar animate-pulse-sound-3"></div>
            <div className="bar animate-pulse-sound-1"></div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Generating audio...</p>
        </div>
      ) : audioUrl ? (
        <div className={`w-full h-12 flex items-center ${isPlaying ? 'opacity-100' : 'opacity-60'}`}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="w-1 mx-0.5 rounded-full bg-primary transition-all duration-150"
              style={{
                height: isPlaying 
                  ? `${Math.max(15, Math.abs(Math.sin(i * 0.45) * 40))}px` 
                  : `${Math.max(5, Math.abs(Math.sin(i * 0.45) * 20))}px`
              }}
            ></div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          No audio generated yet
        </div>
      )}
    </div>
  );
};

export default AudioWaveform;
