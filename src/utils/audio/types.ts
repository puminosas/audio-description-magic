
// Types for language and voice selection
export interface LanguageOption {
  id: string;
  code: string;
  name: string;
  nativeText?: string;
  nativeName?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'male' | 'female' | 'neutral';
}

// Types for audio generation results
export interface AudioSuccessResult {
  audioUrl: string;
  text: string;
  folderUrl: null; // Updated to be null since we're using Supabase Storage only
  id?: string; // Added ID field for tracking
}

export interface AudioErrorResult {
  error: string;
}

export type AudioGenerationResult = AudioSuccessResult | AudioErrorResult;
