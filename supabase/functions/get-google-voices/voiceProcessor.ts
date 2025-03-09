
import { languageDisplayNames } from "./fallbackData.ts";

/**
 * Helper function to get language display name
 */
export function getLanguageDisplayName(code: string): string {
  return languageDisplayNames[code] || code;
}

/**
 * Process voices data into the required format
 */
export function processVoicesData(voicesResponse: any) {
  try {
    console.log(`Processing ${voicesResponse.voices.length} voices`);
    
    const voice_data: any = {};
    
    for (const voice of voicesResponse.voices) {
      for (const language_code of voice.languageCodes) {
        if (!voice_data[language_code]) {
          voice_data[language_code] = {
            display_name: getLanguageDisplayName(language_code),
            voices: { 'MALE': [], 'FEMALE': [], 'NEUTRAL': [] }
          };
        }

        // Determine gender category
        const gender = voice.ssmlGender;
        if (!gender) {
          console.warn(`Missing gender for voice: ${voice.name}`);
          continue;
        }
        
        const genderKey = gender === 'MALE' ? 'MALE' : 
                          gender === 'FEMALE' ? 'FEMALE' : 'NEUTRAL';
        
        // Add voice to appropriate gender category
        voice_data[language_code].voices[genderKey].push({
          name: voice.name,
          ssml_gender: voice.ssmlGender,
          // Add flag for premium voices
          is_premium: voice.name.includes('Studio') || 
                      voice.name.includes('Neural2') || 
                      voice.name.includes('Wavenet')
        });
      }
    }
    
    console.log(`Successfully processed ${Object.keys(voice_data).length} languages`);
    return voice_data;
  } catch (error) {
    console.error("Error processing voices data:", error);
    throw error;
  }
}
