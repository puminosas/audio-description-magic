
import { getAvailableLanguages, getAvailableVoices, initializeGoogleVoices, getVoicesForLanguage } from './languageVoiceData';
import { LanguageOption, VoiceOption } from './types';

// Re-export types for easier importing
export type { LanguageOption, VoiceOption };

// Re-export functions for easier importing
export {
  getAvailableLanguages,
  getAvailableVoices,
  initializeGoogleVoices,
  getVoicesForLanguage
};
