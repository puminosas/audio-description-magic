
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';
import OpenAI from 'https://esm.sh/openai@4.8.0';
import { generateRandomString } from 'https://deno.land/x/random_string@1.0.0/mod.ts';

// Set up CORS headers for browsers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS requests for CORS preflight
const handleOptionsRequest = () => {
  return new Response(null, { headers: corsHeaders });
};

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
    
    // Set bucket policy to public
    const { error: policyError } = await supabase.storage.from('audio-files').createSignedUrl('test.txt', 3600);
    if (policyError) {
      console.error('Error setting bucket policy:', policyError);
    }
  }
}

// Handle the actual request
const handleRequest = async (req: Request) => {
  try {
    const { description, language = 'en', voice = 'alloy' } = await req.json();
    console.log(`Generating audio for: "${description}" in language: ${language} with voice: ${voice}`);
    
    if (!description || description.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Description is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Ensure storage bucket exists
    await ensureStorageBucketExists();
    
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
        JSON.stringify({ error: 'Failed to upload audio file' }),
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
