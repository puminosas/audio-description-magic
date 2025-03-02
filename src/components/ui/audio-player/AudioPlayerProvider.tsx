
import React, { useRef, useEffect } from 'react';
import AudioPlayerContext from './AudioPlayerContext';
import { AudioPlayerProviderProps, AudioPlayerState } from './types';
import AudioPlaybackProvider from './providers/AudioPlaybackProvider';
import AudioTimeProvider from './providers/AudioTimeProvider';
import AudioErrorProvider from './providers/AudioErrorProvider';
import AudioDownloadProvider from './providers/AudioDownloadProvider';

export const AudioPlayerProvider = ({ 
  children, 
  audioUrl, 
  fileName = 'audio.mp3',
  isGenerating = false 
}: AudioPlayerProviderProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  
  return (
    <AudioPlaybackProvider audioRef={audioRef} audioUrl={audioUrl}>
      {(playbackState) => (
        <AudioTimeProvider audioRef={audioRef}>
          {(timeState) => (
            <AudioErrorProvider>
              {(errorState) => (
                <AudioDownloadProvider audioUrl={audioUrl} fileName={fileName}>
                  {(downloadState) => {
                    // Set up event listeners
                    useEffect(() => {
                      const audio = audioRef.current;
                      if (!audio || !audioUrl) return;
                      
                      errorState.setError(null);
                      errorState.setIsLoading(true);
                      
                      const handleLoadedMetadata = () => {
                        timeState.setDuration(audio.duration);
                        errorState.setIsLoading(false);
                      };
                      
                      const handleTimeUpdate = () => {
                        if (!timeState.isSeeking && audio) {
                          timeState.setCurrentTime(audio.currentTime);
                        }
                      };
                      
                      const handleEnded = () => {
                        playbackState.handlePause();
                      };
                      
                      const handleError = (e: Event) => {
                        console.error('Audio playback error:', e);
                        errorState.setError('Failed to play audio file. Please try again.');
                        playbackState.handlePause();
                        errorState.setIsLoading(false);
                      };
                      
                      // Optimize audio loading by preloading
                      audio.preload = "auto";
                      
                      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
                      audio.addEventListener('timeupdate', handleTimeUpdate);
                      audio.addEventListener('ended', handleEnded);
                      audio.addEventListener('error', handleError);
                      audio.addEventListener('canplaythrough', () => errorState.setIsLoading(false));
                      
                      // Set initial values
                      audio.volume = playbackState.volume / 100;
                      audio.playbackRate = playbackState.playbackSpeed;
                      audio.loop = playbackState.loop;
                      
                      // Cleanup
                      return () => {
                        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
                        audio.removeEventListener('timeupdate', handleTimeUpdate);
                        audio.removeEventListener('ended', handleEnded);
                        audio.removeEventListener('error', handleError);
                        audio.removeEventListener('canplaythrough', () => errorState.setIsLoading(false));
                      };
                    }, [audioUrl, timeState.isSeeking, playbackState.volume, playbackState.playbackSpeed, playbackState.loop]);
                    
                    // Update audio properties when they change
                    useEffect(() => {
                      const audio = audioRef.current;
                      if (!audio) return;
                      
                      audio.volume = playbackState.volume / 100;
                      audio.playbackRate = playbackState.playbackSpeed;
                      audio.loop = playbackState.loop;
                    }, [playbackState.volume, playbackState.playbackSpeed, playbackState.loop]);
                    
                    // Combine all states
                    const combinedState: AudioPlayerState = {
                      ...playbackState,
                      ...timeState,
                      ...errorState,
                      ...downloadState,
                      audioRef,
                      waveformRef,
                      isLooping: playbackState.loop,
                      setIsLoading: errorState.setIsLoading,
                      setDuration: timeState.setDuration,
                      setCurrentTime: timeState.setCurrentTime
                    };
                    
                    return (
                      <AudioPlayerContext.Provider value={combinedState}>
                        {children}
                        {audioUrl && (
                          <audio 
                            ref={audioRef}
                            src={audioUrl}
                            preload="metadata"
                            crossOrigin="anonymous"
                            style={{ display: 'none' }}
                          />
                        )}
                      </AudioPlayerContext.Provider>
                    );
                  }}
                </AudioDownloadProvider>
              )}
            </AudioErrorProvider>
          )}
        </AudioTimeProvider>
      )}
    </AudioPlaybackProvider>
  );
};

export default AudioPlayerProvider;
