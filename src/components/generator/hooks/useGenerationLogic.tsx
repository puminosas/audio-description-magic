
import { useAudioGeneration } from './useAudioGeneration';
import { LanguageOption, VoiceOption } from '@/utils/audio';

// Use 'export type' when re-exporting a type with isolatedModules enabled
export type { GeneratedAudio } from './useGenerationState';

export const useGenerationLogic = () => {
  const { 
    loading, 
    generatedAudio, 
    error, 
    handleGenerate, 
    setError 
  } = useAudioGeneration();

  return {
    loading,
    generatedAudio,
    error,
    handleGenerate,
    setError
  };
};
