
import { useGenerationCore } from './generation-logic/useGenerationCore';

// Re-export the GeneratedAudio type
export type { GeneratedAudio } from './useGenerationState';

export const useGenerationLogic = () => {
  // Use the refactored core generation logic
  const { 
    loading, 
    generatedAudio, 
    error, 
    handleGenerate, 
    setError,
    isCached
  } = useGenerationCore();

  return {
    loading,
    generatedAudio,
    error,
    handleGenerate,
    setError,
    isCached
  };
};
