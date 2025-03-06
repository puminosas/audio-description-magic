
import { LanguageOption, VoiceOption } from './types';

// Default languages list - will be populated from Google TTS API
export const LANGUAGES: LanguageOption[] = [
  { id: 'en-US', code: 'en-US', name: 'English (US)' },
  { id: 'es-ES', code: 'es-ES', name: 'Spanish (Spain)' },
  { id: 'fr-FR', code: 'fr-FR', name: 'French (France)' },
  { id: 'lt-LT', code: 'lt-LT', name: 'Lithuanian (Lithuania)' }
];

// Default voices for fallback
const DEFAULT_VOICES: Record<string, VoiceOption[]> = {
  'en-US': [
    { id: 'en-US-Wavenet-A', name: 'Wavenet A (Male)', gender: 'MALE' },
    { id: 'en-US-Wavenet-B', name: 'Wavenet B (Male)', gender: 'MALE' },
    { id: 'en-US-Wavenet-C', name: 'Wavenet C (Female)', gender: 'FEMALE' },
    { id: 'en-US-Wavenet-D', name: 'Wavenet D (Male)', gender: 'MALE' },
    { id: 'en-US-Wavenet-E', name: 'Wavenet E (Female)', gender: 'FEMALE' },
    { id: 'en-US-Wavenet-F', name: 'Wavenet F (Female)', gender: 'FEMALE' },
  ],
  'lt-LT': [
    { id: 'lt-LT-Standard-A', name: 'Standard A (Male)', gender: 'MALE' },
    { id: 'lt-LT-Standard-B', name: 'Standard B (Female)', gender: 'FEMALE' },
  ],
};

// Google TTS API cache for languages and voices
let googleLanguagesCache: LanguageOption[] | null = null;
let googleVoicesCache: Record<string, {
  voices: {
    MALE: VoiceOption[];
    FEMALE: VoiceOption[];
  }
}> | null = null;

// Function to get available languages
export function getAvailableLanguages(): LanguageOption[] {
  return googleLanguagesCache || LANGUAGES;
}

// Function to get voices based on language code with fallback
export function getVoicesForLanguage(languageCode: string): VoiceOption[] {
  return DEFAULT_VOICES[languageCode] || DEFAULT_VOICES['en-US'] || [];
}

// Function to get available voices for a language
export function getAvailableVoices(languageCode: string): VoiceOption[] {
  if (googleVoicesCache && googleVoicesCache[languageCode]) {
    // Get the language data from cache
    const languageData = googleVoicesCache[languageCode];
    
    if (languageData && languageData.voices) {
      // Combine all gender voices into a single array
      const allVoices: VoiceOption[] = [
        ...(languageData.voices.MALE || []),
        ...(languageData.voices.FEMALE || [])
      ];
      
      // Return the combined voices or fall back to default
      return allVoices.length > 0 ? allVoices : getVoicesForLanguage(languageCode);
    }
  }
  
  // Fall back to default voices if cache not available
  return getVoicesForLanguage(languageCode);
}

// Function to fetch and store Google TTS voices
export const fetchAndStoreGoogleVoices = async (): Promise<void> => {
  try {
    // Call our Edge Function to get voices
    const response = await fetch('https://cttaphbzhmheecbqhtjj.supabase.co/functions/v1/get-google-voices');
    
    if (!response.ok) {
      console.warn(`Failed to fetch Google voices: ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    
    if (data && typeof data === 'object') {
      // Process language data
      const languages: LanguageOption[] = Object.keys(data).map(code => ({
        id: code,
        code,
        name: data[code].display_name || code,
      }));
      
      // Sort languages alphabetically
      languages.sort((a, b) => a.name.localeCompare(b.name));
      
      // Process voices data
      const voices: Record<string, { voices: { MALE: VoiceOption[], FEMALE: VoiceOption[] }}> = {};
      
      Object.keys(data).forEach(langCode => {
        const langData = data[langCode];
        voices[langCode] = {
          voices: {
            MALE: (langData.voices.MALE || []).map((v: any) => ({
              id: v.name,
              name: formatVoiceName(v.name),
              gender: 'MALE' as const
            })),
            FEMALE: (langData.voices.FEMALE || []).map((v: any) => ({
              id: v.name,
              name: formatVoiceName(v.name, 'female'),
              gender: 'FEMALE' as const
            }))
          }
        };
      });
      
      // Set the caches
      googleLanguagesCache = languages;
      googleVoicesCache = voices;
      
      console.log(`Loaded ${languages.length} languages from Google TTS API`);
    }
  } catch (error) {
    console.error('Error fetching Google voices:', error);
    // Fall back to default data if there's an error
  }
};

// Function to initialize Google voices (renamed for clarity)
export const initializeGoogleVoices = async (): Promise<void> => {
  return fetchAndStoreGoogleVoices();
};

// Helper function for formatting voice names
function formatVoiceName(voiceName: string, gender?: string): string {
  const nameParts = voiceName.split('-');
  const voiceId = nameParts[nameParts.length - 1];
  
  let voiceType = '';
  if (voiceName.includes('Wavenet')) {
    voiceType = 'Wavenet';
  } else if (voiceName.includes('Neural2')) {
    voiceType = 'Neural2';
  } else if (voiceName.includes('Standard')) {
    voiceType = 'Standard';
  } else if (voiceName.includes('Polyglot')) {
    voiceType = 'Polyglot';
  } else if (voiceName.includes('Studio')) {
    voiceType = 'Studio';
  }
  
  return `${voiceType} ${voiceId} (${gender === 'female' ? 'Female' : 'Male'})`;
}

// Set custom languages from Google TTS data
export function setCustomLanguages(languages: LanguageOption[]): void {
  if (languages && Array.isArray(languages) && languages.length > 0) {
    googleLanguagesCache = languages;
  }
}

// Set custom voices from Google TTS data
export function setCustomVoices(voices: any): void {
  if (voices && typeof voices === 'object') {
    googleVoicesCache = voices;
  }
}

// Get all available languages from Google TTS cache
export function getAllGoogleLanguages(): LanguageOption[] {
  return googleLanguagesCache || LANGUAGES;
}
