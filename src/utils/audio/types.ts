
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

export interface AudioGenerationResult {
  audioUrl?: string;
  text?: string;
  id?: string;
  error?: string;
}

export interface GenerationStats {
  total: number;
  today: number;
  history: any[];
}
