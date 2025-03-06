
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { validateTTSRequest, validateEnvironment } from "./validation.ts";
import { getGoogleAccessToken } from "./auth.ts";
import { generateSpeech } from "./tts.ts";
import { prepareUserStorage, uploadAudioToStorage, getPublicUrl, storeMetadata } from "./storage.ts";
import { handleRequestError, handleResponseError, createSuccessResponse } from "./response.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return handleRequestError('Invalid request body format', 400);
    }
    
    // Validate request data
    let text, language, voice, user_id;
    try {
      const validated = validateTTSRequest(requestData);
      text = validated.text;
      language = validated.language;
      voice = validated.voice;
      user_id = validated.user_id;
    } catch (validationError) {
      console.error("Validation error:", validationError.message);
      return handleRequestError(validationError.message, 400);
    }

    console.log(`Processing TTS request for "${text.substring(0, 50)}..." in language: ${language}, voice: ${voice}`);

    // Validate environment and get configuration
    let env;
    try {
      env = validateEnvironment();
    } catch (envError) {
      console.error("Environment validation error:", envError.message);
      return handleRequestError("Server configuration error. Please contact support.", 500);
    }

    // Get access token using the credentials
    let accessToken;
    try {
      accessToken = await getGoogleAccessToken(env.credentials);
      console.log("Access token obtained successfully");
    } catch (tokenError) {
      console.error("Failed to get Google access token:", tokenError);
      return handleRequestError("Failed to authenticate with Google TTS service.", 500);
    }
    
    // Generate speech from text
    let binaryAudio;
    try {
      binaryAudio = await generateSpeech(accessToken, text, language, voice);
      console.log(`Prepared ${binaryAudio.length} bytes of audio data`);
    } catch (speechError) {
      console.error("Error generating speech:", speechError);
      return handleResponseError(`Failed to generate speech: ${speechError.message}`);
    }
    
    // Initialize storage and prepare user folder information
    const { supabaseAdmin, filePath, fileName } = await prepareUserStorage(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, user_id, text);
    
    // Upload audio to storage
    let uploadData;
    try {
      uploadData = await uploadAudioToStorage(supabaseAdmin, filePath, binaryAudio);
      console.log("Successfully uploaded audio to Supabase Storage:", filePath);
    } catch (uploadError) {
      console.error("Storage upload error:", uploadError);
      return handleResponseError("Failed to store generated audio. Please try again.");
    }
    
    // Get the public URL for the uploaded file
    let publicUrl;
    try {
      publicUrl = getPublicUrl(supabaseAdmin, filePath);
    } catch (urlError) {
      console.error("Error getting public URL:", urlError);
      return handleResponseError("Failed to generate access URL for audio.");
    }
    
    // Store metadata in Supabase
    try {
      await storeMetadata(supabaseAdmin, {
        user_id,
        fileName,
        filePath,
        publicUrl,
        fileSize: binaryAudio.length,
        language,
        voice,
        textContent: text.substring(0, 1000)
      });
    } catch (metadataError) {
      console.warn("Error storing metadata:", metadataError);
      // We don't fail the request if just metadata storage fails
    }
    
    return createSuccessResponse(publicUrl, fileName);
    
  } catch (error) {
    console.error("Unhandled error in generate-google-tts:", error);
    return handleResponseError(error instanceof Error ? error.message : String(error));
  }
});
