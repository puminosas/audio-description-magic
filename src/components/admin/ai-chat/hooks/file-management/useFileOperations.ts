import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileInfo } from '../../types';
import { FileOperationsReturn } from './types';
import { GetFilesResponse, GetFileContentResponse, SaveFileContentResponse } from '../../types/api';

export const useFileOperations = (): FileOperationsReturn => {
  const { toast } = useToast();

  const fetchFiles = async (): Promise<FileInfo[]> => {
    try {
      const response = await fetch('/api/files');
      
      if (!response.ok) {
        throw new Error(`Error fetching files: ${response.status}`);
      }
      
      const data: GetFilesResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch files');
      }
      
      return data.files.map(file => ({
        ...file,
        type: determineFileType(file.path)
      }));
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch project files: ${error.message}`,
        variant: 'destructive'
      });
      return [];
    }
  };

  const fetchFileContent = async (filePath: string): Promise<string> => {
    try {
      const response = await fetch(`/api/file-content?path=${encodeURIComponent(filePath)}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching file content: ${response.status}`);
      }
      
      const data: GetFileContentResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch file content');
      }
      
      return data.content;
    } catch (error) {
      console.error(`Error fetching content for ${filePath}:`, error);
      toast({
        title: 'Error',
        description: `Failed to fetch file content: ${error.message}`,
        variant: 'destructive'
      });
      return '';
    }
  };

  const saveFileContent = async (filePath: string, content: string): Promise<boolean> => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch('/api/edit-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({
          filePath,
          newContent: content
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error saving file: ${response.status}`);
      }
      
      const data: SaveFileContentResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to save file');
      }
      
      toast({
        description: data.message || 'File saved successfully'
      });
      
      return true;
    } catch (error) {
      console.error(`Error saving content for ${filePath}:`, error);
      toast({
        title: 'Error',
        description: `Failed to save file: ${error.message}`,
        variant: 'destructive'
      });
      return false;
    }
  };

  const analyzeFileWithAI = async (filePath: string, content: string): Promise<string> => {
    try {
      // This is a placeholder for actual implementation
      // In a real app, this would call an AI endpoint
      const fileExtension = filePath.split('.').pop()?.toLowerCase();
      
      // For now, just return a simple message
      return `Analysis for ${filePath} would be performed by calling the AI service`;
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
      return `Error analyzing file: ${error.message}`;
    }
  };

  const refreshFiles = async (): Promise<void> => {
    await fetchFiles();
  };

  const determineFileType = (filePath: string): 'script' | 'document' | 'style' | 'config' | 'unknown' => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    if (['js', 'jsx', 'ts', 'tsx'].includes(extension)) {
      return 'script';
    } else if (['md', 'txt', 'html'].includes(extension)) {
      return 'document';
    } else if (['css', 'scss', 'less'].includes(extension)) {
      return 'style';
    } else if (['json', 'yml', 'yaml', 'toml', 'config'].includes(extension)) {
      return 'config';
    } else {
      return 'unknown';
    }
  };

  return {
    fetchFiles,
    fetchFileContent,
    saveFileContent,
    analyzeFileWithAI,
    refreshFiles
  };
};
