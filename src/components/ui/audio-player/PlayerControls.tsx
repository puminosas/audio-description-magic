
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAudioPlayer } from './useAudioPlayer';
import ActionButtons from './ActionButtons';
import AudioControls from './AudioControls';

interface PlayerControlsProps {
  isGenerating?: boolean;
  audioUrl?: string;
  fileName?: string;
}

const PlayerControls = ({ isGenerating = false, audioUrl, fileName }: PlayerControlsProps) => {
  const {
    isPlaying,
    togglePlay,
    currentTime,
    duration,
  } = useAudioPlayer();

  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          disabled={isGenerating || !audioUrl}
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M6.75 5.25a1.5 1.5 0 013 0v13.5a1.5 1.5 0 01-3 0V5.25zm7.5 0a1.5 1.5 0 013 0v13.5a1.5 1.5 0 01-3 0V5.25z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.426 1.529-2.333 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.689-2.779-.217-2.779-1.643V5.653z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </Button>

        <AudioControls 
          isPlaying={isPlaying}
          isGenerating={isGenerating}
          audioUrl={audioUrl}
          currentTime={currentTime}
          duration={duration}
          togglePlayPause={togglePlay}
        />
      </div>

      <ActionButtons 
        isGenerating={!!isGenerating}
        audioUrl={audioUrl}
        fileName={fileName || 'audio.mp3'}
        embedCode={`<audio controls src="${audioUrl || ''}"></audio>`}
      />
    </div>
  );
};

export default PlayerControls;
