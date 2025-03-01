
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerContextProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  embedCode: string;
  audioLoaded: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  togglePlayPause: () => void;
  handleTimeChange: (value: number[]) => void;
  handleVolumeChange: (value: number[]) => void;
  toggleMute: () => void;
}

interface AudioPlayerProviderProps {
  children: React.ReactNode;
  audioUrl?: string;
  fileName?: string;
  isGenerating?: boolean;
}

const AudioPlayerContext = createContext<AudioPlayerContextProps | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider = ({ 
  children, 
  audioUrl, 
  fileName = 'audio-description.mp3',
  isGenerating = false 
}: AudioPlayerProviderProps) => {
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

  const value = {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    embedCode,
    audioLoaded,
    audioRef,
    togglePlayPause,
    handleTimeChange,
    handleVolumeChange,
    toggleMute
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {!isGenerating && audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      )}
      {children}
    </AudioPlayerContext.Provider>
  );
};
