
import React from 'react';
import { Button } from '@/components/ui/button';
import { Repeat } from 'lucide-react';
import { useAudioPlayer } from './useAudioPlayer';

const LoopButton = () => {
  const { isLooping, toggleLoop } = useAudioPlayer();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-7 w-7 p-0 ${isLooping ? 'text-primary' : ''}`}
      onClick={toggleLoop}
      title={isLooping ? 'Disable loop' : 'Enable loop'}
    >
      <Repeat className="h-4 w-4" />
    </Button>
  );
};

export default LoopButton;
