
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useGenerationErrors = () => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const handleError = (errorMessage: string | Error) => {
    const message = errorMessage instanceof Error 
      ? errorMessage.message 
      : errorMessage;
    
    // Provide more user-friendly error message
    let userMessage = message;
    if (message.includes('timeout') || message.includes('took too long')) {
      userMessage = 'The generation timed out. Please try with shorter text.';
    } else if (message.includes('Failed to fetch') || message.includes('Failed to send')) {
      userMessage = 'Unable to connect to the audio generation service. Please check your network connection and try again.';
    } else if (message.includes('Authentication required') || message.includes('authentication')) {
      userMessage = 'You need to be signed in to generate audio. Please sign in and try again.';
    }
      
    setError(userMessage);
    toast({
      title: 'Error',
      description: userMessage,
      variant: 'destructive',
    });

    return userMessage;
  };

  return { error, setError, handleError };
};
