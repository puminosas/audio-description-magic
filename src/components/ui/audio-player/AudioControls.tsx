
import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioControlsProps {
  isPlaying: boolean;
  isGenerating: boolean;
  audioUrl?: string;
  currentTime: number;
  duration: number;
  togglePlayPause: () => void;
}

const AudioControls = ({ 
  isPlaying, 
  isGenerating, 
  audioUrl, 
  currentTime, 
  duration,
  togglePlayPause 
}: AudioControlsProps) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="flex items-center justify-between sm:w-auto sm:justify-start sm:space-x-4">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={togglePlayPause}
        disabled={isGenerating || !audioUrl}
        className="h-10 w-10 rounded-full"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </Button>
      
      <div className="text-sm font-medium">
        {isGenerating ? (
          <span className="text-muted-foreground">--:--</span>
        ) : audioUrl ? (
          <span>{formatTime(currentTime)} <span className="text-muted-foreground">/ {formatTime(duration)}</span></span>
        ) : (
          <span className="text-muted-foreground">--:--</span>
        )}
      </div>
    </div>
  );
};

export default AudioControls;
