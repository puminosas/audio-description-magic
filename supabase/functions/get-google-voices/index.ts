
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { TextToSpeechClient } from 'https://esm.sh/@google-cloud/text-to-speech@4.2.2';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to get the display name of a language
function getLanguageDisplayName(languageCode: string) {
  const languageNames: Record<string, string> = {
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'en-AU': 'English (Australia)',
    'fr-FR': 'French',
    'de-DE': 'German',
    'it-IT': 'Italian',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'pt-BR': 'Portuguese (Brazil)',
    'es-ES': 'Spanish',
    'es-US': 'Spanish (US)',
    'zh-CN': 'Chinese (Mandarin)',
    'ru-RU': 'Russian',
    'nl-NL': 'Dutch',
    'hi-IN': 'Hindi',
    'ar-XA': 'Arabic',
    // Add more as needed
  };

  return languageNames[languageCode] || languageCode;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Fetching available Google TTS voices');
    
    // Create a client
    const client = new TextToSpeechClient({
      credentials: JSON.parse(Deno.env.get('GOOGLE_APPLICATION_CREDENTIALS_JSON') || '{}'),
    });

    // List all available voices
    const [response] = await client.listVoices({});
    const voices = response.voices || [];

    // Organize voices by language code and gender
    const voiceData: Record<string, any> = {};

    voices.forEach((voice) => {
      for (const languageCode of voice.languageCodes || []) {
        if (!voiceData[languageCode]) {
          voiceData[languageCode] = {
            display_name: getLanguageDisplayName(languageCode),
            voices: { MALE: [], FEMALE: [], NEUTRAL: [] }
          };
        }

        // Only include WaveNet and Neural2 voices which are higher quality
        const isHighQuality = voice.name!.includes('Wavenet') || 
                              voice.name!.includes('Neural2') ||
                              voice.name!.includes('Studio');
        
        if (isHighQuality) {
          const gender = voice.ssmlGender || 'NEUTRAL';
          
          voiceData[languageCode].voices[gender].push({
            name: voice.name,
            ssml_gender: gender
          });
        }
      }
    });

    // Filter out languages with no voices
    const filteredVoiceData: Record<string, any> = {};
    for (const [languageCode, data] of Object.entries(voiceData)) {
      const hasVoices = Object.values(data.voices).some((voiceList: any) => voiceList.length > 0);
      if (hasVoices) {
        filteredVoiceData[languageCode] = data;
      }
    }

    console.log(`Retrieved ${Object.keys(filteredVoiceData).length} languages with high-quality voices`);
    
    return new Response(
      JSON.stringify(filteredVoiceData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error fetching Google voices:', error);
    
    // Return a fallback for common languages/voices
    const fallbackVoices = {
      'en-US': {
        display_name: 'English (US)',
        voices: {
          MALE: [{ name: 'en-US-Wavenet-A', ssml_gender: 'MALE' }],
          FEMALE: [{ name: 'en-US-Wavenet-C', ssml_gender: 'FEMALE' }],
          NEUTRAL: []
        }
      },
      'en-GB': {
        display_name: 'English (UK)',
        voices: {
          MALE: [{ name: 'en-GB-Wavenet-B', ssml_gender: 'MALE' }],
          FEMALE: [{ name: 'en-GB-Wavenet-A', ssml_gender: 'FEMALE' }],
          NEUTRAL: []
        }
      },
      'fr-FR': {
        display_name: 'French',
        voices: {
          MALE: [{ name: 'fr-FR-Wavenet-B', ssml_gender: 'MALE' }],
          FEMALE: [{ name: 'fr-FR-Wavenet-A', ssml_gender: 'FEMALE' }],
          NEUTRAL: []
        }
      },
      'es-ES': {
        display_name: 'Spanish',
        voices: {
          MALE: [{ name: 'es-ES-Wavenet-B', ssml_gender: 'MALE' }],
          FEMALE: [{ name: 'es-ES-Wavenet-A', ssml_gender: 'FEMALE' }],
          NEUTRAL: []
        }
      }
    };
    
    return new Response(
      JSON.stringify(fallbackVoices),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Still return 200 with fallback data
      },
    );
  }
});
