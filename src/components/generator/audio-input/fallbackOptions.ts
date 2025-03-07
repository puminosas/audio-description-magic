
import { LanguageOption, VoiceOption } from '@/utils/audio/types';

// Fallback options when Google TTS API is unavailable
export const FALLBACK_LANGUAGE: LanguageOption = { 
  id: 'en-US',
  code: 'en-US', 
  name: 'English (US)'
};

export const FALLBACK_VOICE: VoiceOption = {
  id: 'en-US-Standard-A',
  name: 'Standard Voice A',
  gender: 'FEMALE'
};

// Safely get available languages with fallback
export const getLanguageOptions = (getAvailableLanguages: () => LanguageOption[]): LanguageOption[] => {
  try {
    const languages = getAvailableLanguages();
    if (languages && languages.length > 0) {
      return languages;
    }
    return [FALLBACK_LANGUAGE];
  } catch (error) {
    console.warn('Error loading languages, using fallback:', error);
    return [FALLBACK_LANGUAGE];
  }
};

// Safely get available voices with fallback
export const getVoiceOptions = (
  getAvailableVoices: (languageCode: string) => VoiceOption[],
  languageCode: string
): VoiceOption[] => {
  try {
    const voices = getAvailableVoices(languageCode);
    if (voices && voices.length > 0) {
      return voices;
    }
    return [FALLBACK_VOICE];
  } catch (error) {
    console.warn('Error loading voices, using fallback:', error);
    return [FALLBACK_VOICE];
  }
};
