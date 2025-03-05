
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
