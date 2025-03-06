
// Chat message model
export interface Message {
  id?: string;
  role?: 'user' | 'assistant' | 'system';
  text: string;
  isUser: boolean;
  content?: string;
  createdAt?: string;
}

// File info model
export interface FileInfo {
  path: string;
  content: string | null;
  type?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

// File filters type
export interface FileFilters {
  searchQuery: string;
  types: {
    script: boolean;
    document: boolean;
    style: boolean;
    config: boolean;
    unknown: boolean;
  };
}

// File management state interface
export interface FileManagementState {
  files: FileInfo[];
  selectedFile: FileInfo | null;
  isLoadingFiles: boolean;
  isLoadingFile: boolean;
  fileError: string | null;
}
