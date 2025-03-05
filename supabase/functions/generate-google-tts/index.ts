
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import { getGoogleAccessToken } from "./auth.ts";
import { uploadToGoogleStorage } from "./storage.ts";
import { generateSpeech } from "./tts.ts";
import { validateTTSRequest, validateEnvironment } from "./validation.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    const requestData = await req.json();
    
    // Validate request data
    const { text, language, voice, user_id } = validateTTSRequest(requestData);

    console.log(`Processing TTS request for "${text.substring(0, 50)}..." in language: ${language}, voice: ${voice}`);

    // Validate environment and get configuration
    const { 
      SUPABASE_URL, 
      SUPABASE_SERVICE_ROLE_KEY, 
      GOOGLE_STORAGE_BUCKET, 
      credentials 
    } = validateEnvironment();

    // Initialize Supabase client for metadata storage
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    console.log("Getting access token for Google API");
    // Get access token using the credentials
    const accessToken = await getGoogleAccessToken(credentials);
    console.log("Access token obtained successfully");
    
    // Generate speech from text
    const binaryAudio = await generateSpeech(accessToken, text, language, voice);
    console.log(`Prepared ${binaryAudio.length} bytes of audio data`);
    
    // Create user folder path for storage
    const userFolderPath = `audio-files/${user_id}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedText = text.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${sanitizedText}_${language}_${timestamp}.mp3`;
    const filePath = `${userFolderPath}/${fileName}`;
    
    console.log(`Preparing to upload ${binaryAudio.length} bytes of audio to Google Cloud Storage`);
    
    // Upload to Google Cloud Storage
    const uploadResult = await uploadToGoogleStorage(
      accessToken,
      GOOGLE_STORAGE_BUCKET,
      filePath,
      binaryAudio,
      'audio/mpeg'
    );
    
    console.log("Successfully uploaded audio to Google Cloud Storage:", uploadResult.publicUrl);
    
    // Store metadata in Supabase
    const { data: metadataData, error: metadataError } = await supabaseAdmin
      .from('audio_files')
      .insert({
        user_id: user_id,
        file_name: fileName,
        file_path: filePath,
        google_storage_url: uploadResult.publicUrl,
        file_size: binaryAudio.length,
        language: language,
        voice: voice,
        text_content: text.substring(0, 1000) // Storing first 1000 chars to keep metadata reasonable
      });
      
    if (metadataError) {
      console.warn("Warning: Failed to store file metadata in Supabase:", metadataError);
      // Continue even if metadata storage fails
    } else {
      console.log("Stored file metadata in Supabase");
    }
    
    const folderUrl = `https://storage.googleapis.com/${GOOGLE_STORAGE_BUCKET}/${userFolderPath}`;
    
    return new Response(
      JSON.stringify({
        success: true, 
        audio_url: uploadResult.publicUrl,
        folder_url: folderUrl,
        fileName: fileName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in generate-google-tts:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
