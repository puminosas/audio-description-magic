
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gauge } from 'lucide-react';
import { useAudioPlayer } from './useAudioPlayer';

interface PlaybackSpeedButtonProps {
  isGenerating: boolean;
  audioUrl?: string;
}

const PlaybackSpeedButton = ({ isGenerating, audioUrl }: PlaybackSpeedButtonProps) => {
  const { playbackSpeed, changePlaybackSpeed } = useAudioPlayer();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={changePlaybackSpeed}
      disabled={isGenerating || !audioUrl}
      className="h-8 w-8 relative"
      title="Change playback speed"
    >
      <Gauge size={16} className="text-muted-foreground" />
      <span className="absolute text-[10px] font-bold">
        {playbackSpeed}x
      </span>
    </Button>
  );
};

export default PlaybackSpeedButton;
