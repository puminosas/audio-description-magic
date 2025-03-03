
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  generateAudioDescription, 
  saveAudioToHistory, 
  updateGenerationCount, 
  LanguageOption,
  VoiceOption,
  AudioGenerationResult,
  AudioSuccessResult,
  AudioErrorResult,
} from '@/utils/audio';

export interface GeneratedAudio {
  audioUrl: string;
  text: string;
}

export const useGenerationLogic = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateAudioUrl = (url: string): boolean => {
    if (!url) return false;
    
    // Google Cloud Storage URLs will be http(s) links
    if (url.startsWith('http')) {
      return url.includes('storage.googleapis.com') || url.includes('storage.cloud.google.com');
    }
    
    // For data URLs (fallback)
    if (url.startsWith('data:audio/')) {
      if (!url.includes('base64,')) return false;
      const base64Part = url.split('base64,')[1];
      return base64Part && base64Part.length > 5000; // Much smaller minimum size for validation
    }
    
    return false;
  };

  const handleGenerate = async (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }, activeTab: string, onSuccess?: () => Promise<void>) => {
    try {
      setLoading(true);
      setError(null);
      setGeneratedAudio(null);
      
      console.log("Generating audio with data:", formData);
      
      if (!user && activeTab !== 'text-to-audio') {
        throw new Error('Please sign in to generate audio descriptions.');
      }
      
      // Add a timeout to prevent long-running requests
      const timeoutPromise = new Promise<AudioErrorResult>((_, reject) => 
        setTimeout(() => reject(new Error('The request took too long to complete. Try with a shorter text.')), 60000) // Increased timeout for Google TTS
      );
      
      // Race the generation with a timeout
      const result = await Promise.race([
        generateAudioDescription(
          formData.text,
          formData.language,
          formData.voice
        ),
        timeoutPromise
      ]);
      
      if ('error' in result) {
        const errorMessage = result.error;
        
        if (typeof errorMessage === 'string' && (errorMessage.includes('Authentication required') || errorMessage.includes('authentication'))) {
          setError('You need to be signed in to generate audio. Please sign in and try again.');
          toast({
            title: 'Authentication Required',
            description: 'Please sign in to generate audio descriptions.',
            variant: 'destructive',
          });
        } else {
          console.error("Audio generation error:", errorMessage);
          setError(typeof errorMessage === 'string' ? errorMessage : 'Unknown error occurred');
          toast({
            title: 'Generation Failed',
            description: typeof errorMessage === 'string' ? errorMessage : 'Unknown error occurred',
            variant: 'destructive',
          });
        }
        return;
      }
      
      console.log("Successfully generated audio:", result);
      
      if (!validateAudioUrl(result.audioUrl)) {
        console.error("Invalid audio URL format:", {
          urlStart: result.audioUrl?.substring(0, 50) + '...',
          urlLength: result.audioUrl?.length
        });
        
        setError('Generated audio appears to be invalid. Please try again with a shorter text.');
        toast({
          title: 'Generation Error',
          description: 'Failed to generate valid audio. Try with shorter text.',
          variant: 'destructive',
        });
        return;
      }
      
      console.log("Audio generation successful:", {
        url: result.audioUrl.substring(0, 50) + '...',
        text: result.text || formData.text
      });
      
      // Set audio with a small delay to ensure DOM is ready
      setTimeout(() => {
        setGeneratedAudio({
          audioUrl: result.audioUrl,
          text: result.text || formData.text
        });
      }, 100);
      
      if (user?.id) {
        try {
          await Promise.all([
            saveAudioToHistory(
              result.audioUrl,
              result.text || formData.text,
              formData.language.name,
              formData.voice.name,
              user.id
            ),
            updateGenerationCount(user.id)
          ]);
          
          if (onSuccess) {
            await onSuccess();
          }
        } catch (err) {
          console.error("Error saving to history:", err);
          // Don't show error to user since audio was generated successfully
        }
      }
      
      toast({
        title: 'Success!',
        description: 'Your audio description has been generated using Google Text-to-Speech.',
      });
      
    } catch (error) {
      console.error('Error generating audio:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to generate audio';
      
      // Provide more user-friendly error message
      let userMessage = errorMessage;
      if (errorMessage.includes('timeout') || errorMessage.includes('took too long')) {
        userMessage = 'The generation timed out. Please try with shorter text.';
      }
        
      setError(userMessage);
      toast({
        title: 'Error',
        description: userMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generatedAudio,
    error,
    handleGenerate,
    setError
  };
};
