
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
  const [initializationAttempted, setInitializationAttempted] = useState(false);
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
      if (initializationAttempted) return;
      
      setInitializationAttempted(true);
      try {
        await initializeGoogleVoices();
        
        // Test if we can get languages to confirm it's working
        const languages = getAvailableLanguages();
        
        if (languages && languages.length > 0) {
          setGoogleTtsAvailable(true);
          console.log("Google TTS integration successful with", languages.length, "languages");
        } else {
          throw new Error("No languages available");
        }
      } catch (error) {
        console.error('Failed to initialize Google voices:', error);
        setGoogleTtsAvailable(false);
        
        // Only show toast on first load, not on retries
        if (!initializationAttempted) {
          toast({
            title: "Using Fallback Voices",
            description: "Limited voice selection available. Some features may be restricted.",
            variant: "default", // Changed from "warning" to "default" to fix the type error
          });
        }
      }
    };
    
    initializeVoices();
  }, [toast, initializationAttempted]);

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
