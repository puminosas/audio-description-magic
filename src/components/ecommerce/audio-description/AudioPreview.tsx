
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { GeneratedAudio } from '@/components/generator/hooks/useGenerationLogic';

interface AudioPreviewProps {
  generatedAudio: GeneratedAudio | null;
}

const AudioPreview: React.FC<AudioPreviewProps> = ({ generatedAudio }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Preview</CardTitle>
        <CardDescription>Listen to the generated audio description</CardDescription>
      </CardHeader>
      <CardContent>
        {generatedAudio?.audioUrl ? (
          <AudioPlayer audioUrl={generatedAudio.audioUrl} />
        ) : (
          <div className="bg-muted p-8 rounded-md text-center">
            <p>Generate an audio description to preview it here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioPreview;
