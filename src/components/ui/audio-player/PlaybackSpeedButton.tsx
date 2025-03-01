
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gauge } from 'lucide-react';
import { useAudioPlayer } from './useAudioPlayer';

const PlaybackSpeedButton = () => {
  const { playbackSpeed, changePlaybackSpeed } = useAudioPlayer();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs flex items-center gap-1"
      onClick={changePlaybackSpeed}
      title="Change playback speed"
    >
      <Gauge className="h-3.5 w-3.5" />
      <span>{playbackSpeed}x</span>
    </Button>
  );
};

export default PlaybackSpeedButton;
