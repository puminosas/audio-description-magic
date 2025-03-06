
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FileInfo } from '../../types';

export const useFileOperations = (
  setFiles: React.Dispatch<React.SetStateAction<FileInfo[]>>,
  setSelectedFile: React.Dispatch<React.SetStateAction<FileInfo | null>>,
  setIsLoadingFiles: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoadingFile: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  // Get all project files
  const getFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('project-files', {
        body: {}
      });
      
      if (error) throw new Error(error.message);
      
      const fileInfos: FileInfo[] = (data?.files || []).map((file: any) => ({
        path: file.path,
        content: '',
        type: detectFileType(file.path)
      }));
      
      setFiles(fileInfos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files.');
    } finally {
      setIsLoadingFiles(false);
    }
  }, [setFiles, setIsLoadingFiles, setError]);

  // Get content of a specific file
  const getFileContent = useCallback(async (filePath: string) => {
    setIsLoadingFile(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-file-content', {
        body: { filePath }
      });
      
      if (error) throw new Error(error.message);
      
      const content = data?.content || '';
      
      // Update files array with content
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.path === filePath ? { ...file, content } : file
        )
      );
      
      // Update selected file if it matches
      setSelectedFile(prevFile => 
        prevFile && prevFile.path === filePath 
          ? { ...prevFile, content } 
          : prevFile
      );
      
      return content;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch file content.');
      throw err;
    } finally {
      setIsLoadingFile(false);
    }
  }, [setFiles, setSelectedFile, setIsLoadingFile, setError]);

  // Save changes to a file
  const saveFileContent = useCallback(async (filePath: string, content: string): Promise<boolean> => {
    setIsLoadingFile(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('edit-file', {
        body: { filePath, content }
      });
      
      if (error) throw new Error(error.message);
      
      // Update files array with new content
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.path === filePath ? { ...file, content } : file
        )
      );
      
      // Update selected file if it matches
      setSelectedFile(prevFile => 
        prevFile && prevFile.path === filePath 
          ? { ...prevFile, content } 
          : prevFile
      );
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file content.');
      return false;
    } finally {
      setIsLoadingFile(false);
    }
  }, [setFiles, setSelectedFile, setIsLoadingFile, setError]);

  // Detect file type based on extension
  const detectFileType = (filePath: string): 'script' | 'document' | 'style' | 'config' | 'unknown' => {
    const extension = filePath.split('.').pop()?.toLowerCase() || '';
    
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'rb', 'php', 'sh'].includes(extension)) {
      return 'script';
    } else if (['html', 'md', 'txt', 'rtf', 'pdf', 'doc', 'docx'].includes(extension)) {
      return 'document';
    } else if (['css', 'scss', 'sass', 'less'].includes(extension)) {
      return 'style';
    } else if (['json', 'yaml', 'yml', 'toml', 'ini', 'env'].includes(extension)) {
      return 'config';
    } else {
      return 'unknown';
    }
  };

  return {
    getFiles,
    getFileContent,
    saveFileContent
  };
};

export default useFileOperations;
