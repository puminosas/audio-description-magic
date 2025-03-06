
import { useState, useEffect, useCallback } from 'react';
import { FileInfo } from '../../types';
import { useFileState } from './useFileState';
import { useFileFilters } from './useFileFilters';
import { useFileOperations } from './useFileOperations';

// Export hooks for use elsewhere
export { useFileState } from './useFileState';
export { useFileFilters } from './useFileFilters';
export { useFileOperations } from './useFileOperations';

export const useFileManagement = () => {
  const fileState = useFileState();
  const fileOperations = useFileOperations();
  const fileFilters = useFileFilters();

  const { 
    state, 
    updateState, 
    setSelectedFile, 
    setFileContent, 
    setIsEditing, 
    setError,
    setFileError
  } = fileState;
  
  const {
    fetchFiles,
    fetchFileContent,
    saveFileContent,
    analyzeFileWithAI,
    refreshFiles
  } = fileOperations;

  const { 
    activeFilters, 
    setSearchQuery, 
    toggleFileTypeFilter, 
    clearFilters, 
    applyFilters 
  } = fileFilters;

  const initializeFiles = useCallback(async () => {
    updateState({ isLoadingFiles: true, error: null });
    
    try {
      const files = await fetchFiles();
      updateState({ 
        files: files as FileInfo[],
        filteredFiles: applyFilters(files as FileInfo[]),
        isLoadingFiles: false
      });
    } catch (error) {
      console.error('Error initializing files:', error);
      updateState({ 
        isLoadingFiles: false, 
        error: 'Failed to load files' 
      });
    }
  }, [fetchFiles, updateState, applyFilters]);

  const handleFileSelect = useCallback(async (filePath: string) => {
    setSelectedFile(filePath);
    updateState({ isLoadingContent: true, fileError: null });
    
    try {
      const content = await fetchFileContent(filePath);
      setFileContent(content);
      updateState({ isLoadingContent: false });
    } catch (error) {
      console.error('Error loading file content:', error);
      updateState({ 
        isLoadingContent: false, 
        fileError: 'Failed to load file content' 
      });
    }
  }, [fetchFileContent, setSelectedFile, setFileContent, updateState]);

  const handleSearchChange = useCallback((searchQuery: string) => {
    setSearchQuery(searchQuery);
    updateState({ 
      filteredFiles: applyFilters(state.files) 
    });
  }, [applyFilters, setSearchQuery, state.files, updateState]);

  return {
    // State
    files: state.files,
    filteredFiles: state.filteredFiles,
    isLoadingFiles: state.isLoadingFiles,
    selectedFile: state.selectedFile,
    fileContent: state.fileContent,
    isEditing: state.isEditing,
    isLoadingContent: state.isLoadingContent,
    error: state.error,
    fileError: state.fileError,
    activeFilters,
    
    // Operations
    initializeFiles,
    handleFileSelect,
    setFileContent,
    setIsEditing,
    saveFileContent,
    refreshFiles,
    analyzeFileWithAI,
    
    // Filters
    handleSearchChange,
    toggleFileTypeFilter,
    clearFilters
  };
};
