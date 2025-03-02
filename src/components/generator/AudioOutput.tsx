
import React from 'react';
import AudioPlayer from '@/components/ui/AudioPlayer';

interface AudioOutputProps {
  isGenerating: boolean;
  audioUrl: string | null;
  generatedText: string | null;
}

const AudioOutput = ({ isGenerating, audioUrl, generatedText }: AudioOutputProps) => {
  if (!isGenerating && !audioUrl) return null;
  
  return (
    <div className="border-t border-border p-6 bg-secondary/20 rounded-md">
      <h3 className="text-xl font-semibold mb-4">
        {isGenerating ? 'Generating Your Audio...' : 'Your Generated Audio'}
      </h3>
      
      <AudioPlayer 
        audioUrl={audioUrl || undefined} 
        isGenerating={isGenerating}
        fileName={`product-description-${Date.now()}.mp3`}
      />
      
      {/* Display the AI-generated product description below the player */}
      {generatedText && !isGenerating && (
        <div className="mt-6 p-4 rounded-md bg-background/80 border">
          <h4 className="text-sm font-medium mb-2">Generated Text:</h4>
          <p className="text-sm whitespace-pre-wrap">{generatedText}</p>
        </div>
      )}
    </div>
  );
};

export default AudioOutput;
