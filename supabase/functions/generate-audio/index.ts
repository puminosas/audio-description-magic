
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";
import OpenAI from "https://esm.sh/openai@4.8.0";

// Set up CORS headers for browsers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS requests for CORS preflight
const handleOptionsRequest = () => {
  return new Response(null, { headers: corsHeaders });
};

// Generate a random string without external dependencies
function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const random = new Uint8Array(length);
  crypto.getRandomValues(random);
  for (let i = 0; i < length; i++) {
    result += chars.charAt(random[i] % chars.length);
  }
  return result;
}

// Create OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!,
});

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create or ensure storage bucket exists
async function ensureStorageBucketExists() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const audioBucketExists = buckets?.some(bucket => bucket.name === 'audio-files');
    
    if (!audioBucketExists) {
      console.log('Creating audio-files bucket');
      const { error } = await supabase.storage.createBucket('audio-files', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
}

// Handle the actual request
const handleRequest = async (req: Request) => {
  try {
    const { productName, language = 'en', voice = 'alloy' } = await req.json();
    console.log(`Generating audio for: "${productName}" in language: ${language} with voice: ${voice}`);
    
    if (!productName || productName.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Product name is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Ensure storage bucket exists
    await ensureStorageBucketExists();
    
    // Generate a product description based on the product name
    const description = productName; // For now, we're just using the product name as is

    // Generate audio with OpenAI
    const audioResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: description,
    });
    
    // Get audio data as buffer
    const audioData = await audioResponse.arrayBuffer();
    console.log(`Audio generated successfully, size: ${audioData.byteLength} bytes`);
    
    // Generate unique filename with language and voice information
    const timestamp = new Date().toISOString().replace(/[-:.Z]/g, '');
    const randomString = generateRandomString(6);
    const filename = `audio_${language}_${voice}_${timestamp}_${randomString}.mp3`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('audio-files')
      .upload(filename, audioData, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
      });
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload audio file', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Get public URL for the uploaded file
    const { data: urlData } = await supabase
      .storage
      .from('audio-files')
      .getPublicUrl(filename);
    
    const audioUrl = urlData?.publicUrl;
    console.log(`Audio file uploaded successfully: ${audioUrl}`);
    
    // Return success response
    return new Response(
      JSON.stringify({
        audioUrl,
        text: description,
        language,
        voice,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

// Main serve function
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest();
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  }
  
  // Process the request
  return await handleRequest(req);
});
