import { useState, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import type { FileInfo } from '../../types';
import type { FileOperationsReturn } from './types';

export const useFileOperations = (
  setFiles: (files: FileInfo[]) => void,
  setSelectedFile: (file: FileInfo | null) => void,
  setIsLoadingFiles: (isLoading: boolean) => void,
  setIsLoadingFile: (isLoading: boolean) => void,
  setFileError: (error: string | null) => void
): FileOperationsReturn => {
  const supabase = useSupabaseClient();

  const getFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    setFileError(null);
    try {
      const { data, error } = await supabase.storage
        .from('admin-chat-files')
        .list('', { // Fetch files from the root directory
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        throw new Error(`Error fetching files: ${error.message}`);
      }

      // Map the data to the FileInfo type
      const filesInfo: FileInfo[] = data.map(file => ({
        name: file.name,
        path: file.name, // Use name as path for simplicity
        type: file.metadata?.mimetype || 'unknown',
        size: file.metadata?.size || 0,
        createdAt: file.created_at,
        updatedAt: file.updated_at,
        content: null, // Initially no content
      }));

      setFiles(filesInfo);
    } catch (err) {
      setFileError(`Failed to retrieve files: ${(err as Error).message}`);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [supabase, setFiles, setIsLoadingFiles, setFileError]);

  const getFileContent = useCallback(async (filePath: string) => {
    setIsLoadingFile(true);
    setFileError(null);
    try {
      const { data, error } = await supabase.storage
        .from('admin-chat-files')
        .download(filePath);

      if (error) {
        throw new Error(`Error downloading file: ${error.message}`);
      }

      if (data) {
        const fileContent = await data.text();

        // Update the selected file with content
        setSelectedFile(prevFile => {
          if (prevFile && prevFile.path === filePath) {
            return { ...prevFile, content: fileContent };
          }
          return prevFile;
        });
      }
    } catch (err) {
      setFileError(`Failed to retrieve file content: ${(err as Error).message}`);
    } finally {
      setIsLoadingFile(false);
    }
  }, [supabase, setSelectedFile, setIsLoadingFile, setFileError]);

  const saveFileContent = useCallback(async (filePath: string, content: string): Promise<boolean> => {
    setIsLoadingFile(true);
    setFileError(null);
    try {
      // Convert the string content to a Blob
      const blob = new Blob([content], { type: 'text/plain' });

      const { error } = await supabase.storage
        .from('admin-chat-files')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'text/plain', // Specify content type
        });

      if (error) {
        throw new Error(`Error uploading file: ${error.message}`);
      }

      // Update the selected file with new content
      setSelectedFile(prevFile => {
        if (prevFile && prevFile.path === filePath) {
          return { ...prevFile, content: content };
        }
        return prevFile;
      });

      return true; // Indicate success
    } catch (err) {
      setFileError(`Failed to save file content: ${(err as Error).message}`);
      return false; // Indicate failure
    } finally {
      setIsLoadingFile(false);
    }
  }, [supabase, setSelectedFile, setIsLoadingFile, setFileError]);

  return {
    getFiles,
    getFileContent,
    saveFileContent
  };
};
