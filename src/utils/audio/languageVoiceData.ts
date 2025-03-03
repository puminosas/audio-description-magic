
import { LanguageOption, VoiceOption } from './types';

// Default language options (will be replaced with actual data from Google TTS API)
export const LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
];

// Default voices (will be replaced with actual data from Google TTS API)
const DEFAULT_VOICES: Record<string, VoiceOption[]> = {
  'en-US': [
    { id: 'en-US-Wavenet-A', name: 'Wavenet A (Male)', gender: 'male' },
    { id: 'en-US-Wavenet-B', name: 'Wavenet B (Male)', gender: 'male' },
    { id: 'en-US-Wavenet-C', name: 'Wavenet C (Female)', gender: 'female' },
    { id: 'en-US-Wavenet-D', name: 'Wavenet D (Male)', gender: 'male' },
    { id: 'en-US-Wavenet-E', name: 'Wavenet E (Female)', gender: 'female' },
    { id: 'en-US-Wavenet-F', name: 'Wavenet F (Female)', gender: 'female' },
  ],
  'en-GB': [
    { id: 'en-GB-Wavenet-A', name: 'Wavenet A (Female)', gender: 'female' },
    { id: 'en-GB-Wavenet-B', name: 'Wavenet B (Male)', gender: 'male' },
    { id: 'en-GB-Wavenet-C', name: 'Wavenet C (Female)', gender: 'female' },
    { id: 'en-GB-Wavenet-D', name: 'Wavenet D (Male)', gender: 'male' },
  ],
};

// Function to get voices based on language code
export function getVoicesForLanguage(languageCode: string): VoiceOption[] {
  return DEFAULT_VOICES[languageCode] || DEFAULT_VOICES['en-US'];
}

// Function to get available languages
export function getAvailableLanguages(): LanguageOption[] {
  return LANGUAGES;
}

// Function to get available voices for a language
export function getAvailableVoices(languageCode: string): VoiceOption[] {
  return getVoicesForLanguage(languageCode);
}

// Cache for Google TTS voices
let googleVoicesCache: Record<string, any> | null = null;

// Function to fetch and set Google TTS voices
export async function initializeGoogleVoices(): Promise<void> {
  try {
    // Implement the logic to fetch Google TTS voices from our Edge Function
    // This will be called when the app initializes
    // We'll implement this later
  } catch (error) {
    console.error('Error initializing Google voices:', error);
    // Fall back to default voices if there's an error
  }
}
