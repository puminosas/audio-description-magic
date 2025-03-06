
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  id?: string;
  createdAt?: string;
}

export interface FileInfo {
  path: string;
  type: string;
  size?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export type TypingStatus = 'idle' | 'typing' | 'processing' | 'error';
