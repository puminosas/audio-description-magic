
import { useState } from 'react';
import { FileManagementState } from './types';

export const useFileState = () => {
  const initialState: FileManagementState = {
    files: [],
    isLoadingFiles: true,
    selectedFile: null,
    fileContent: '',
    isEditing: false,
    isLoadingContent: false,
    error: null,
    searchTerm: '',
    isRefreshingFiles: false,
    fileTypeFilters: []
  };
  
  const [state, setState] = useState<FileManagementState>(initialState);
  
  const updateState = (updates: Partial<FileManagementState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };
  
  return {
    state,
    updateState
  };
};
