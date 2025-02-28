
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface AudioSeekBarProps {
  currentTime: number;
  duration: number;
  isGenerating: boolean;
  audioUrl?: string;
  handleTimeChange: (value: number[]) => void;
}

const AudioSeekBar = ({
  currentTime,
  duration,
  isGenerating,
  audioUrl,
  handleTimeChange
}: AudioSeekBarProps) => {
  return (
    <div className="flex-grow mx-0 sm:mx-4">
      <Slider 
        value={[currentTime]} 
        min={0} 
        max={duration || 100} 
        step={0.1} 
        onValueChange={handleTimeChange}
        disabled={isGenerating || !audioUrl}
        className="cursor-pointer"
      />
    </div>
  );
};

export default AudioSeekBar;
