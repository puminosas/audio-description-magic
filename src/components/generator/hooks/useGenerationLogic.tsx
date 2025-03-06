
import { useAudioGeneration } from './useAudioGeneration';
import { GeneratedAudio } from './useGenerationState';
import { LanguageOption, VoiceOption } from '@/utils/audio';

export { GeneratedAudio } from './useGenerationState';

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
