
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
      
      // Call the Edge Function with proper error handling
      const { data, error: functionError } = await supabase.functions.invoke('ai-chat', {
        body: { message, filePath }
      });
      
      if (functionError) {
        console.error('AI chat API error:', functionError);
        throw new Error(functionError.message || 'Error calling AI service');
      }
      
      if (!data || !data.response) {
        console.error('Invalid response from AI service:', data);
        throw new Error('No response received from AI service');
      }
      
      console.log('AI chat response received successfully');
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
      
      // Call the Edge Function with proper error handling
      const { data, error: functionError } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: "Please analyze this file and suggest improvements:",
          filePath,
          fileContent
        }
      });
      
      if (functionError) {
        console.error('File analysis API error:', functionError);
        throw new Error(functionError.message || 'Error analyzing file');
      }
      
      if (!data || !data.response) {
        console.error('Invalid response from AI service:', data);
        throw new Error('No analysis received from AI service');
      }
      
      console.log('File analysis response received successfully');
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
