
import { TextToSpeechClient } from "https://esm.sh/@google-cloud/text-to-speech@4.2.1";

/**
 * Get Google Cloud credentials from environment
 */
export function getGoogleCredentials() {
  try {
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
  } catch (error) {
    console.error("Error accessing Google credentials:", error);
    return null;
  }
}

/**
 * Fetch voices from Google TTS API
 */
export async function fetchVoicesFromGoogle() {
  try {
    console.log("Starting to fetch voices from Google TTS API");
    
    const credentials = getGoogleCredentials();
    if (!credentials) {
      throw new Error("Google credentials not configured");
    }
    
    console.log("Creating TextToSpeechClient...");
    
    // Use no caching for listVoices to ensure we get the full, current list
    const client = new TextToSpeechClient({ 
      credentials,
      // Set higher timeout to handle larger response
      timeout: 60000 // Increase timeout to 60 seconds
    });
    
    console.log("TextToSpeechClient created, calling listVoices...");
    
    // Request without any filters to get ALL voices
    const [voicesResponse] = await client.listVoices({});
    
    console.log("listVoices call completed");
    
    if (!voicesResponse || !voicesResponse.voices || voicesResponse.voices.length === 0) {
      throw new Error("No voices returned from Google TTS API");
    }
    
    console.log(`Retrieved ${voicesResponse.voices.length} voices from Google TTS API`);
    
    return voicesResponse;
  } catch (error) {
    console.error("Error fetching from Google TTS API:", error);
    throw error;
  }
}
