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
