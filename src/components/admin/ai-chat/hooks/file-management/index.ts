
import { useFileState } from './useFileState';
import { useFileOperations } from './useFileOperations';
import { useFileFilters } from './useFileFilters';
import { FileInfo } from '../../types';

export const useFileManagement = () => {
  const {
    state,
    updateState,
    setSelectedFile,
    setFileContent,
    setIsEditing,
    setError,
    setFileError
  } = useFileState();
  
  const fileOperations = useFileOperations();
  const { activeFilters, setSearchQuery, toggleFileTypeFilter, clearFilters, applyFilters } = useFileFilters();
  
  // Initialize files on component mount
  const initializeFiles = async () => {
    updateState({ isLoadingFiles: true, error: null });
    try {
      const files = await fileOperations.fetchFiles();
      const filteredFiles = applyFilters(files);
      
      updateState({ 
        files, 
        filteredFiles,
        isLoadingFiles: false 
      });
    } catch (error) {
      updateState({ 
        isLoadingFiles: false, 
        error: `Failed to fetch files: ${error.message}` 
      });
    }
  };
  
  // Handle file selection
  const handleFileSelect = async (filePath: string) => {
    // Save current file if it's being edited
    if (state.selectedFile && state.isEditing) {
      await fileOperations.saveFileContent(state.selectedFile, state.fileContent);
    }
    
    setSelectedFile(filePath);
    updateState({ isLoadingContent: true, fileError: null });
    
    try {
      const content = await fileOperations.fetchFileContent(filePath);
      setFileContent(content);
      setIsEditing(false);
      updateState({ isLoadingContent: false });
    } catch (error) {
      setFileError(`Failed to load file content: ${error.message}`);
      updateState({ isLoadingContent: false });
    }
  };
  
  return {
    // State
    selectedFile: state.selectedFile,
    fileContent: state.fileContent,
    isEditing: state.isEditing,
    isLoadingFiles: state.isLoadingFiles,
    isLoadingContent: state.isLoadingContent,
    files: state.files,
    filteredFiles: state.filteredFiles,
    error: state.error,
    fileError: state.fileError,
    
    // File operations
    ...fileOperations,
    
    // State updaters
    setSelectedFile,
    setFileContent,
    setIsEditing,
    initializeFiles,
    handleFileSelect,
    
    // Filters
    activeFilters,
    setSearchQuery,
    toggleFileTypeFilter,
    clearFilters,
    applyFilters
  };
};
