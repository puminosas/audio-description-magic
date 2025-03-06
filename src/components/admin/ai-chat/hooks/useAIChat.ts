
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAIChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string, filePath?: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Here you'd implement the actual API call to send messages to your AI service
      // This is a placeholder implementation
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message, filePath }
      });
      
      if (error) throw new Error(error.message);
      
      return data?.response || 'No response from AI service';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendFileAnalysisRequest = useCallback(async (filePath: string, fileContent: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call AI service to analyze the file
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: "Please analyze this file and suggest improvements:",
          filePath,
          fileContent
        }
      });
      
      if (error) throw new Error(error.message);
      
      return data?.response || 'No analysis received from AI service';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    sendFileAnalysisRequest,
    isLoading,
    error
  };
};
