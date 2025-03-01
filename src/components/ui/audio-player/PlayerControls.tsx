
import React from 'react';
import { useAudioPlayer } from './useAudioPlayer';
import AudioControls from './AudioControls';
import AudioSeekBar from './AudioSeekBar';
import VolumeControl from './VolumeControl';
import LoopButton from './LoopButton';
import PlaybackSpeedButton from './PlaybackSpeedButton';
import ActionButtons from './ActionButtons';

interface PlayerControlsProps {
  isGenerating?: boolean;
  fileName?: string;
}

const PlayerControls = ({ isGenerating = false, fileName = 'audio.mp3' }: PlayerControlsProps) => {
  const { 
    isPlaying, 
    togglePlay, 
    duration, 
    currentTime,
    audioRef,
    isLoading,
    handlePlayPause
  } = useAudioPlayer();

  return (
    <div className="w-full space-y-3 bg-background p-3 rounded-md shadow-sm border">
      <div className="flex flex-col">
        <AudioSeekBar />
        
        <div className="flex items-center justify-between mt-2">
          <AudioControls 
            isPlaying={isPlaying}
            isGenerating={isGenerating}
            currentTime={currentTime}
            duration={duration}
            togglePlayPause={handlePlayPause}
          />
          
          <div className="flex items-center space-x-2">
            <LoopButton />
            <PlaybackSpeedButton />
            <VolumeControl />
          </div>
        </div>
      </div>
      
      {!isGenerating && audioRef.current && (
        <ActionButtons 
          fileName={fileName} 
          audioUrl={audioRef.current.src} 
          isGenerating={isGenerating}
          embedCode="<iframe src='YOUR_EMBED_URL' allow='autoplay'></iframe>"
        />
      )}
    </div>
  );
};

export default PlayerControls;
