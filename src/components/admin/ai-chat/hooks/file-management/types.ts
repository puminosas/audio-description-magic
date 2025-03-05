
export interface FileInfo {
  path: string;
  content: string;
}

export interface FileState {
  files: FileInfo[];
  selectedFile: string | null;
  fileContent: string;
  isLoading: boolean;
  fileError: string | null;
  isEditing: boolean;
}

export interface FileFilters {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredFiles: FileInfo[];
}

export interface FileOperations {
  fetchFiles: () => Promise<void>;
  handleFileSelect: (filePath: string) => Promise<void>;
  setFileContent: (content: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  handleSaveFile: () => Promise<void>;
  handleAnalyzeWithAI: () => Promise<void>;
}

export type FileSystemResponse = {
  files: FileInfo[];
};

export type FileContentResponse = {
  content: string;
  filePath: string;
};

export type FileSaveResponse = {
  success: boolean;
  message: string;
};
