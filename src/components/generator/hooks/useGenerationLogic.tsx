
import { useEffect } from 'react';
import { useAudioGeneration } from './audio-generation';
import { LanguageOption, VoiceOption } from '@/utils/audio/types';
import { initializeGoogleVoices } from '@/utils/audio';

// Use 'export type' when re-exporting a type with isolatedModules enabled
export type { GeneratedAudio } from './useGenerationState';

export const useGenerationLogic = () => {
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
      } catch (error) {
        console.error('Failed to initialize Google voices:', error);
        // Continue even if initialization fails - we'll use defaults
      }
    };
    
    initializeVoices();
  }, []);

  return {
    loading,
    generatedAudio,
    error,
    handleGenerate,
    setError,
    isCached
  };
};
