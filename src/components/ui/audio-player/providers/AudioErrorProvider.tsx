
import React, { useState, useEffect } from 'react';
import { AudioErrorState } from '../types';

interface AudioErrorProviderProps {
  children: (state: AudioErrorState) => React.ReactElement;
  audioUrl?: string;
}

export const AudioErrorProvider = ({ 
  children,
  audioUrl
}: AudioErrorProviderProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset error state when audio URL changes
  useEffect(() => {
    setError(null);
    
    if (!audioUrl) {
      setIsLoading(false);
      return;
    }
    
    // Don't try to preload if URL is invalid
    if (typeof audioUrl !== 'string' || audioUrl.trim() === '') {
      setError("Invalid audio URL format");
      setIsLoading(false);
      return;
    }
    
    // Enhanced validation for data URLs
    if (audioUrl.startsWith('data:audio/')) {
      const parts = audioUrl.split('base64,');
      
      // Check for basic format validity
      if (parts.length !== 2) {
        setError("Invalid audio data format");
        setIsLoading(false);
        return;
      }
      
      const base64Data = parts[1];
      
      // Check for minimum data length
      if (base64Data.length < 10000) {
        setError("Audio data is too small to be valid");
        setIsLoading(false);
        return;
      }
      
      // Check for truncation (invalid base64 padding)
      if (base64Data.length % 4 !== 0) {
        setError("Audio data appears to be truncated. Try generating with shorter text.");
        setIsLoading(false);
        return;
      }
      
      // Check file size - warning for very large files
      if (base64Data.length > 1500000) {
        console.warn("Very large audio file detected:", Math.round(base64Data.length/1024), "KB");
      }
      
      // Try to validate MP3 header (basic check)
      try {
        const headerBytes = atob(base64Data.substring(0, 8));
        const validMP3Header = headerBytes.indexOf('ID3') === 0 || headerBytes.charCodeAt(0) === 0xFF;
        if (!validMP3Header) {
          setError("Audio data does not appear to be a valid MP3 file");
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error checking MP3 header:", err);
      }
    }
    
    setIsLoading(true);
    
    // Create a new Audio element to precheck if the URL is valid
    const audio = new Audio();
    
    const handleError = (e: Event) => {
      console.error("Error pre-loading audio:", audioUrl?.substring(0, 50), e);
      let errorMessage = "Failed to load audio. The file might be corrupted or in an unsupported format.";
      
      // Check for specific error types
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Audio loading was aborted.";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error occurred while loading audio.";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Audio decoding failed. The file might be too large or in an unsupported format.";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Audio format is not supported by your browser. Try a different browser or download the file.";
            break;
        }
      }
      
      // For data URLs, provide more specific error messages
      if (audioUrl.startsWith('data:audio/')) {
        const base64Part = audioUrl.split('base64,')[1] || '';
        const fileSizeKB = Math.round(base64Part.length/1024);
        
        // Log detailed information for debugging
        console.log("Audio data diagnostics:", {
          totalLength: audioUrl.length,
          base64Length: base64Part.length,
          sizeKB: fileSizeKB,
          hasPadding: base64Part.endsWith('==') || base64Part.endsWith('='),
          validPadding: base64Part.length % 4 === 0
        });
        
        // If decoding failed and it's a data URL, suggest browser compatibility issues
        if (audio.error?.code === MediaError.MEDIA_ERR_DECODE || 
            audio.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
          
          if (fileSizeKB > 1000) {
            errorMessage = `Audio file (${fileSizeKB}KB) may be too large for browser playback. Try downloading the file instead.`;
          } else {
            errorMessage = "Your browser couldn't decode the audio. Try using a different browser or generating a shorter description.";
          }
        }
        
        // If data is potentially truncated
        if (base64Part.length % 4 !== 0) {
          errorMessage = "The audio data appears to be truncated. Try generating a shorter description.";
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
    };
    
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplaythrough', handleCanPlay);
    
    // Set a timeout to detect very slow loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        if (audioUrl.startsWith('data:audio/')) {
          const base64Part = audioUrl.split('base64,')[1] || '';
          const fileSizeKB = Math.round(base64Part.length/1024);
          
          if (fileSizeKB > 1000) {
            setError(`Audio loading timed out. The file (${fileSizeKB}KB) may be too large for your browser. Try downloading instead.`);
          } else {
            setError("Audio loading timed out. Try a different browser or download the file.");
          }
        } else {
          setError("Audio loading timed out. Check your network connection or try again later.");
        }
        setIsLoading(false);
      }
    }, 15000); // 15 seconds timeout
    
    // Handle errors that might occur when setting the src
    try {
      // Test the audio data before setting it as a source
      if (audioUrl.startsWith('data:audio/')) {
        const base64Part = audioUrl.split('base64,')[1];
        if (!base64Part || base64Part.length < 5000) {
          throw new Error("Invalid base64 audio data");
        }
      }
      
      // Set the audio source
      audio.src = audioUrl;
      
      // Force preload to start
      audio.load();
    } catch (err) {
      console.error("Error setting audio source:", err);
      setError("Failed to initialize audio player. Please try again with a shorter text.");
      setIsLoading(false);
    }
    
    // Clean up
    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplaythrough', handleCanPlay);
      clearTimeout(timeout);
      
      // Proper cleanup to prevent memory leaks
      try {
        audio.pause();
        audio.src = '';
        audio.load();
      } catch (err) {
        console.error("Error cleaning up audio element:", err);
      }
    };
  }, [audioUrl]);
  
  const errorState: AudioErrorState = {
    error,
    isLoading,
    
    setError,
    setIsLoading,
  };
  
  return children(errorState);
};

export default AudioErrorProvider;
