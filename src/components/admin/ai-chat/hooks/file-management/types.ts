
import type { FileInfo, FileFilters } from '../../types';

// Return type for useFileState hook
export interface FileStateReturn {
  files: FileInfo[];
  selectedFile: FileInfo | null;
  isLoadingFiles: boolean;
  isLoadingFile: boolean;
  fileError: string | null;
  setFiles: (files: FileInfo[]) => void;
  setSelectedFile: (file: FileInfo | null) => void;
  setIsLoadingFiles: (isLoading: boolean) => void;
  setIsLoadingFile: (isLoading: boolean) => void;
  setFileError: (error: string | null) => void;
}

// Return type for useFileFilters hook
export interface FileFiltersReturn {
  filters: FileFilters;
  filteredFiles: FileInfo[];
  setSearchQuery: (query: string) => void;
  toggleTypeFilter: (type: string) => void;
  resetFilters: () => void;
}

// Return type for useFileOperations hook
export interface FileOperationsReturn {
  getFiles: () => Promise<void>;
  getFileContent: (filePath: string) => Promise<void>;
  saveFileContent: (filePath: string, content: string) => Promise<boolean>;
}

// File operations interface
export interface FileOperations {
  getFiles: () => Promise<void>;
  getFileContent: (filePath: string) => Promise<void>;
  saveFileContent: (filePath: string, content: string) => Promise<boolean>;
}
