
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  generateAudioDescription, 
  saveAudioToHistory, 
  updateGenerationCount,
  LanguageOption,
  VoiceOption
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
    
    if (url.startsWith('data:audio/')) {
      if (!url.includes('base64,')) return false;
      
      const base64Part = url.split('base64,')[1];
      
      // Audio data needs to be substantial - at least 10KB for a valid audio file
      return base64Part && base64Part.length > 10000;
    }
    
    if (url.startsWith('http')) {
      return url.length > 10;
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
      
      const result = await generateAudioDescription(
        formData.text,
        formData.language,
        formData.voice
      );
      
      if (result.error || !result.audioUrl) {
        const errorMessage = result.error || 'Failed to generate audio. Please try again.';
        
        if (errorMessage.includes('Authentication required') || errorMessage.includes('authentication')) {
          setError('You need to be signed in to generate audio. Please sign in and try again.');
          toast({
            title: 'Authentication Required',
            description: 'Please sign in to generate audio descriptions.',
            variant: 'destructive',
          });
        } else {
          console.error("Audio generation error:", errorMessage);
          setError(errorMessage);
          toast({
            title: 'Generation Failed',
            description: errorMessage,
            variant: 'destructive',
          });
        }
        return;
      }
      
      console.log("Successfully generated audio:", result);
      
      if (!validateAudioUrl(result.audioUrl)) {
        console.error("Invalid audio URL format:", {
          urlStart: result.audioUrl?.substring(0, 50) + '...',
          urlLength: result.audioUrl?.length,
          hasBase64: result.audioUrl?.includes('base64,'),
          dataType: result.audioUrl?.includes('data:audio/') ? 'audio' : 'unknown',
          base64Length: result.audioUrl?.split('base64,')[1]?.length || 0
        });
        
        setError('Generated audio appears to be invalid or truncated. Please try again with a shorter text.');
        toast({
          title: 'Generation Error',
          description: 'Failed to generate valid audio. The response may have been truncated.',
          variant: 'destructive',
        });
        return;
      }
      
      console.log("Audio generation successful:", {
        url: result.audioUrl.substring(0, 50) + '...',
        text: result.text
      });
      
      // Set audio with a small delay to ensure DOM is ready
      setTimeout(() => {
        setGeneratedAudio({
          audioUrl: result.audioUrl,
          text: result.text || formData.text
        });
      }, 100);
      
      if (result.audioUrl && user?.id) {
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
        description: 'Your audio description has been generated.',
      });
      
    } catch (error) {
      console.error('Error generating audio:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to generate audio';
        
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
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
