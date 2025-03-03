
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { TextToSpeechClient } from 'https://esm.sh/@google-cloud/text-to-speech@4.2.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get display name for language code
function getLanguageDisplayName(code: string): string {
  const languageNames: Record<string, string> = {
    'af-ZA': 'Afrikaans (South Africa)',
    'ar-XA': 'Arabic',
    'bn-IN': 'Bengali (India)',
    'bg-BG': 'Bulgarian (Bulgaria)',
    'ca-ES': 'Catalan (Spain)',
    'cs-CZ': 'Czech (Czech Republic)',
    'da-DK': 'Danish (Denmark)',
    'de-DE': 'German (Germany)',
    'el-GR': 'Greek (Greece)',
    'en-AU': 'English (Australia)',
    'en-GB': 'English (United Kingdom)',
    'en-IN': 'English (India)',
    'en-US': 'English (United States)',
    'es-ES': 'Spanish (Spain)',
    'es-US': 'Spanish (United States)',
    'fi-FI': 'Finnish (Finland)',
    'fil-PH': 'Filipino (Philippines)',
    'fr-CA': 'French (Canada)',
    'fr-FR': 'French (France)',
    'he-IL': 'Hebrew (Israel)',
    'hi-IN': 'Hindi (India)',
    'hu-HU': 'Hungarian (Hungary)',
    'id-ID': 'Indonesian (Indonesia)',
    'is-IS': 'Icelandic (Iceland)',
    'it-IT': 'Italian (Italy)',
    'ja-JP': 'Japanese (Japan)',
    'ko-KR': 'Korean (South Korea)',
    'lt-LT': 'Lithuanian (Lithuania)',
    'lv-LV': 'Latvian (Latvia)',
    'ms-MY': 'Malay (Malaysia)',
    'ml-IN': 'Malayalam (India)',
    'cmn-CN': 'Mandarin Chinese (China Mainland)',
    'cmn-TW': 'Mandarin Chinese (Taiwan)',
    'nb-NO': 'Norwegian (Norway)',
    'nl-NL': 'Dutch (Netherlands)',
    'pl-PL': 'Polish (Poland)',
    'pt-BR': 'Portuguese (Brazil)',
    'pt-PT': 'Portuguese (Portugal)',
    'ro-RO': 'Romanian (Romania)',
    'ru-RU': 'Russian (Russia)',
    'sk-SK': 'Slovak (Slovakia)',
    'sr-RS': 'Serbian (Serbia)',
    'sv-SE': 'Swedish (Sweden)',
    'ta-IN': 'Tamil (India)',
    'te-IN': 'Telugu (India)',
    'th-TH': 'Thai (Thailand)',
    'tr-TR': 'Turkish (Turkey)',
    'uk-UA': 'Ukrainian (Ukraine)',
    'vi-VN': 'Vietnamese (Vietnam)',
    'yue-HK': 'Cantonese (Hong Kong)',
  };

  return languageNames[code] || code;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching Google TTS voices...');

    // Create client with credentials from environment variables
    const client = new TextToSpeechClient();
    
    // List all available voices
    const [response] = await client.listVoices({});
    
    // Organize voices by language code
    const voicesByLanguage: Record<string, {
      display_name: string,
      voices: {
        MALE: any[],
        FEMALE: any[],
        NEUTRAL: any[]
      }
    }> = {};

    response.voices?.forEach(voice => {
      voice.languageCodes?.forEach(langCode => {
        if (!voicesByLanguage[langCode]) {
          voicesByLanguage[langCode] = {
            display_name: getLanguageDisplayName(langCode),
            voices: {
              MALE: [],
              FEMALE: [],
              NEUTRAL: []
            }
          };
        }

        if (voice.ssmlGender) {
          const genderKey = voice.ssmlGender.toString();
          
          // Add voice to the appropriate gender category
          if (['MALE', 'FEMALE', 'NEUTRAL'].includes(genderKey)) {
            voicesByLanguage[langCode].voices[genderKey as 'MALE' | 'FEMALE' | 'NEUTRAL'].push({
              name: voice.name,
              ssml_gender: genderKey
            });
          }
        }
      });
    });

    console.log(`Successfully fetched voices for ${Object.keys(voicesByLanguage).length} languages`);

    return new Response(JSON.stringify(voicesByLanguage), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching Google TTS voices:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch Google TTS voices' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
