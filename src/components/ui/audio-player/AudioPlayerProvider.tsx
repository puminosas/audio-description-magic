
import React, { useRef, useEffect } from 'react';
import AudioPlayerContext from './AudioPlayerContext';
import { AudioPlayerProviderProps, AudioPlayerState } from './types';
import AudioPlaybackProvider from './providers/AudioPlaybackProvider';
import AudioTimeProvider from './providers/AudioTimeProvider';
import AudioErrorProvider from './providers/AudioErrorProvider';
import AudioDownloadProvider from './providers/AudioDownloadProvider';
import { useAudioEventHandlers } from './hooks/useAudioEventHandlers';

export const AudioPlayerProvider = ({ 
  children, 
  audioUrl, 
  fileName = 'audio.mp3',
  isGenerating = false 
}: AudioPlayerProviderProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  
  // Reset audio element when URL changes to prevent stale state
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      // Properly reset the audio element
      try {
        const audio = audioRef.current;
        audio.pause();
        audio.currentTime = 0;
        
        // Force a reload with the new URL
        audio.load();
      } catch (err) {
        console.error("Error resetting audio element:", err);
      }
    }
  }, [audioUrl]);
  
  return (
    <AudioPlaybackProvider audioRef={audioRef} audioUrl={audioUrl}>
      {(playbackState) => (
        <AudioTimeProvider audioRef={audioRef}>
          {(timeState) => (
            <AudioErrorProvider audioUrl={audioUrl}>
              {(errorState) => (
                <AudioDownloadProvider audioUrl={audioUrl} fileName={fileName}>
                  {(downloadState) => {
                    // Use the custom hook for event handlers
                    const audioEvents = useAudioEventHandlers({
                      audioRef,
                      audioUrl,
                      playbackState,
                      timeState,
                      errorState
                    });
                    
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
