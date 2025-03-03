
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileInfo } from '../../types';

export const useFileOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);

  // Fetch project files
  const fetchFiles = useCallback(async (): Promise<FileInfo[]> => {
    if (!user) return [];
    
    setFetchCount(prev => prev + 1);
    if (fetchCount > 5) {
      console.warn('Too many file fetch attempts, throttling...');
      return [];
    }
    
    setError(null);
    
    try {
      console.log('Fetching project files...');
      
      let data;
      let error;
      
      try {
        // Try to get files using the Edge Function
        const result = await supabase.functions.invoke('project-files', {
          method: 'GET',
        });
        data = result.data;
        error = result.error;
      } catch (fetchError) {
        console.error('Error connecting to project-files function:', fetchError);
        
        // Fallback to default files if the Edge Function fails
        return [{
          path: 'src/App.tsx',
          type: 'script'
        }, {
          path: 'src/main.tsx',
          type: 'script'
        }, {
          path: 'README.md',
          type: 'document'
        }];
      }

      if (error) {
        console.error('Error invoking project-files function:', error);
        throw new Error(error.message || 'Failed to load project files');
      }
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid response from project-files function:', data);
        
        // Fallback to default files if the response is invalid
        return [{
          path: 'src/App.tsx',
          type: 'script'
        }, {
          path: 'src/main.tsx',
          type: 'script'
        }, {
          path: 'README.md',
          type: 'document'
        }];
      }
      
      console.log('Project files loaded:', data.length);
      
      setTimeout(() => setFetchCount(0), 5000);
      
      return data as FileInfo[];
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(`Failed to load project files: ${error.message}`);
      toast({
        title: 'Error',
        description: 'Failed to load project files. Will use basic navigation.',
        variant: 'destructive',
      });
      
      // Return default files as fallback
      return [{
        path: 'src/App.tsx',
        type: 'script'
      }, {
        path: 'src/main.tsx',
        type: 'script'
      }, {
        path: 'README.md',
        type: 'document'
      }];
    }
  }, [toast, user, fetchCount]);

  // Fetch file content
  const fetchFileContent = async (filePath: string): Promise<string | null> => {
    setIsLoadingContent(true);
    setError(null);
    
    try {
      console.log(`Fetching content for file: ${filePath}`);
      
      let data;
      let error;
      
      try {
        // Try to get file content using the Edge Function
        const result = await supabase.functions.invoke('get-file-content', {
          body: { filePath }
        });
        data = result.data;
        error = result.error;
      } catch (fetchError) {
        console.error('Error connecting to get-file-content function:', fetchError);
        return `// Error loading content for ${filePath}\n// Connection to file service failed. Please try again later.`;
      }

      if (error) {
        console.error('Error fetching file content:', error);
        throw new Error(error.message || 'Failed to fetch file content');
      }
      
      if (!data || typeof data.content !== 'string') {
        console.error('Invalid response for file content:', data);
        return `// Error loading content for ${filePath}\n// Received invalid response from file service.`;
      }
      
      console.log('File content loaded successfully');
      return data.content;
    } catch (error) {
      console.error('Error fetching file content:', error);
      setError(`Failed to load file content: ${error.message}`);
      toast({
        title: 'Error',
        description: 'Failed to load file content',
        variant: 'destructive',
      });
      return `// Error loading content for ${filePath}\n// ${error.message}`;
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Save file content
  const saveFileContent = async (filePath: string, content: string): Promise<boolean> => {
    try {
      console.log(`Saving changes to file: ${filePath}`);
      
      let data;
      let error;
      
      try {
        // Try to save file content using the Edge Function
        const result = await supabase.functions.invoke('edit-file', {
          body: { 
            filePath: filePath,
            newContent: content
          }
        });
        data = result.data;
        error = result.error;
      } catch (saveError) {
        console.error('Error connecting to edit-file function:', saveError);
        toast({
          title: 'Connection Error',
          description: 'Unable to connect to file editing service. Please try again later.',
          variant: 'destructive',
        });
        return false;
      }

      if (error) {
        console.error('Error saving file:', error);
        throw new Error(error.message || 'Failed to save file changes');
      }
      
      console.log('File saved successfully:', data);
      toast({
        title: 'Success',
        description: 'File changes saved successfully',
      });
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      toast({
        title: 'Error',
        description: `Failed to save file: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    fetchFiles,
    fetchFileContent,
    saveFileContent,
    isLoadingContent,
    error,
  };
};
