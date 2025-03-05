
// File system API responses
export interface GetFilesResponse {
  success: boolean;
  files: FileInfo[];
  error?: string;
}

export interface GetFileContentResponse {
  success: boolean;
  content: string;
  filePath: string;
  error?: string;
}

export interface SaveFileContentResponse {
  success: boolean;
  message: string;
  filePath: string;
  error?: string;
}

// Chat API responses
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AICompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Session management API responses
export interface ChatSessionResponse {
  id: string;
  title: string;
  messages: any[];
  created_at: string;
  updated_at: string;
}

export interface ChatSessionsListResponse {
  success: boolean;
  sessions: ChatSessionResponse[];
  error?: string;
}

export interface ChatSessionCreateResponse {
  success: boolean;
  session: ChatSessionResponse;
  error?: string;
}

export interface ChatSessionUpdateResponse {
  success: boolean;
  session: ChatSessionResponse;
  error?: string;
}

export interface ChatSessionDeleteResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Analysis API response
export interface FileAnalysisResponse {
  success: boolean;
  analysis: string;
  error?: string;
}
