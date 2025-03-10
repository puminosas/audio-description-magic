
import { useCallback } from 'react';
import type { FileInfo } from '../types';
import { useFileOperations } from './file-management/useFileOperations';

export const useFileLogic = (
  files: FileInfo[],
  setFiles: React.Dispatch<React.SetStateAction<FileInfo[]>>,
  selectedFile: FileInfo | null,
  setSelectedFile: React.Dispatch<React.SetStateAction<FileInfo | null>>,
  setIsLoadingFile: React.Dispatch<React.SetStateAction<boolean>>,
  setFileError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const { getFiles: fetchFiles, getFileContent, saveFileContent } = useFileOperations(
    setFiles,
    setSelectedFile,
    () => {}, // We'll handle isLoadingFiles in the parent hook
    setIsLoadingFile,
    setFileError
  );

  // Memoize getFiles to prevent recreation on every render
  const getFiles = useCallback(async () => {
    return fetchFiles();
  }, [fetchFiles]);

  const handleFileSelect = useCallback(async (file: FileInfo) => {
    setSelectedFile(file);
    setIsLoadingFile(true);
    setFileError(null);
    try {
      // Only fetch content if not already loaded
      if (!file.content) {
        await getFileContent(file.path);
      }
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Failed to load file content.');
    } finally {
      setIsLoadingFile(false);
    }
  }, [getFileContent, setSelectedFile, setIsLoadingFile, setFileError]);

  const handleSaveFile = useCallback(async (file: FileInfo, content: string): Promise<boolean> => {
    setIsLoadingFile(true);
    setFileError(null);
    try {
      // Save file content
      const success = await saveFileContent(file.path, content);
      
      if (success) {
        // Update files list with new content
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.path === file.path ? { ...f, content } : f
          )
        );
        
        // Update selected file
        if (selectedFile && selectedFile.path === file.path) {
          setSelectedFile({ ...file, content });
        }
        
        return true;
      } else {
        setFileError('Failed to save file content.');
        return false;
      }
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Failed to save file.');
      return false;
    } finally {
      setIsLoadingFile(false);
    }
  }, [saveFileContent, selectedFile, setFiles, setSelectedFile, setIsLoadingFile, setFileError]);

  return {
    getFiles,
    handleFileSelect,
    handleSaveFile
  };
};

export default useFileLogic;
