
import { FileInfo } from '../hooks/file-management/types';

// API Response types for file system operations
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

// API Response types for chat operations
export type ChatResponse = {
  role: string;
  content: string;
  id?: string;
};

// API Response types for chat session management
export type ChatSessionResponse = {
  id: string;
  title: string;
  messages: any[];
  created_at: string;
  updated_at: string;
};

export type ChatSessionsResponse = {
  sessions: ChatSessionResponse[];
};

export type ChatSessionCreateResponse = {
  id: string;
  success: boolean;
};

export type ChatSessionDeleteResponse = {
  success: boolean;
};

// API Response types for file analysis
export type FileAnalysisResponse = {
  analysis: string;
  suggestions: string[];
};
