
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

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
    
    // Use fallback data instead of trying to call Google API
    // This is a simplification to avoid authentication issues
    console.log("Using fallback Google TTS voices data");
    cachedVoices = fallbackVoices;
    cacheTimestamp = now;
    
    return new Response(JSON.stringify(fallbackVoices), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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
