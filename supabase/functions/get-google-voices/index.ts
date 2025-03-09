
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { validateAuth, createResponse, createErrorResponse, logRequestHeaders } from "./http.ts";
import { fetchVoicesFromGoogle } from "./googleApi.ts";
import { processVoicesData } from "./voiceProcessor.ts";
import { fallbackVoices } from "./fallbackData.ts";

serve(async (req) => {
  console.log("get-google-voices function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log request headers for debugging
    logRequestHeaders(req);

    // Validate authentication
    if (!validateAuth(req)) {
      return createErrorResponse("Unauthorized", "Missing apikey header", fallbackVoices);
    }
    
    try {
      console.log("Fetching voices from Google TTS API directly");
      
      // Fetch voices from Google TTS API
      const voicesResponse = await fetchVoicesFromGoogle();
      
      // Process the voice data
      const voice_data = processVoicesData(voicesResponse);
      
      console.log(`Successfully processed ${Object.keys(voice_data).length} languages from Google TTS`);
      
      return createResponse(voice_data);
      
    } catch (googleError) {
      console.error("Error fetching from Google TTS API:", googleError);
      
      // Return the fallback data with the error information
      return createErrorResponse(
        "Google TTS API error", 
        googleError instanceof Error ? googleError.message : String(googleError),
        fallbackVoices
      );
    }
    
  } catch (error) {
    console.error("Unhandled error:", error);
    return createErrorResponse(
      "Internal server error", 
      error instanceof Error ? error.message : String(error),
      fallbackVoices
    );
  }
});
