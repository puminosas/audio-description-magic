
import React from 'react';
import { useAudioPlayer } from './AudioPlayerContext';

interface AudioStatusProps {
  audioUrl?: string;
  isGenerating: boolean;
}

const AudioStatus = ({ audioUrl, isGenerating }: AudioStatusProps) => {
  const { audioLoaded } = useAudioPlayer();

  if (!audioUrl || isGenerating || audioLoaded) return null;

  return (
    <div className="text-center text-sm text-muted-foreground py-2">
      Loading audio file...
    </div>
  );
};

export default AudioStatus;
