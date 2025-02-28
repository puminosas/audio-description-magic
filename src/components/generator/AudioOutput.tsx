
import React from 'react';
import AudioPlayer from '@/components/ui/AudioPlayer';

interface AudioOutputProps {
  isGenerating: boolean;
  audioUrl: string | null;
}

const AudioOutput = ({ isGenerating, audioUrl }: AudioOutputProps) => {
  if (!isGenerating && !audioUrl) return null;
  
  return (
    <div className="border-t border-border p-6 bg-secondary/20">
      <h3 className="text-xl font-semibold mb-4">
        {isGenerating ? 'Generating Your Audio...' : 'Your Generated Audio'}
      </h3>
      <AudioPlayer 
        audioUrl={audioUrl || undefined} 
        isGenerating={isGenerating}
        fileName={`product-description-${Date.now()}.mp3`}
      />
    </div>
  );
};

export default AudioOutput;
