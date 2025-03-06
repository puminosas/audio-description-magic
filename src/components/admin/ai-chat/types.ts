
// Chat message model
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

// Chat session model
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// Typing indicator status
export type TypingStatus = 'idle' | 'typing';

// Project file model
export interface ProjectFile {
  path: string;
  type: 'file' | 'directory';
  children?: ProjectFile[];
}

// File info model
export interface FileInfo {
  path: string;
  content: string;
  type?: 'script' | 'document' | 'style' | 'config' | 'unknown';
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
