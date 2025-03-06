
import { useEffect, useState } from 'react';
import { useAudioGeneration } from './useAudioGeneration';
import { LanguageOption, VoiceOption } from '@/utils/audio/types';
import { initializeGoogleVoices, getAvailableLanguages } from '@/utils/audio';
import { useToast } from '@/hooks/use-toast';

// Use 'export type' when re-exporting a type with isolatedModules enabled
export type { GeneratedAudio } from './useGenerationState';

export const useGenerationLogic = () => {
  const { toast } = useToast();
  const [googleTtsAvailable, setGoogleTtsAvailable] = useState(true);
  const { 
    loading, 
    generatedAudio, 
    error, 
    handleGenerate, 
    setError,
    isCached
  } = useAudioGeneration();

  // Initialize Google voices when the component mounts
  useEffect(() => {
    const initializeVoices = async () => {
      try {
        await initializeGoogleVoices();
        // Test if we can get languages to confirm it's working
        getAvailableLanguages();
        setGoogleTtsAvailable(true);
      } catch (error) {
        console.error('Failed to initialize Google voices:', error);
        setGoogleTtsAvailable(false);
        toast({
          title: "Google TTS Unavailable",
          description: "Unable to connect to Google Text-to-Speech service. Please check your network connection and try again later.",
          variant: "destructive",
        });
      }
    };
    
    initializeVoices();
  }, [toast]);

  return {
    loading,
    generatedAudio,
    error,
    handleGenerate,
    setError,
    isCached,
    googleTtsAvailable
  };
};
