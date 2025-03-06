
import { useAudioGeneration } from '../audio-generation';
import { LanguageOption, VoiceOption } from '@/utils/audio/types';
import { useInitializeVoices } from '../voice-initialization/useInitializeVoices';

// Use 'export type' when re-exporting a type with isolatedModules enabled
export type { GeneratedAudio } from '../useGenerationState';

export const useGenerationCore = () => {
  const { 
    loading, 
    generatedAudio, 
    error, 
    handleGenerate, 
    setError,
    isCached
  } = useAudioGeneration();

  // Initialize Google voices when the component mounts
  useInitializeVoices();

  return {
    loading,
    generatedAudio,
    error,
    handleGenerate,
    setError,
    isCached
  };
};
