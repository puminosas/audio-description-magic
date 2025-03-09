
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import the Google Cloud Text-to-Speech library
import { TextToSpeechClient } from "https://esm.sh/@google-cloud/text-to-speech@4.2.1";

// Cache the voices to avoid repeatedly fetching them
let cachedVoices: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Fallback data in case the Google API is unavailable
const fallbackVoices = {
  "en-US": {
    display_name: "English (US)",
    voices: {
      MALE: [
        { name: "en-US-Standard-A", ssml_gender: "MALE" },
        { name: "en-US-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "en-US-Standard-C", ssml_gender: "FEMALE" },
        { name: "en-US-Standard-E", ssml_gender: "FEMALE" }
      ]
    }
  },
  "en-GB": {
    display_name: "English (UK)",
    voices: {
      MALE: [
        { name: "en-GB-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "en-GB-Standard-A", ssml_gender: "FEMALE" }
      ]
    }
  },
  "es-ES": {
    display_name: "Spanish (Spain)",
    voices: {
      MALE: [
        { name: "es-ES-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "es-ES-Standard-A", ssml_gender: "FEMALE" }
      ]
    }
  },
  "fr-FR": {
    display_name: "French (France)",
    voices: {
      MALE: [
        { name: "fr-FR-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "fr-FR-Standard-A", ssml_gender: "FEMALE" }
      ]
    }
  },
  "de-DE": {
    display_name: "German (Germany)",
    voices: {
      MALE: [
        { name: "de-DE-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "de-DE-Standard-A", ssml_gender: "FEMALE" }
      ]
    }
  }
};

// Helper function to get language display name
function getLanguageDisplayName(code: string): string {
  const languages: Record<string, string> = {
    "en-US": "English (US)",
    "en-GB": "English (UK)",
    "es-ES": "Spanish (Spain)",
    "fr-FR": "French (France)",
    "de-DE": "German (Germany)",
    // Add other languages as needed
  };
  return languages[code] || code;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log all request headers for debugging
    console.log("Request headers received:");
    for (const [key, value] of req.headers.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Check if we have the apikey header
    const apikey = req.headers.get('apikey');
    if (!apikey) {
      console.error("Missing apikey header");
      return new Response(
        JSON.stringify({ 
          error: "Unauthorized", 
          message: "Missing apikey header",
          fallbackUsed: true,
          data: fallbackVoices 
        }), 
        { 
          status: 200, // Return 200 but with error information 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const now = Date.now();
    
    // Check if we have a valid cache
    if (cachedVoices && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log("Returning cached voices data");
      return new Response(JSON.stringify(cachedVoices), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get Google credentials from Supabase secrets
    const googleCredentials = Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON");
    
    if (!googleCredentials) {
      console.error("Google credentials not found in environment");
      return new Response(JSON.stringify({
        error: "Configuration error",
        message: "Google credentials not configured",
        fallbackUsed: true,
        data: fallbackVoices
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    try {
      // Parse credentials and create client
      const credentials = JSON.parse(googleCredentials);
      const client = new TextToSpeechClient({ credentials });
      
      // Fetch all available voices from Google TTS
      const [result] = await client.listVoices({});
      
      if (!result || !result.voices || result.voices.length === 0) {
        throw new Error("No voices returned from Google TTS API");
      }
      
      // Process the voices into our required format
      const voice_data: any = {};
      
      for (const voice of result.voices) {
        for (const language_code of voice.languageCodes) {
          if (!voice_data[language_code]) {
            voice_data[language_code] = {
              display_name: getLanguageDisplayName(language_code),
              voices: { 'MALE': [], 'FEMALE': [] }
            };
          }

          // Determine gender category
          const gender = voice.ssmlGender === 'MALE' ? 'MALE' : 
                         voice.ssmlGender === 'FEMALE' ? 'FEMALE' : null;
          
          if (gender) {
            voice_data[language_code].voices[gender].push({
              name: voice.name,
              ssml_gender: voice.ssmlGender
            });
          }
        }
      }
      
      // Update the cache
      cachedVoices = voice_data;
      cacheTimestamp = now;
      
      console.log(`Successfully fetched ${Object.keys(voice_data).length} languages from Google TTS`);
      
      return new Response(JSON.stringify(voice_data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } catch (googleError) {
      console.error("Error fetching from Google TTS API:", googleError);
      
      // Return the fallback data with the error information
      return new Response(JSON.stringify({
        error: "Google TTS API error",
        message: googleError.message,
        fallbackUsed: true,
        data: fallbackVoices
      }), {
        status: 200, // Return 200 with fallback data
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message,
      fallbackUsed: true,
      data: fallbackVoices
    }), {
      status: 200, // Return 200 but with error information
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
