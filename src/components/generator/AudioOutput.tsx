
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';

interface AudioOutputProps {
  audioUrl: string | null;
  generatedText: string | null;
  isGenerating: boolean;
  error: string | null;
  isCached?: boolean;
  fileName?: string;
}

const AudioOutput: React.FC<AudioOutputProps> = ({
  audioUrl,
  generatedText,
  isGenerating,
  error,
  isCached,
  fileName = 'audio-description.mp3'
}) => {
  if (!audioUrl && !isGenerating) return null;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-4">
          {isGenerating ? (
            <div className="space-y-2 animate-pulse">
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-40 w-full rounded-md" />
            </div>
          ) : (
            <>
              {audioUrl && (
                <div className="pt-2">
                  {isCached && (
                    <Badge variant="secondary" className="mb-2 gap-1">
                      <History size={12} />
                      <span>Cached Result</span>
                    </Badge>
                  )}
                  <AudioPlayer
                    audioUrl={audioUrl}
                    fileName={fileName}
                  />
                </div>
              )}

              {generatedText && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Generated Description:</h3>
                  <div className="bg-muted/40 p-3 rounded-md text-sm whitespace-pre-wrap">
                    {generatedText}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioOutput;
