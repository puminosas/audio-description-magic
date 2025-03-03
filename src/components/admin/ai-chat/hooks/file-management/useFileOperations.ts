
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
  
  // Fetch project files
  const fetchFiles = useCallback(async (): Promise<FileInfo[]> => {
    if (!user) return [];
    
    setError(null);
    
    try {
      console.log('Fetching project files...');
      const { data, error } = await supabase.functions.invoke('project-files', {
        method: 'GET',
      });

      if (error) {
        console.error('Error invoking project-files function:', error);
        throw new Error(error.message || 'Failed to load project files');
      }
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid response from project-files function:', data);
        throw new Error('Invalid response from server');
      }
      
      console.log('Project files loaded:', data.length);
      return data as FileInfo[];
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(`Failed to load project files: ${error.message}`);
      toast({
        title: 'Error',
        description: 'Failed to load project files',
        variant: 'destructive',
      });
      return [];
    }
  }, [toast, user]);

  // Fetch file content
  const fetchFileContent = async (filePath: string): Promise<string | null> => {
    setIsLoadingContent(true);
    setError(null);
    
    try {
      console.log(`Fetching content for file: ${filePath}`);
      const { data, error } = await supabase.functions.invoke('get-file-content', {
        body: { filePath }
      });

      if (error) {
        console.error('Error fetching file content:', error);
        throw new Error(error.message || 'Failed to fetch file content');
      }
      
      if (!data || !data.content) {
        console.error('Invalid response for file content:', data);
        throw new Error('Invalid response from server');
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
      return null;
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Save file content
  const saveFileContent = async (filePath: string, content: string): Promise<boolean> => {
    try {
      console.log(`Saving changes to file: ${filePath}`);
      const { data, error } = await supabase.functions.invoke('edit-file', {
        body: { 
          filePath: filePath,
          newContent: content
        }
      });

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
