
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TextToSpeechClient } from "https://googleapis.deno.dev/v1/texttospeech:v1beta1.ts";
import { Storage } from "https://googleapis.deno.dev/v1/storage:v1.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request body
    const { text, language, voice, user_id } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load Google credentials from environment
    const googleCredentials = JSON.parse(Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON") || "{}");
    const bucketName = Deno.env.get("GCS_BUCKET_NAME") || "";
    const projectId = Deno.env.get("GCS_PROJECT_ID") || "";
    
    if (!googleCredentials.client_email || !bucketName || !projectId) {
      console.error("Missing required Google Cloud credentials");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create TTS client
    const ttsClient = new TextToSpeechClient({ credentials: googleCredentials });

    // Create TTS request
    const ttsRequest = {
      input: { text },
      voice: {
        languageCode: language || 'en-US',
        name: voice || 'en-US-Wavenet-A',
      },
      audioConfig: { audioEncoding: 'MP3' },
    };

    console.log(`Generating TTS for "${text.substring(0, 30)}..." in ${language} with voice ${voice}`);

    // Generate speech
    const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
    
    if (!ttsResponse.audioContent) {
      console.error("No audio content returned from Google TTS");
      return new Response(
        JSON.stringify({ error: 'Failed to generate audio' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user folder if it doesn't exist
    const userFolderPath = `audio/${user_id}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}-${language}-${voice.split('-').pop()}.mp3`;
    const filePath = `${userFolderPath}/${fileName}`;

    // Create Storage client
    const storageClient = new Storage({ credentials: googleCredentials });
    
    // Check if bucket exists
    try {
      await storageClient.buckets.get({ bucket: bucketName });
    } catch (error) {
      console.error(`Bucket ${bucketName} not found:`, error);
      return new Response(
        JSON.stringify({ error: 'Storage bucket not available' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload the audio file
    const fileContent = ttsResponse.audioContent;
    
    try {
      const file = await storageClient.objects.insert({
        bucket: bucketName,
        name: filePath,
        media: {
          body: fileContent,
          mimeType: 'audio/mp3',
        },
        predefinedAcl: 'publicRead',
      });
      
      console.log(`File uploaded to: ${filePath}`);
      
      // Generate public URL
      const audioUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
      const folderUrl = `https://console.cloud.google.com/storage/browser/${bucketName}/${userFolderPath}`;
      
      // Save file to Supabase (optional)
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          await supabase.from('user_audio_files').insert({
            user_id,
            file_name: fileName,
            file_path: filePath,
            text,
            language,
            voice,
            audio_url: audioUrl,
            folder_url: folderUrl
          });
          
          console.log('File metadata saved to Supabase');
        }
      } catch (dbError) {
        console.error('Error saving file metadata to Supabase:', dbError);
        // Continue even if Supabase save fails
      }
      
      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          audio_url: audioUrl,
          folder_url: folderUrl 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (uploadError) {
      console.error('Error uploading file to GCS:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload audio file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error in TTS generation:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process TTS request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
