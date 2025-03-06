
import { useToast } from '@/hooks/use-toast';

export const useAudioValidator = () => {
  const { toast } = useToast();

  const validateAudioUrl = (url: string | undefined): boolean => {
    if (!url) {
      console.error('Audio URL is undefined or empty');
      return false;
    }

    // Check for valid data URL format (for base64) or valid HTTP URL
    const isValidDataUrl = url.startsWith('data:audio/') && url.includes('base64,');
    const isValidHttpUrl = url.startsWith('https://') || url.startsWith('http://');
    
    if (!isValidDataUrl && !isValidHttpUrl) {
      console.error('Invalid audio URL format:', { 
        urlStart: url.substring(0, 30) + '...',
        isValidDataUrl,
        isValidHttpUrl
      });
      return false;
    }

    // For data URLs, check if the content is substantial
    if (isValidDataUrl) {
      const parts = url.split('base64,');
      if (parts.length !== 2 || parts[1].length < 1000) {
        console.error('Audio data URL is too short or malformed');
        return false;
      }
    }

    return true;
  };

  // New function to handle audio load errors gracefully
  const handleAudioLoadError = (error: Error, audioUrl?: string) => {
    console.error('Audio load error:', error, { 
      audioUrlLength: audioUrl ? audioUrl.length : 0 
    });
    
    toast({
      title: 'Audio Playback Error',
      description: 'There was a problem playing this audio. Try generating a shorter description.',
      variant: 'destructive',
    });
    
    return error;
  };

  return { validateAudioUrl, handleAudioLoadError };
};
