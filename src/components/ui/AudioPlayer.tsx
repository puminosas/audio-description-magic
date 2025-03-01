
import { useState, useRef, useEffect } from 'react';
import AudioControls from './audio-player/AudioControls';
import AudioSeekBar from './audio-player/AudioSeekBar';
import VolumeControl from './audio-player/VolumeControl';
import ActionButtons from './audio-player/ActionButtons';
import AudioWaveform from './audio-player/AudioWaveform';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  audioUrl?: string;
  fileName?: string;
  isGenerating?: boolean;
}

const AudioPlayer = ({ 
  audioUrl, 
  fileName = 'audio-description.mp3', 
  isGenerating = false 
}: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Simulated audio URL if not provided - this is just a fallback
  const effectiveAudioUrl = audioUrl || '';

  useEffect(() => {
    // Generate embed code
    if (effectiveAudioUrl) {
      setEmbedCode(`<iframe 
  src="${window.location.origin}/embed?audio=${encodeURIComponent(effectiveAudioUrl)}" 
  width="300" 
  height="80" 
  frameborder="0" 
  allow="autoplay"
></iframe>`);
    }
  }, [effectiveAudioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const handleLoadMetadata = () => {
        setDuration(audio.duration);
        setAudioLoaded(true);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      const handleError = (e: Event) => {
        console.error('Audio playback error:', e);
        toast({
          title: 'Error',
          description: 'Failed to play audio file. Please try again.',
          variant: 'destructive',
        });
        setAudioLoaded(false);
      };
      
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadMetadata);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [audioRef.current, toast]);

  // Reset player state when audioUrl changes
  useEffect(() => {
    if (audioUrl) {
      setCurrentTime(0);
      setIsPlaying(false);
      setAudioLoaded(false);
    }
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: 'Error',
          description: 'Failed to play audio file. Please try again.',
          variant: 'destructive',
        });
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  return (
    <div className="glassmorphism rounded-xl p-4 sm:p-6 w-full max-w-3xl mx-auto shadow-lg">
      {/* Hidden audio element */}
      {!isGenerating && audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      )}
      
      <div className="flex flex-col space-y-4">
        {/* Status message for loading or errors */}
        {audioUrl && !audioLoaded && !isGenerating && (
          <div className="text-center text-sm text-muted-foreground py-2">
            Loading audio file...
          </div>
        )}
        
        {/* Waveform visualization */}
        <AudioWaveform 
          isGenerating={isGenerating} 
          audioUrl={audioUrl} 
          isPlaying={isPlaying} 
        />
        
        {/* Controls */}
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
      </div>
    </div>
  );
};

export default AudioPlayer;
