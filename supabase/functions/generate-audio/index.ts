
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";
import OpenAI from "https://esm.sh/openai@4.8.0";

// Configure CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to generate a random string for IDs
function generateRandomId(length = 16) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length);
}

serve(async (req) => {
  console.log("Audio generation function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, language, voice } = await req.json();
    console.log(`Request received: Text length: ${text?.length || 0}, Language: ${language}, Voice: ${voice}`);

    if (!text) {
      throw new Error('No text provided for audio generation');
    }

    // Initialize OpenAI with API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    console.log("Generating enhanced product description...");
    // Generate an enhanced product description using GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional e-commerce product description writer. 
          Create an engaging and informative audio description for a product that highlights its key features and benefits. 
          Keep the tone conversational and friendly. The description should be 2-3 sentences maximum.
          For language: ${language}`
        },
        {
          role: "user",
          content: `Create a brief product description for: ${text}`
        }
      ],
      max_tokens: 200,
    });

    const enhancedText = completion.choices[0].message.content || text;
    console.log("Enhanced description created:", enhancedText);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not set');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate speech from text
    console.log("Generating speech with OpenAI...");
    const audioResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice || "alloy",
      input: enhancedText,
    });

    // Convert the audio to Uint8Array
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBytes = new Uint8Array(audioBuffer);

    console.log("Audio generated successfully, preparing for storage...");

    // Create a unique filename
    const timestamp = new Date().getTime();
    const randomId = generateRandomId(8);
    const fileName = `audio_${timestamp}_${randomId}.mp3`;

    // Check if storage bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const audioBucket = buckets?.find(bucket => bucket.name === 'audio_files');
      
      if (!audioBucket) {
        console.log("Creating audio_files bucket...");
        const { error: bucketError } = await supabase.storage.createBucket('audio_files', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
        
        if (bucketError) {
          console.error("Error creating bucket:", bucketError);
          throw new Error(`Failed to create storage bucket: ${bucketError.message}`);
        }
      }
    } catch (storageError) {
      console.error("Error checking/creating bucket:", storageError);
      throw new Error(`Storage bucket error: ${storageError.message}`);
    }

    // Upload the audio file to Supabase Storage
    console.log("Uploading audio to Supabase storage...");
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(fileName, audioBytes, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload audio file: ${uploadError.message}`);
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('audio_files')
      .getPublicUrl(fileName);

    const audioUrl = publicUrlData?.publicUrl;
    if (!audioUrl) {
      throw new Error('Failed to get public URL for audio file');
    }

    console.log("Audio generated and stored successfully:", audioUrl);

    // Return the audio URL, enhanced text, and generated ID
    return new Response(
      JSON.stringify({
        audioUrl,
        text: enhancedText,
        id: randomId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error in generate-audio function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error generating audio',
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
