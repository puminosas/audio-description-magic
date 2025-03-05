
import { useState } from 'react';
import { FileManagementState, FileStateReturn } from './types';

const initialState: FileManagementState = {
  files: [],
  filteredFiles: [],
  isLoadingFiles: false,
  selectedFile: null,
  fileContent: '',
  isEditing: false,
  isLoadingContent: false,
  error: null,
  fileError: null,
  activeFilters: {
    types: [],
    searchQuery: ''
  }
};

export const useFileState = (): FileStateReturn => {
  const [state, setState] = useState<FileManagementState>(initialState);

  const updateState = (updates: Partial<FileManagementState>) => {
    setState(prevState => ({
      ...prevState,
      ...updates
    }));
  };

  const setSelectedFile = (filePath: string | null) => {
    updateState({ 
      selectedFile: filePath,
      fileError: null
    });
  };

  const setFileContent = (content: string) => {
    updateState({ 
      fileContent: content,
      fileError: null
    });
  };

  const setIsEditing = (isEditing: boolean) => {
    updateState({ isEditing });
  };

  const setError = (error: string | null) => {
    updateState({ error });
  };

  const setFileError = (fileError: string | null) => {
    updateState({ fileError });
  };

  return {
    state,
    updateState,
    setSelectedFile,
    setFileContent,
    setIsEditing,
    setError,
    setFileError
  };
};
