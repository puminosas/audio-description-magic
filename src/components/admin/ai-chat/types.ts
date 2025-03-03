
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface FileInfo {
  path: string;
  type: string;
  size?: number;
}
