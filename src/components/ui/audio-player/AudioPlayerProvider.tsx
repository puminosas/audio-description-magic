
import React, { useRef, useState, useEffect } from 'react';
import AudioPlayerContext from './AudioPlayerContext';
import { AudioPlayerProviderProps } from './types';

export const AudioPlayerProvider = ({ 
  children, 
  audioUrl, 
  fileName = 'audio.mp3',
  isGenerating = false 
}: AudioPlayerProviderProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(75);
  const [loop, setLoop] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle audio loading and errors
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    
    setError(null);
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleTimeUpdate = () => {
      if (!isSeeking && audio) {
        setCurrentTime(audio.currentTime);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      setError('Failed to play audio file. Please try again.');
      setIsPlaying(false);
    };
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    // Set initial values
    audio.volume = volume / 100;
    audio.playbackRate = playbackSpeed;
    audio.loop = loop;
    
    // Cleanup
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl, isSeeking, volume, playbackSpeed, loop]);
  
  // Update audio properties when they change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = volume / 100;
    audio.playbackRate = playbackSpeed;
    audio.loop = loop;
  }, [volume, playbackSpeed, loop]);
  
  // Controls
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('Failed to play audio. Please try again.');
      });
      setIsPlaying(true);
    }
  };
  
  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.play().catch(err => {
      console.error('Error playing audio:', err);
      setError('Failed to play audio. Please try again.');
    });
    setIsPlaying(true);
  };
  
  const handlePause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.pause();
    setIsPlaying(false);
  };
  
  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = time;
    setCurrentTime(time);
  };
  
  const startSeeking = () => setIsSeeking(true);
  const endSeeking = () => setIsSeeking(false);
  
  const handleDownload = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const value = {
    audioRef,
    waveformRef,
    isPlaying,
    playbackSpeed,
    volume,
    loop,
    duration,
    currentTime,
    isSeeking,
    error,
    
    togglePlay,
    handlePlay,
    handlePause,
    setPlaybackSpeed,
    setVolume,
    setLoop,
    seek,
    startSeeking,
    endSeeking,
    handleDownload,
    setError,
  };
  
  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      {audioUrl && (
        <audio 
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          style={{ display: 'none' }}
        />
      )}
    </AudioPlayerContext.Provider>
  );
};

export default AudioPlayerProvider;
