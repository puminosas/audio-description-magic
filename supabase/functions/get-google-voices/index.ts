
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TextToSpeechClient } from "https://googleapis.deno.dev/v1/texttospeech:v1beta1.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to get human-readable language names
function getLanguageDisplayName(languageCode: string): string {
  const languages: Record<string, string> = {
    'af-ZA': 'Afrikaans (South Africa)',
    'ar-XA': 'Arabic',
    'bg-BG': 'Bulgarian (Bulgaria)',
    'bn-IN': 'Bengali (India)',
    'ca-ES': 'Catalan (Spain)',
    'cs-CZ': 'Czech (Czech Republic)',
    'da-DK': 'Danish (Denmark)',
    'de-DE': 'German (Germany)',
    'el-GR': 'Greek (Greece)',
    'en-AU': 'English (Australia)',
    'en-GB': 'English (UK)',
    'en-IN': 'English (India)',
    'en-US': 'English (US)',
    'es-ES': 'Spanish (Spain)',
    'es-US': 'Spanish (US)',
    'fi-FI': 'Finnish (Finland)',
    'fil-PH': 'Filipino (Philippines)',
    'fr-CA': 'French (Canada)',
    'fr-FR': 'French (France)',
    'he-IL': 'Hebrew (Israel)',
    'hi-IN': 'Hindi (India)',
    'hu-HU': 'Hungarian (Hungary)',
    'id-ID': 'Indonesian (Indonesia)',
    'it-IT': 'Italian (Italy)',
    'ja-JP': 'Japanese (Japan)',
    'ko-KR': 'Korean (South Korea)',
    'lt-LT': 'Lithuanian (Lithuania)',
    'lv-LV': 'Latvian (Latvia)',
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
    'th-TH': 'Thai (Thailand)',
    'tr-TR': 'Turkish (Turkey)',
    'uk-UA': 'Ukrainian (Ukraine)',
    'vi-VN': 'Vietnamese (Vietnam)',
    'zh-CN': 'Chinese (Simplified, China)',
    'zh-HK': 'Chinese (Hong Kong)',
    'zh-TW': 'Chinese (Traditional, Taiwan)',
  };
  
  return languages[languageCode] || languageCode;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Load Google credentials from environment
    const googleCredentials = JSON.parse(Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON") || "{}");
    
    if (!googleCredentials.client_email) {
      console.error("Missing required Google Cloud credentials");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create TTS client
    const ttsClient = new TextToSpeechClient({ credentials: googleCredentials });

    // Get all voices
    const [response] = await ttsClient.listVoices({});
    
    if (!response.voices) {
      return new Response(
        JSON.stringify({ error: 'No voices returned from Google TTS API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Organize voices by language code
    const voicesByLanguage: Record<string, any> = {};
    
    response.voices.forEach(voice => {
      if (!voice.languageCodes || !voice.languageCodes.length) return;
      
      const languageCode = voice.languageCodes[0];
      if (!voicesByLanguage[languageCode]) {
        voicesByLanguage[languageCode] = {
          display_name: getLanguageDisplayName(languageCode),
          voices: {
            MALE: [],
            FEMALE: []
          }
        };
      }
      
      // Add voice to appropriate gender category
      if (voice.ssmlGender === 'MALE' || voice.ssmlGender === 'FEMALE') {
        voicesByLanguage[languageCode].voices[voice.ssmlGender].push({
          name: voice.name,
          ssml_gender: voice.ssmlGender
        });
      }
    });

    return new Response(
      JSON.stringify(voicesByLanguage),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error fetching Google TTS voices:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch voices' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
