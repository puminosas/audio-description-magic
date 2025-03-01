
import React from 'react';
import { Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioPlayer } from './AudioPlayerContext';
import { cn } from '@/lib/utils';

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
      <Timer size={16} className="text-muted-foreground" />
      <span className="absolute text-[10px] font-bold">
        {playbackSpeed}x
      </span>
    </Button>
  );
};

export default PlaybackSpeedButton;
