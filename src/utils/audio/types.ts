
// Types for language and voice selection
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

// Types for audio generation results
export interface AudioSuccessResult {
  audioUrl: string;
  text: string;
  folderUrl: null; // Updated to be null since we're using Supabase Storage only
}

export interface AudioErrorResult {
  error: string;
}

export type AudioGenerationResult = AudioSuccessResult | AudioErrorResult;
