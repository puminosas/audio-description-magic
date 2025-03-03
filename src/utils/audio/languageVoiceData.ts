
import { LanguageOption, VoiceOption } from './types';

// Default language options (will be replaced with actual data from Google TTS API)
export const LANGUAGES: LanguageOption[] = [
  { 
    id: 'en-US', 
    code: 'en-US', 
    name: 'English (US)', 
    nativeText: 'English (US)', 
    nativeName: 'English (US)'
  },
  { 
    id: 'en-GB', 
    code: 'en-GB', 
    name: 'English (UK)', 
    nativeText: 'English (UK)', 
    nativeName: 'English (UK)'
  },
  { 
    id: 'es-ES', 
    code: 'es-ES', 
    name: 'Spanish', 
    nativeText: 'Español', 
    nativeName: 'Spanish'
  },
  { 
    id: 'fr-FR', 
    code: 'fr-FR', 
    name: 'French', 
    nativeText: 'Français', 
    nativeName: 'French'
  },
  { 
    id: 'de-DE', 
    code: 'de-DE', 
    name: 'German', 
    nativeText: 'Deutsch', 
    nativeName: 'German'
  },
  { 
    id: 'it-IT', 
    code: 'it-IT', 
    name: 'Italian', 
    nativeText: 'Italiano', 
    nativeName: 'Italian'
  },
  { 
    id: 'ja-JP', 
    code: 'ja-JP', 
    name: 'Japanese', 
    nativeText: '日本語', 
    nativeName: 'Japanese'
  },
  { 
    id: 'ko-KR', 
    code: 'ko-KR', 
    name: 'Korean', 
    nativeText: '한국어', 
    nativeName: 'Korean'
  },
  { 
    id: 'pt-BR', 
    code: 'pt-BR', 
    name: 'Portuguese (Brazil)', 
    nativeText: 'Português (Brasil)', 
    nativeName: 'Portuguese (Brazil)'
  },
  { 
    id: 'ru-RU', 
    code: 'ru-RU', 
    name: 'Russian', 
    nativeText: 'Русский', 
    nativeName: 'Russian'
  },
  { 
    id: 'zh-CN', 
    code: 'zh-CN', 
    name: 'Chinese (Simplified)', 
    nativeText: '简体中文', 
    nativeName: 'Chinese (Simplified)'
  },
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
    if (!googleVoicesCache) {
      const { data, error } = await fetch('/api/get-google-voices')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch Google voices');
          }
          return response.json();
        });

      if (error) {
        throw new Error(error);
      }

      googleVoicesCache = data;
    }
  } catch (error) {
    console.error('Error initializing Google voices:', error);
    // Fall back to default voices if there's an error
  }
}
