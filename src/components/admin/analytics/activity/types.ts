
export interface ActivityEvent {
  id: string;
  type: 'generation' | 'login' | 'system';
  userId?: string | null;
  email?: string | null;
  description: string;
  timestamp: string;
  isRegistered: boolean;
  sessionId?: string | null;
  userName?: string | null;
}
