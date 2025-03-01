
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";
import OpenAI from "https://esm.sh/openai@4.8.0";

// Generate a random ID without external dependencies
function generateRandomId(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  return result;
}

// Configure CORS headers
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
    // Get request data
    const { text, language, voice } = await req.json();

    console.log(`Processing request: language=${language}, voice=${voice}`);
    console.log(`Text content: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);

    if (!text) {
      throw new Error('Text content is required');
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    if (!Deno.env.get('OPENAI_API_KEY')) {
      console.error('OPENAI_API_KEY is not set');
      throw new Error('OpenAI API key is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create storage bucket if it doesn't exist
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'user_files');
      
      if (!bucketExists) {
        console.log('Creating user_files bucket');
        await supabase.storage.createBucket('user_files', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
      }
    } catch (error) {
      console.error('Error creating or checking bucket:', error);
      // Continue anyway, might be permission issue or bucket already exists
    }

    // Generate speech from text using OpenAI
    console.log('Generating audio with OpenAI...');
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice || "alloy",
      input: text,
    });

    if (!response) {
      throw new Error('Failed to generate audio from OpenAI');
    }

    // Convert the response to an ArrayBuffer
    const audioBuffer = await response.arrayBuffer();
    
    // Generate a unique filename
    const fileName = `audio_${generateRandomId()}.mp3`;
    const filePath = `public/${fileName}`;
    
    console.log(`Uploading file: ${filePath}`);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('user_files')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload audio file: ${error.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('user_files')
      .getPublicUrl(filePath);

    console.log('Audio generation completed successfully');

    return new Response(
      JSON.stringify({
        id: fileName,
        audioUrl: filePath,
        text: text,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
