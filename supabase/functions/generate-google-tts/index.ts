
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { TextToSpeechClient } from 'https://esm.sh/@google-cloud/text-to-speech@4.2.2';
import { Storage } from 'https://esm.sh/@google-cloud/storage@6.11.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language, voice, user_id } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    if (!language) {
      throw new Error('Language is required');
    }

    if (!voice) {
      throw new Error('Voice is required');
    }

    if (!user_id) {
      throw new Error('User ID is required');
    }

    console.log(`Generating audio for language: ${language}, voice: ${voice}`);

    // Create TTS client
    const client = new TextToSpeechClient();

    // Set the text input to be synthesized
    const request = {
      input: { text },
      // Select the language and voice
      voice: {
        languageCode: language.substring(0, 5), // Extract the language code part (e.g., "en-US")
        name: voice,
      },
      // Select the type of audio encoding
      audioConfig: { audioEncoding: 'MP3' },
    };

    // Generate speech
    const [response] = await client.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      throw new Error('Failed to generate audio content');
    }

    // Create a unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `tts-${user_id.substring(0, 8)}-${timestamp}.mp3`;
    
    // Initialize Storage
    const storage = new Storage();
    const bucketName = Deno.env.get('GCS_BUCKET_NAME');
    
    if (!bucketName) {
      throw new Error('GCS_BUCKET_NAME environment variable is not set');
    }
    
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(`audio/${filename}`);
    
    // Upload the audio file
    await file.save(response.audioContent as Buffer, {
      contentType: 'audio/mpeg',
      public: true,
    });
    
    // Get the public URL
    const audioUrl = `https://storage.googleapis.com/${bucketName}/audio/${filename}`;
    
    console.log(`Audio generated successfully. URL: ${audioUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        audio_url: audioUrl, 
        text: text
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating Google TTS audio:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to generate audio' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
