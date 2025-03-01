
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AudioPlayerContext from './AudioPlayerContext';
import { AudioPlayerProviderProps } from './types';

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
  const [isLooping, setIsLooping] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
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

  // Apply loop setting to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  // Apply playback speed to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

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

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const changePlaybackSpeed = () => {
    // Cycle through common playback speeds: 1x -> 1.5x -> 2x -> 0.5x -> 0.75x -> 1x
    const speeds = [1, 1.5, 2, 0.5, 0.75];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const value = {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    playbackSpeed,
    embedCode,
    audioLoaded,
    audioRef,
    togglePlayPause,
    handleTimeChange,
    handleVolumeChange,
    toggleMute,
    toggleLoop,
    changePlaybackSpeed
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {!isGenerating && audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" loop={isLooping} />
      )}
      {children}
    </AudioPlayerContext.Provider>
  );
};
