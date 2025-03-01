
import React from 'react';
import { useAudioPlayer } from './AudioPlayerContext';
import AudioControls from './AudioControls';
import AudioSeekBar from './AudioSeekBar';
import VolumeControl from './VolumeControl';
import ActionButtons from './ActionButtons';

interface PlayerControlsProps {
  isGenerating: boolean;
  audioUrl?: string;
  fileName?: string;
}

const PlayerControls = ({ 
  isGenerating, 
  audioUrl,
  fileName = 'audio-description.mp3'
}: PlayerControlsProps) => {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    embedCode,
    togglePlayPause,
    handleTimeChange,
    handleVolumeChange,
    toggleMute
  } = useAudioPlayer();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0">
      <AudioControls 
        isPlaying={isPlaying}
        isGenerating={isGenerating}
        audioUrl={audioUrl}
        currentTime={currentTime}
        duration={duration}
        togglePlayPause={togglePlayPause}
      />
      
      <AudioSeekBar 
        currentTime={currentTime}
        duration={duration}
        isGenerating={isGenerating}
        audioUrl={audioUrl}
        handleTimeChange={handleTimeChange}
      />
      
      <div className="flex items-center space-x-3">
        <VolumeControl 
          volume={volume}
          isMuted={isMuted}
          isGenerating={isGenerating}
          audioUrl={audioUrl}
          toggleMute={toggleMute}
          handleVolumeChange={handleVolumeChange}
        />
        
        <ActionButtons 
          isGenerating={isGenerating}
          audioUrl={audioUrl}
          fileName={fileName}
          embedCode={embedCode}
        />
      </div>
    </div>
  );
};

export default PlayerControls;
