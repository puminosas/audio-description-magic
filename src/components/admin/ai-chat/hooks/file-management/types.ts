
// Import FileInfo from parent types
import { FileInfo as BaseFileInfo } from '../../types';

// Extend the FileInfo type if needed
export type FileInfo = BaseFileInfo;

export interface FileManagementState {
  files: FileInfo[];
  filteredFiles: FileInfo[];
  isLoadingFiles: boolean;
  selectedFile: string | null;
  fileContent: string;
  isEditing: boolean;
  isLoadingContent: boolean;
  error: string | null;
  fileError: string | null;
  activeFilters: FileFilters;
}

export interface FileFilters {
  types: string[];
  searchQuery: string;
}

export interface FileOperationsReturn {
  fetchFiles: () => Promise<FileInfo[]>;
  fetchFileContent: (filePath: string) => Promise<string>;
  saveFileContent: (filePath: string, content: string) => Promise<boolean>;
  analyzeFileWithAI: (filePath: string, content: string) => Promise<string>;
  refreshFiles: () => Promise<void>;
}

export interface FileStateReturn {
  state: FileManagementState;
  updateState: (updates: Partial<FileManagementState>) => void;
  setSelectedFile: (filePath: string | null) => void;
  setFileContent: (content: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  setError: (error: string | null) => void;
  setFileError: (error: string | null) => void;
}

export interface FileFiltersReturn {
  activeFilters: FileFilters;
  setSearchQuery: (query: string) => void;
  toggleFileTypeFilter: (type: string) => void;
  clearFilters: () => void;
  applyFilters: (files: FileInfo[]) => FileInfo[];
}
