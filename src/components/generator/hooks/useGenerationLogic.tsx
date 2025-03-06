
import { useEffect } from 'react';
import { useAudioGeneration } from './useAudioGeneration';
import { LanguageOption, VoiceOption } from '@/utils/audio';
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
    initializeGoogleVoices().catch(error => {
      console.error('Failed to initialize Google voices:', error);
    });
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
