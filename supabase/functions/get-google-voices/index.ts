
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import the Google Cloud Text-to-Speech library
import { TextToSpeechClient } from "https://esm.sh/@google-cloud/text-to-speech@4.2.1";

// Import fallback data
import { fallbackVoices, languageDisplayNames } from "./fallbackData.ts";

// Cache configuration
const CACHE_DURATION = 3600000; // 1 hour in milliseconds
let cachedVoices: any = null;
let cacheTimestamp: number = 0;

/**
 * Helper function to get language display name
 */
function getLanguageDisplayName(code: string): string {
  return languageDisplayNames[code] || code;
}

/**
 * Check if the cache is still valid
 */
function isCacheValid(): boolean {
  return cachedVoices !== null && (Date.now() - cacheTimestamp) < CACHE_DURATION;
}

/**
 * Create response with CORS headers
 */
function createResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Create error response with fallback data
 */
function createErrorResponse(error: string, message: string) {
  return createResponse({
    error,
    message,
    fallbackUsed: true,
    data: fallbackVoices
  });
}

/**
 * Validate request authentication
 */
function validateAuth(req: Request) {
  const apikey = req.headers.get('apikey');
  if (!apikey) {
    console.error("Missing apikey header");
    return false;
  }
  return true;
}

/**
 * Get Google Cloud credentials from environment
 */
function getGoogleCredentials() {
  const googleCredentials = Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON");
  if (!googleCredentials) {
    console.error("Google credentials not found in environment");
    return null;
  }
  
  try {
    return JSON.parse(googleCredentials);
  } catch (error) {
    console.error("Error parsing Google credentials:", error);
    return null;
  }
}

/**
 * Process voices data into the required format
 */
function processVoicesData(voicesResponse: any) {
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
  
  return voice_data;
}

/**
 * Fetch voices from Google TTS API
 */
async function fetchVoicesFromGoogle() {
  const credentials = getGoogleCredentials();
  if (!credentials) {
    throw new Error("Google credentials not configured");
  }
  
  const client = new TextToSpeechClient({ credentials });
  const [voicesResponse] = await client.listVoices({});
  
  if (!voicesResponse || !voicesResponse.voices || voicesResponse.voices.length === 0) {
    throw new Error("No voices returned from Google TTS API");
  }
  
  console.log(`Retrieved ${voicesResponse.voices.length} voices from Google TTS API`);
  
  return processVoicesData(voicesResponse);
}

/**
 * Update cache with new data
 */
function updateCache(data: any) {
  cachedVoices = data;
  cacheTimestamp = Date.now();
}

/**
 * Log request headers for debugging
 */
function logRequestHeaders(req: Request) {
  console.log("Request headers received:");
  for (const [key, value] of req.headers.entries()) {
    console.log(`${key}: ${value}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log request headers for debugging
    logRequestHeaders(req);

    // Validate authentication
    if (!validateAuth(req)) {
      return createErrorResponse("Unauthorized", "Missing apikey header");
    }

    // Check if we have a valid cache
    if (isCacheValid()) {
      console.log("Returning cached voices data");
      return createResponse(cachedVoices);
    }
    
    try {
      // Fetch voices from Google TTS API
      const voice_data = await fetchVoicesFromGoogle();
      
      // Update the cache
      updateCache(voice_data);
      
      console.log(`Successfully processed ${Object.keys(voice_data).length} languages from Google TTS`);
      
      return createResponse(voice_data);
      
    } catch (googleError) {
      console.error("Error fetching from Google TTS API:", googleError);
      
      // Return the fallback data with the error information
      return createErrorResponse(
        "Google TTS API error", 
        googleError.message
      );
    }
    
  } catch (error) {
    console.error("Unhandled error:", error);
    return createErrorResponse(
      "Internal server error", 
      error.message
    );
  }
});
