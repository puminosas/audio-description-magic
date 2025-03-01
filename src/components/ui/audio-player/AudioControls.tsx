
import React from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';
import { AudioControlsProps } from './types';

const AudioControls = ({ 
  isPlaying, 
  isGenerating, 
  currentTime, 
  duration, 
  togglePlayPause 
}: AudioControlsProps) => {
  return (
    <div className="flex items-center space-x-2 mb-2">
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0" 
        onClick={togglePlayPause}
        disabled={isGenerating || duration === 0}
      >
        {isGenerating ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </Button>
      
      <div className="text-sm">
        <span>{formatTime(currentTime)}</span>
        <span className="mx-1">/</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default AudioControls;
