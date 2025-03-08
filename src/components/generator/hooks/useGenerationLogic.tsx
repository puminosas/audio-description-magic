
import { useEffect, useState } from 'react';
import { useAudioGeneration } from './useAudioGeneration';
import { LanguageOption, VoiceOption } from '@/utils/audio/types';
import { initializeGoogleVoices, getAvailableLanguages } from '@/utils/audio';

// Use 'export type' when re-exporting a type with isolatedModules enabled
export type { GeneratedAudio } from './useGenerationState';

export const useGenerationLogic = () => {
  const [googleTtsAvailable, setGoogleTtsAvailable] = useState(true);
  const [initializationAttempted, setInitializationAttempted] = useState(false);
  const [suppressErrors, setSuppressErrors] = useState(false);
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
        try {
          const languages = getAvailableLanguages();
          
          if (languages && languages.length > 0) {
            setGoogleTtsAvailable(true);
            setSuppressErrors(true); // Suppress any Google TTS errors since it's working
            console.log("Google TTS integration successful with", languages.length, "languages");
          } else {
            // No languages available but no error was thrown
            console.warn("No languages were returned from Google TTS");
            setGoogleTtsAvailable(false);
          }
        } catch (languageError) {
          console.error("Failed to get languages:", languageError);
          setGoogleTtsAvailable(false);
        }
      } catch (error) {
        console.error('Failed to initialize Google voices:', error);
        setGoogleTtsAvailable(false);
        
        // We're removing the toast notification here
        // No toast will be shown when fallback voices are used
      }
    };
    
    initializeVoices();
  }, [initializationAttempted]);

  return {
    loading,
    generatedAudio, // Expose generatedAudio
    error,
    handleGenerate,
    setError,
    isCached,
    googleTtsAvailable,
    suppressErrors
  };
};
