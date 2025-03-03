
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleAuth } from 'https://esm.sh/google-auth-library@8.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Cache object to store voices data (will reset when function is redeployed)
let voicesCache: any = null;
let lastCacheTime = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const currentTime = Date.now();
    
    // Return cached voices if available and not expired
    if (voicesCache && (currentTime - lastCacheTime < CACHE_DURATION)) {
      return new Response(
        JSON.stringify(voicesCache),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Google Auth client
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();

    // Get voices from Google TTS API
    const response = await client.request({
      url: 'https://texttospeech.googleapis.com/v1/voices',
      method: 'GET',
    });

    if (!response.data || !response.data.voices) {
      throw new Error('Failed to fetch voices from Google TTS API');
    }

    // Process voices into structured format
    const voices = response.data.voices;
    const voiceData: Record<string, any> = {};
    
    for (const voice of voices) {
      for (const languageCode of voice.languageCodes) {
        if (!voiceData[languageCode]) {
          voiceData[languageCode] = {
            display_name: getLanguageDisplayName(languageCode),
            voices: { MALE: [], FEMALE: [] }
          };
        }

        const voiceInfo = {
          name: voice.name,
          ssml_gender: voice.ssmlGender
        };

        if (voice.ssmlGender === 'MALE' || voice.ssmlGender === 'FEMALE') {
          voiceData[languageCode].voices[voice.ssmlGender].push(voiceInfo);
        }
      }
    }

    // Update cache
    voicesCache = voiceData;
    lastCacheTime = currentTime;

    return new Response(
      JSON.stringify(voiceData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } 
  catch (error) {
    console.error('Error fetching voices:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch voices' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to get language display name
function getLanguageDisplayName(languageCode: string): string {
  const languageNames: Record<string, string> = {
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'fr-FR': 'French',
    'de-DE': 'German',
    'es-ES': 'Spanish',
    'it-IT': 'Italian',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'pt-BR': 'Portuguese (Brazil)',
    'ru-RU': 'Russian',
    'zh-CN': 'Chinese (Simplified)',
    // Add more languages as needed
  };

  return languageNames[languageCode] || languageCode;
}
