
// If this file doesn't exist, we're just creating it with the proper types

export interface LanguageOption {
  id: string;
  code: string;
  name: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
}

export interface AudioGenerationResult {
  success: boolean;
  audioUrl?: string;
  error?: string | Error;
  text?: string;
  id?: string;
}

export interface AudioSuccessResult {
  success: true;
  audioUrl: string;
  text: string;
  id?: string;
}

export interface AudioErrorResult {
  success: false;
  error: string | Error;
}

export interface UserQuota {
  remaining: number;
  total: number;
  nextRefresh: Date | null;
}

export interface UserProfile {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  quota: UserQuota;
}
