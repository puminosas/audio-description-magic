
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import { getGoogleAccessToken } from "./auth.ts";
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
      credentials 
    } = validateEnvironment();

    // Initialize Supabase client for storage and metadata
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user email for folder organization
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', user_id)
      .single();
      
    if (userError) {
      console.warn("Warning: Couldn't fetch user email:", userError.message);
    }
    
    // Generate a folder path based on user email or fallback to user ID
    const userEmail = userData?.email || user_id;
    const sanitizedUserIdentifier = userEmail.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    console.log("Getting access token for Google API");
    // Get access token using the credentials
    const accessToken = await getGoogleAccessToken(credentials);
    console.log("Access token obtained successfully");
    
    // Generate speech from text
    const binaryAudio = await generateSpeech(accessToken, text, language, voice);
    console.log(`Prepared ${binaryAudio.length} bytes of audio data`);
    
    // Create user folder path for storage
    const timestamp = new Date().toISOString();
    const sanitizedText = text.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${sanitizedText}_${language}_${timestamp}.mp3`;
    const filePath = `${sanitizedUserIdentifier}/${fileName}`;
    
    console.log(`Preparing to upload ${binaryAudio.length} bytes of audio to Supabase Storage`);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('audio_files')
      .upload(filePath, binaryAudio, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      throw new Error(`Error uploading to Supabase Storage: ${uploadError.message}`);
    }
    
    console.log("Successfully uploaded audio to Supabase Storage:", filePath);
    
    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from('audio_files')
      .getPublicUrl(filePath);
      
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error("Failed to generate public URL for the uploaded file");
    }
    
    const publicUrl = publicUrlData.publicUrl;
    
    // Store metadata in Supabase
    const { data: metadataData, error: metadataError } = await supabaseAdmin
      .from('audio_files')
      .insert({
        user_id: user_id,
        file_name: fileName,
        file_path: filePath,
        storage_url: publicUrl,
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
    
    return new Response(
      JSON.stringify({
        success: true, 
        audio_url: publicUrl,
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
