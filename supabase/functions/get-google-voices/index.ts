
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { TextToSpeechClient } from 'https://esm.sh/@google-cloud/text-to-speech@4.2.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get Google Cloud credentials from environment variable
    const credentials = JSON.parse(Deno.env.get('GOOGLE_APPLICATION_CREDENTIALS_JSON') || '{}');
    
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error('Missing or invalid Google Cloud credentials');
    }
    
    // Initialize the Text-to-Speech client
    const client = new TextToSpeechClient({ credentials });
    
    // List all available voices
    const [result] = await client.listVoices({});
    const voices = result.voices || [];
    
    // Process voices and organize by language code
    const languageVoiceMap = {};
    
    voices.forEach(voice => {
      // A voice can support multiple language codes
      voice.languageCodes?.forEach(languageCode => {
        if (!languageVoiceMap[languageCode]) {
          languageVoiceMap[languageCode] = {
            male: [],
            female: [],
            neutral: []
          };
        }
        
        // Extract voice name and gender
        const voiceObj = {
          id: voice.name,
          name: voice.name?.replace(`${languageCode}-`, '').replace('Wavenet-', 'Wavenet ').replace('Standard-', 'Standard '),
          gender: voice.ssmlGender?.toLowerCase() || 'neutral'
        };
        
        // Add to the appropriate gender category
        if (voice.ssmlGender === 'MALE') {
          languageVoiceMap[languageCode].male.push(voiceObj);
        } else if (voice.ssmlGender === 'FEMALE') {
          languageVoiceMap[languageCode].female.push(voiceObj);
        } else {
          languageVoiceMap[languageCode].neutral.push(voiceObj);
        }
      });
    });
    
    // Get language names
    const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
    
    // Create final data structure with language details
    const languageData = Object.keys(languageVoiceMap).map(code => {
      try {
        const nativeName = new Intl.DisplayNames([code.split('-')[0]], { type: 'language' })
          .of(code.split('-')[0]) || '';
        
        return {
          id: code,
          code: code,
          name: languageNames.of(code.split('-')[0]) + (code.includes('-') ? ` (${code.split('-')[1]})` : ''),
          nativeText: nativeName,
          nativeName: nativeName,
          voices: {
            male: languageVoiceMap[code].male,
            female: languageVoiceMap[code].female,
            neutral: languageVoiceMap[code].neutral
          }
        };
      } catch (e) {
        // Fallback if Intl.DisplayNames fails
        return {
          id: code,
          code: code,
          name: code,
          nativeText: code,
          nativeName: code,
          voices: languageVoiceMap[code]
        };
      }
    });
    
    // Sort languages alphabetically by name
    languageData.sort((a, b) => a.name.localeCompare(b.name));
    
    return new Response(
      JSON.stringify({ data: languageData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error fetching voices:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
