import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FileInfo } from './types';
import { supabase } from '@/integrations/supabase/client';

export const useFileOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const { toast } = useToast();

  // Fetch project files
  const fetchFiles = useCallback(async (): Promise<FileInfo[]> => {
    setFetchCount(prev => prev + 1);
    
    if (fetchCount > 5) {
      console.warn('Too many file fetch attempts, throttling...');
      return [];
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      console.log('Fetching project files...');
      
      // First try using Supabase Edge Function
      try {
        const result = await supabase.functions.invoke('project-files', {
          method: 'GET',
        });
        
        if (!result.error && result.data) {
          return result.data;
        }
      } catch (supabaseError) {
        console.error('Supabase function error:', supabaseError);
        // Continue with fallback approach
      }
      
      // Fallback to direct API call
      const response = await fetch('/api/files');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to fetch project files');
      toast({
        title: 'Error',
        description: 'Failed to fetch project files',
        variant: 'destructive'
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [fetchCount, toast]);

  // Fetch file content
  const fetchFileContent = useCallback(async (filePath: string): Promise<string> => {
    setError(null);
    setIsLoading(true);
    
    try {
      // First try using Supabase Edge Function
      try {
        const result = await supabase.functions.invoke('file-content', {
          body: { filePath }
        });
        
        if (!result.error && result.data?.content) {
          return result.data.content;
        }
      } catch (supabaseError) {
        console.error('Supabase function error:', supabaseError);
        // Continue with fallback approach
      }
      
      // Fallback to direct API call
      const response = await fetch(`/api/file-content?filePath=${encodeURIComponent(filePath)}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error fetching file content:', error);
      setError(`Failed to fetch content for ${filePath}`);
      toast({
        title: 'Error',
        description: `Failed to load file content for ${filePath}`,
        variant: 'destructive'
      });
      return `// Error loading content for ${filePath}\n// ${error}`;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Save file content
  const saveFileContent = useCallback(async (filePath: string, content: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    
    try {
      // First try using Supabase Edge Function
      try {
        const result = await supabase.functions.invoke('save-file', {
          body: { filePath, content }
        });
        
        if (!result.error) {
          toast({
            title: 'Success',
            description: 'File saved successfully'
          });
          return true;
        }
      } catch (supabaseError) {
        console.error('Supabase function error:', supabaseError);
        // Continue with fallback approach
      }
      
      // Fallback to direct API call
      const response = await fetch('/api/edit-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filePath, newContent: content })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      toast({
        title: 'Success',
        description: 'File saved successfully'
      });
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      setError(`Failed to save ${filePath}`);
      toast({
        title: 'Error',
        description: 'Failed to save file changes',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Analyze file with AI
  const analyzeFileWithAI = useCallback(async (filePath: string, content: string): Promise<string> => {
    setError(null);
    setIsLoading(true);
    
    try {
      // First try using Supabase Edge Function
      try {
        const result = await supabase.functions.invoke('analyze-code', {
          body: { filePath, content }
        });
        
        if (!result.error && result.data?.result) {
          return result.data.result;
        }
      } catch (supabaseError) {
        console.error('Supabase function error:', supabaseError);
        // Continue with fallback approach
      }
      
      // Fallback to direct API call
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filePath, content })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error analyzing file:', error);
      setError(`Failed to analyze ${filePath}`);
      toast({
        title: 'Error',
        description: 'Failed to analyze file with AI',
        variant: 'destructive'
      });
      return `Analysis failed: ${error.message}`;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    error,
    fetchFiles,
    fetchFileContent,
    saveFileContent,
    analyzeFileWithAI
  };
};

export default useFileOperations;
