
import React from 'react';
import { Button } from '@/components/ui/button';
import { Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudioPlayer } from './useAudioPlayer';

interface LoopButtonProps {
  isGenerating: boolean;
  audioUrl?: string;
}

const LoopButton = ({ isGenerating, audioUrl }: LoopButtonProps) => {
  const { loop, toggleLoop } = useAudioPlayer();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLoop}
      disabled={isGenerating || !audioUrl}
      className="h-8 w-8"
      title={loop ? "Disable loop" : "Enable loop"}
    >
      <Repeat size={16} className={cn(
        "text-muted-foreground",
        loop && "text-primary"
      )} />
    </Button>
  );
};

export default LoopButton;
