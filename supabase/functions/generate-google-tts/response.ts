
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Handle request validation errors
 */
export function handleRequestError(message: string, status = 400) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: message 
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Handle response processing errors
 */
export function handleResponseError(errorMessage: string, status = 500) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Create a success response with the audio URL
 */
export function createSuccessResponse(publicUrl: string, fileName: string) {
  return new Response(
    JSON.stringify({
      success: true, 
      audio_url: publicUrl,
      fileName: fileName,
      id: fileName // Return the filename as the ID for reference
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
