
// Import required libraries
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { Storage } from 'https://esm.sh/@google-cloud/storage@7.0.0';
import { TextToSpeechClient } from 'https://esm.sh/@google-cloud/text-to-speech@4.2.2';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Generate Google TTS function called');
    
    // Get request body
    const { text, language, voice, user_id } = await req.json();
    
    // Validate required fields
    if (!text) {
      throw new Error('Text content is required');
    }
    
    if (!language) {
      throw new Error('Language code is required');
    }
    
    if (!voice) {
      throw new Error('Voice ID is required');
    }
    
    if (!user_id) {
      throw new Error('User ID is required for storage');
    }
    
    console.log(`Processing TTS request for language: ${language}, voice: ${voice}`);

    // Initialize Google Cloud clients
    const ttsClient = new TextToSpeechClient({
      credentials: JSON.parse(Deno.env.get('GOOGLE_APPLICATION_CREDENTIALS_JSON') || '{}'),
    });
    
    // Set up the TTS request
    const request = {
      input: { text },
      voice: {
        languageCode: language,
        name: voice,
      },
      audioConfig: { audioEncoding: 'MP3' },
    };
    
    console.log('Sending request to Google TTS API');
    // Make the TTS API call
    const [response] = await ttsClient.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      throw new Error('Failed to generate audio content');
    }
    
    console.log('TTS generation successful, preparing to store audio');
    
    // Initialize Storage client
    const storage = new Storage({
      credentials: JSON.parse(Deno.env.get('GOOGLE_APPLICATION_CREDENTIALS_JSON') || '{}'),
    });
    
    // Get the bucket name from environment variable
    const bucketName = Deno.env.get('GCS_BUCKET_NAME');
    if (!bucketName) {
      throw new Error('GCS_BUCKET_NAME environment variable is required');
    }
    
    // Create a unique filename based on timestamp and user
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `audio/${user_id}/${timestamp}-tts.mp3`;
    
    // Get the bucket
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    
    // Upload the audio content
    try {
      await file.save(response.audioContent, {
        metadata: {
          contentType: 'audio/mpeg',
          metadata: {
            user_id,
            language,
            voice,
          },
        },
      });
      
      console.log('Audio file uploaded successfully');
      
      // Make the file publicly accessible
      await file.makePublic();
      
      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      
      return new Response(
        JSON.stringify({
          success: true,
          audio_url: publicUrl,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    } catch (uploadError) {
      console.error('Error uploading to Google Cloud Storage:', uploadError);
      
      // Fall back to base64 encoding for direct response if storage fails
      console.log('Fallback to base64 encoded audio');
      
      const base64Audio = btoa(
        new Uint8Array(response.audioContent).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      
      const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;
      
      return new Response(
        JSON.stringify({
          success: true,
          audio_url: audioDataUrl,
          is_data_url: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }
  } catch (error) {
    console.error('Error in generate-google-tts:', error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
