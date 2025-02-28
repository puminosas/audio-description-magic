
import React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  isGenerating: boolean;
  audioUrl?: string;
  toggleMute: () => void;
  handleVolumeChange: (value: number[]) => void;
}

const VolumeControl = ({
  volume,
  isMuted,
  isGenerating,
  audioUrl,
  toggleMute,
  handleVolumeChange
}: VolumeControlProps) => {
  return (
    <div className="flex items-center space-x-3">
      <button 
        onClick={toggleMute}
        className="text-muted-foreground hover:text-foreground transition-colors"
        disabled={isGenerating || !audioUrl}
      >
        {isMuted ? (
          <VolumeX size={18} />
        ) : volume > 0.5 ? (
          <Volume2 size={18} />
        ) : (
          <Volume1 size={18} />
        )}
      </button>
      
      <div className="w-20 hidden sm:block">
        <Slider 
          value={[isMuted ? 0 : volume]} 
          min={0} 
          max={1} 
          step={0.01} 
          onValueChange={handleVolumeChange}
          disabled={isGenerating || !audioUrl}
        />
      </div>
    </div>
  );
};

export default VolumeControl;
