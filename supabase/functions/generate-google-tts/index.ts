
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
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request body format'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: validationError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing TTS request for "${text.substring(0, 50)}..." in language: ${language}, voice: ${voice}`);

    // Validate environment and get configuration
    let SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, credentials;
    try {
      const env = validateEnvironment();
      SUPABASE_URL = env.SUPABASE_URL;
      SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
      credentials = env.credentials;
    } catch (envError) {
      console.error("Environment validation error:", envError.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Server configuration error. Please contact support."
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client for storage and metadata
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user email for folder organization
    let userData;
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', user_id)
        .single();
        
      if (error) {
        console.warn("Warning: Couldn't fetch user email:", error.message);
      } else {
        userData = data;
      }
    } catch (userError) {
      console.warn("Error fetching user data:", userError);
      // Continue with fallback to user_id
    }
    
    // Generate a folder path based on user email or fallback to user ID
    const userEmail = userData?.email || user_id;
    const sanitizedUserIdentifier = userEmail.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    console.log("Getting access token for Google API");
    
    // Get access token using the credentials
    let accessToken;
    try {
      accessToken = await getGoogleAccessToken(credentials);
      console.log("Access token obtained successfully");
    } catch (tokenError) {
      console.error("Failed to get Google access token:", tokenError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to authenticate with Google TTS service." 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Generate speech from text
    let binaryAudio;
    try {
      binaryAudio = await generateSpeech(accessToken, text, language, voice);
      console.log(`Prepared ${binaryAudio.length} bytes of audio data`);
    } catch (speechError) {
      console.error("Error generating speech:", speechError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to generate speech: ${speechError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Create user folder path for storage
    const timestamp = new Date().toISOString();
    const sanitizedText = text.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${sanitizedText}_${language}_${timestamp}.mp3`;
    const filePath = `${sanitizedUserIdentifier}/${fileName}`;
    
    console.log(`Preparing to upload ${binaryAudio.length} bytes of audio to Supabase Storage`);
    
    // Check if the audio_files bucket exists, and create it if it doesn't
    try {
      const { data: buckets, error } = await supabaseAdmin
        .storage
        .listBuckets();
        
      if (error) {
        throw new Error(`Error listing buckets: ${error.message}`);
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === 'audio_files');
      
      if (!bucketExists) {
        console.log("Creating audio_files bucket as it doesn't exist");
        const { error: createError } = await supabaseAdmin
          .storage
          .createBucket('audio_files', { 
            public: true,
            fileSizeLimit: 52428800, // 50MB
          });
          
        if (createError) {
          throw new Error(`Error creating audio_files bucket: ${createError.message}`);
        }
        console.log("Successfully created audio_files bucket");
      }
    } catch (bucketError) {
      console.error("Bucket setup error:", bucketError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to setup storage. Please contact administrator." 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Upload to Supabase Storage
    let uploadData;
    try {
      const { data, error } = await supabaseAdmin
        .storage
        .from('audio_files')
        .upload(filePath, binaryAudio, {
          contentType: 'audio/mpeg',
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        throw new Error(`Error uploading to Supabase Storage: ${error.message}`);
      }
      
      uploadData = data;
      console.log("Successfully uploaded audio to Supabase Storage:", filePath);
    } catch (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to store generated audio. Please try again." 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Get the public URL for the uploaded file
    let publicUrl;
    try {
      const { data: publicUrlData } = supabaseAdmin
        .storage
        .from('audio_files')
        .getPublicUrl(filePath);
        
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to generate public URL for the uploaded file");
      }
      
      publicUrl = publicUrlData.publicUrl;
    } catch (urlError) {
      console.error("Error getting public URL:", urlError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to generate access URL for audio." 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Store metadata in Supabase
    try {
      const { error: metadataError } = await supabaseAdmin
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
    } catch (metadataError) {
      console.warn("Error storing metadata:", metadataError);
      // We don't fail the request if just metadata storage fails
    }
    
    return new Response(
      JSON.stringify({
        success: true, 
        audio_url: publicUrl,
        fileName: fileName,
        id: fileName // Return the filename as the ID for reference
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Unhandled error in generate-google-tts:", error);
    
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
