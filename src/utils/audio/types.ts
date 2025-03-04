
// Types for language and voice options
export interface LanguageOption {
  id: string;
  name: string;
  nativeText: string;
  code: string;
  nativeName: string;
  flag?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: "male" | "female" | "neutral";
  preview?: string;
  premium?: boolean;
}

export interface AudioSuccessResult {
  audioUrl: string;
  text?: string;
  id?: string;
  folderUrl?: string | null;
}

export interface AudioErrorResult {
  error: string;
}

export type AudioGenerationResult = AudioSuccessResult | AudioErrorResult;

export interface GenerationStats {
  total: number;
  today: number;
  history: any[];
}
