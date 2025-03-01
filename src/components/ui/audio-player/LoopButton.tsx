
import React from 'react';
import { Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioPlayer } from './AudioPlayerContext';
import { cn } from '@/lib/utils';

interface LoopButtonProps {
  isGenerating: boolean;
  audioUrl?: string;
}

const LoopButton = ({ isGenerating, audioUrl }: LoopButtonProps) => {
  const { isLooping, toggleLoop } = useAudioPlayer();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLoop}
      disabled={isGenerating || !audioUrl}
      className="h-8 w-8"
      title={isLooping ? "Disable loop" : "Enable loop"}
    >
      <Repeat size={16} className={cn(
        "text-muted-foreground",
        isLooping && "text-primary"
      )} />
    </Button>
  );
};

export default LoopButton;
