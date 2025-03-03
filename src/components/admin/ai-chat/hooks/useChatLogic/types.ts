
import { Message, TypingStatus } from '../../types';

export interface FileAnalysisRequest {
  filePath: string;
  fileContent: string;
}

export interface ChatLogicState {
  input: string;
  messages: Message[];
  isProcessing: boolean;
  typingStatus: TypingStatus;
  error: string | null;
}

export interface ChatLogicReturn {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  messages: Message[];
  isProcessing: boolean;
  typingStatus: TypingStatus;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  chatSessions: any[];
  isLoadingSessions: boolean;
  currentSession: string | null;
  sendMessage: () => Promise<Message[] | null>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleClearChat: () => void;
  retryLastMessage: () => void;
  loadChatSession: (sessionId: string) => Promise<void>;
  startNewChat: () => void;
  sendFileAnalysisRequest: (filePath: string, fileContent: string) => Promise<void>;
}
