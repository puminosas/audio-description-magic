
import { useState, useCallback, useEffect } from 'react';
import { useFileOperations } from './useFileOperations';
import { useFileFilters } from './useFileFilters';
import { useFileState } from './useFileState';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { FileInfo } from '../../types';

export const useFileManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { state, updateState } = useFileState();
  const { fetchFiles, fetchFileContent, saveFileContent, isLoadingContent } = useFileOperations();
  const { 
    searchTerm, 
    setSearchTerm, 
    fileTypeFilters, 
    setFileTypeFilters,
    uniqueFileTypes, 
    filteredFiles,
    toggleFileTypeFilter
  } = useFileFilters(state.files);

  // Load files on component mount
  const loadFiles = useCallback(async () => {
    if (!user) return;
    
    updateState({ 
      isLoadingFiles: true,
      isRefreshingFiles: true
    });
    
    const files = await fetchFiles();
    
    updateState({ 
      files,
      isLoadingFiles: false,
      isRefreshingFiles: false
    });
  }, [fetchFiles, updateState, user]);

  // On component mount, fetch files
  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [loadFiles, user]);

  // Get file content
  const handleFileSelect = async (filePath: string) => {
    updateState({
      selectedFile: filePath,
      isEditing: true,
      isLoadingContent: true
    });
    
    const content = await fetchFileContent(filePath);
    
    if (content) {
      updateState({ 
        fileContent: content,
        isLoadingContent: false
      });
    } else {
      // Fallback message if content can't be loaded
      updateState({ 
        fileContent: `// Error loading content for ${filePath}\n// This may be due to permission restrictions or file access limitations.`,
        isLoadingContent: false
      });
    }
  };

  // Save file content
  const handleSaveFile = async () => {
    if (!state.selectedFile) return;
    
    const success = await saveFileContent(state.selectedFile, state.fileContent);
    
    if (success) {
      // Optional: Refresh the file list after saving
      // loadFiles();
    }
  };

  // Ask AI to analyze the file content
  const handleAnalyzeWithAI = async () => {
    if (!state.selectedFile || !state.fileContent) return;
    
    toast({
      title: 'AI Analysis Requested',
      description: 'Analyzing file content with AI...',
    });
    
    // This functionality is implemented in the chat handling logic
    console.log('AI analysis requested for file:', state.selectedFile);
  };

  // Sync filter states with the main state
  useEffect(() => {
    updateState({ 
      searchTerm, 
      fileTypeFilters 
    });
  }, [searchTerm, fileTypeFilters, updateState]);

  return {
    // Files and state
    files: state.files,
    filteredFiles,
    isLoadingFiles: state.isLoadingFiles,
    selectedFile: state.selectedFile,
    fileContent: state.fileContent,
    isEditing: state.isEditing,
    isLoadingContent,
    error: state.error,
    isRefreshingFiles: state.isRefreshingFiles,
    
    // Filters
    searchTerm,
    fileTypeFilters,
    uniqueFileTypes,
    
    // State update methods
    setSearchTerm,
    setFileContent: (content: string) => updateState({ fileContent: content }),
    setIsEditing: (isEditing: boolean) => updateState({ isEditing }),
    setFileTypeFilters,
    
    // Operations
    fetchFiles: loadFiles,
    handleFileSelect,
    handleSaveFile,
    handleAnalyzeWithAI,
    toggleFileTypeFilter
  };
};
