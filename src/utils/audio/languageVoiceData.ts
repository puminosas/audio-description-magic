
import { LanguageOption, VoiceOption } from './types';

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
  if (!googleLanguagesCache || googleLanguagesCache.length === 0) {
    throw new Error('No language options available. Google TTS API may be unavailable.');
  }
  return googleLanguagesCache;
}

// Function to get voices based on language code
export function getVoicesForLanguage(languageCode: string): VoiceOption[] {
  if (!googleVoicesCache || !googleVoicesCache[languageCode]) {
    throw new Error(`No voices available for language: ${languageCode}. Google TTS API may be unavailable.`);
  }
  
  const languageData = googleVoicesCache[languageCode];
  
  if (!languageData.voices || (!languageData.voices.MALE.length && !languageData.voices.FEMALE.length)) {
    throw new Error(`No voices found for language: ${languageCode}. Google TTS API may be unavailable.`);
  }
  
  // Combine all gender voices into a single array
  return [
    ...(languageData.voices.MALE || []),
    ...(languageData.voices.FEMALE || [])
  ];
}

// Function to get available voices for a language
export function getAvailableVoices(languageCode: string): VoiceOption[] {
  return getVoicesForLanguage(languageCode);
}

// Function to fetch and store Google TTS voices
export const fetchAndStoreGoogleVoices = async (): Promise<void> => {
  try {
    console.log('Fetching Google TTS voices from Edge Function...');
    // Call our Edge Function to get voices
    const response = await fetch('https://cttaphbzhmheecbqhtjj.supabase.co/functions/v1/get-google-voices');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch Google voices: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch Google voices: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      throw new Error('Invalid or empty response from Google TTS API');
    }
    
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
  } catch (error) {
    console.error('Error fetching Google voices:', error);
    // Don't set any fallback data - let error propagate
    throw error;
  }
};

// Function to initialize Google voices
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
  if (!googleLanguagesCache || googleLanguagesCache.length === 0) {
    throw new Error('No language options available. Google TTS API may be unavailable.');
  }
  return googleLanguagesCache;
}
