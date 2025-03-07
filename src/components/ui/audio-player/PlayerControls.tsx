
import React from 'react';
import { useAudioPlayer } from './useAudioPlayer';
import AudioControls from './AudioControls';
import AudioSeekBar from './AudioSeekBar';
import VolumeControl from './VolumeControl';
import ActionButtons from './ActionButtons';

interface PlayerControlsProps {
  isGenerating?: boolean;
  fileName?: string;
  audioUrl?: string;
}

const PlayerControls = ({ isGenerating = false, fileName = 'audio.mp3', audioUrl }: PlayerControlsProps) => {
  const { 
    isPlaying, 
    togglePlay, 
    duration, 
    currentTime,
    audioRef,
    isLoading,
    handlePlayPause,
    volume,
    seek,
    setVolume
  } = useAudioPlayer();

  // For volume control
  const [isMuted, setIsMuted] = React.useState(false);
  const prevVolume = React.useRef(volume);

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume.current);
      setIsMuted(false);
    } else {
      prevVolume.current = volume;
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleTimeChange = (values: number[]) => {
    seek(values[0]);
  };

  // Get the actual audio source safely
  const audioSrc = audioRef.current?.src || audioUrl || '';

  return (
    <div className="w-full space-y-3 bg-background p-3 rounded-md shadow-sm border">
      <div className="flex flex-col">
        <AudioSeekBar 
          currentTime={currentTime}
          duration={duration}
          isGenerating={isGenerating || false}
          audioUrl={audioSrc}
          handleTimeChange={handleTimeChange}
        />
        
        <div className="flex items-center justify-between mt-2">
          <AudioControls 
            isPlaying={isPlaying}
            isGenerating={isGenerating}
            currentTime={currentTime}
            duration={duration}
            togglePlayPause={handlePlayPause}
          />
          
          <div className="flex items-center space-x-2">
            <VolumeControl 
              volume={volume}
              isMuted={isMuted}
              isGenerating={isGenerating || false}
              audioUrl={audioSrc}
              toggleMute={toggleMute}
              handleVolumeChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
      
      {/* Only show action buttons if we have an audio source and not generating */}
      {!isGenerating && audioSrc && (
        <ActionButtons 
          fileName={fileName} 
          audioUrl={audioSrc} 
          isGenerating={isGenerating}
          embedCode="<iframe src='YOUR_EMBED_URL' allow='autoplay'></iframe>"
        />
      )}
    </div>
  );
};

export default PlayerControls;
