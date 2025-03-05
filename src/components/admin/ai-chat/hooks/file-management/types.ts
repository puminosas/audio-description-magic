
export interface FileInfo {
  path: string;
  type?: 'script' | 'document' | 'style' | 'config' | 'unknown';
  size?: number;
  name?: string;
  file?: string;
}

export interface FileState {
  files: FileInfo[];
  filteredFiles: FileInfo[];
  selectedFile: string | null;
  fileContent: string;
  isEditing: boolean;
  isLoading: boolean;
  isLoadingContent: boolean;
  error: string | null;
  activeFilters: string[];
}

export interface FileOperations {
  fetchFiles: () => Promise<FileInfo[]>;
  fetchFileContent: (filePath: string) => Promise<string>;
  saveFileContent: (filePath: string, content: string) => Promise<void>;
  analyzeFileWithAI: (filePath: string, content: string) => Promise<void>;
}
