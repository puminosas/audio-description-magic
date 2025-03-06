
import { useEffect } from 'react';
import { useAudioGeneration } from './useAudioGeneration';
import { LanguageOption, VoiceOption } from '@/utils/audio/types';
import { initializeGoogleVoices } from '@/utils/audio';
import { useToast } from '@/hooks/use-toast';

// Use 'export type' when re-exporting a type with isolatedModules enabled
export type { GeneratedAudio } from './useGenerationState';

export const useGenerationLogic = () => {
  const { toast } = useToast();
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
        toast({
          title: "Voice Loading Warning",
          description: "Some voice options may not be available. Using default voices instead.",
          variant: "destructive",
        });
        // Continue even if initialization fails - we'll use defaults
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
    isCached
  };
};
