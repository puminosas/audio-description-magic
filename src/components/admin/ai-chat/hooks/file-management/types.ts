import { FileInfo } from '../../types';

export interface FileManagementState {
  files: FileInfo[];
  isLoadingFiles: boolean;
  selectedFile: string | null;
  fileContent: string;
  isEditing: boolean;
  isLoadingContent: boolean;
  error: string | null;
  searchTerm: string;
  isRefreshingFiles: boolean;
  fileTypeFilters: string[];
}

export interface FileFilters {
  searchTerm: string;
  fileTypeFilters: string[];
}

export interface FileInfo {
  name: string;
  path: string;
  file: string;
  type?: 'script' | 'document' | 'style' | 'config' | 'unknown';
}

export interface FileContent {
  filePath: string;
  content: string;
}
