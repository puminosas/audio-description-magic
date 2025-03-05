
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  id?: string;
  createdAt?: string;
}

export interface FileInfo {
  path: string;
  type: 'script' | 'document' | 'style' | 'config' | 'unknown';
  size?: number;
  name?: string;
  file?: string; // Added for compatibility
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export type TypingStatus = 'idle' | 'typing' | 'processing' | 'error';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface FileContent {
  path: string;
  content: string;
  language?: string;
}

// Error handling interfaces
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// UI component props
export interface ErrorMessageProps {
  error: string;
  retryLastMessage: () => void;
}

export interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export interface ChatSessionsListProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  onCreateNewSession: () => void;
  onLoadSession: (sessionId: string) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onRenameSession: (sessionId: string, newTitle: string) => void;
}

export interface FileExplorerProps {
  selectedFile: string | null;
  fileContent: string;
  isLoadingContent: boolean;
  fileError: string | null;
  handleFileSelect: (filePath: string) => Promise<void>;
  setFileContent: (content: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  handleSaveFile: () => Promise<void>;
  handleAnalyzeWithAI: () => void;
  retryLastMessage: () => void;
}

export interface ChatInterfaceProps {
  messages: Message[];
  isTyping: boolean;
  chatError: string | null;
  sendMessage: (message: string) => void;
  retryLastMessage: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
}
