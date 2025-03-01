
import { LanguageOption, VoiceOption } from './types';

// Available languages
export const LANGUAGES: LanguageOption[] = [
  { id: 'en', code: 'en', name: 'English', nativeText: 'English', nativeName: 'English', flag: '🇺🇸' },
  { id: 'es', code: 'es', name: 'Spanish', nativeText: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  { id: 'fr', code: 'fr', name: 'French', nativeText: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { id: 'de', code: 'de', name: 'German', nativeText: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
  { id: 'it', code: 'it', name: 'Italian', nativeText: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹' },
  { id: 'pt', code: 'pt', name: 'Portuguese', nativeText: 'Português', nativeName: 'Português', flag: '🇵🇹' },
  // Additional languages
  { id: 'zh', code: 'zh', name: 'Chinese', nativeText: '中文', nativeName: '中文', flag: '🇨🇳' },
  { id: 'ja', code: 'ja', name: 'Japanese', nativeText: '日本語', nativeName: '日本語', flag: '🇯🇵' },
  { id: 'ko', code: 'ko', name: 'Korean', nativeText: '한국어', nativeName: '한국어', flag: '🇰🇷' },
  { id: 'ru', code: 'ru', name: 'Russian', nativeText: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
  { id: 'ar', code: 'ar', name: 'Arabic', nativeText: 'العربية', nativeName: 'العربية', flag: '🇸🇦' },
];

// Available voices with properly typed gender
export const VOICES: Record<string, VoiceOption[]> = {
  all: [
    // OpenAI voices
    { id: 'alloy', name: 'Alloy', gender: 'neutral' },
    { id: 'echo', name: 'Echo', gender: 'male' },
    { id: 'fable', name: 'Fable', gender: 'female' },
    { id: 'onyx', name: 'Onyx', gender: 'male' },
    { id: 'nova', name: 'Nova', gender: 'female' },
    { id: 'shimmer', name: 'Shimmer', gender: 'female', premium: true },
    // Additional premium voices
    { id: 'aria', name: 'Aria', gender: 'female', premium: true },
    { id: 'roger', name: 'Roger', gender: 'male', premium: true },
    { id: 'sarah', name: 'Sarah', gender: 'female', premium: true },
    { id: 'daniel', name: 'Daniel', gender: 'male', premium: true },
    { id: 'emma', name: 'Emma', gender: 'female', premium: true },
  ]
};

/**
 * Get available languages
 */
export const getAvailableLanguages = (): LanguageOption[] => {
  return LANGUAGES;
};

/**
 * Get available voices for a specific language
 */
export const getAvailableVoices = (languageCode: string): VoiceOption[] => {
  // For now, return all voices for any language as modern TTS can handle multiple languages
  return VOICES.all;
};
