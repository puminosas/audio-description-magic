
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAIChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string, filePath?: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Sending message to AI chat: "${message}"${filePath ? ` with file: ${filePath}` : ''}`);
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message, filePath }
      });
      
      if (error) {
        console.error('AI chat API error:', error);
        throw new Error(error.message);
      }
      
      if (!data || !data.response) {
        throw new Error('No response received from AI service');
      }
      
      return data.response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error in sendMessage:', errorMessage);
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
      console.log(`Sending file analysis request for: ${filePath}`);
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: "Please analyze this file and suggest improvements:",
          filePath,
          fileContent
        }
      });
      
      if (error) {
        console.error('File analysis API error:', error);
        throw new Error(error.message);
      }
      
      if (!data || !data.response) {
        throw new Error('No analysis received from AI service');
      }
      
      return data.response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error in sendFileAnalysisRequest:', errorMessage);
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

export default useAIChat;
