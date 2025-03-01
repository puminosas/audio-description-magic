
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import OpenAI from "https://esm.sh/openai@4.24.1";

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
    const { productName, language, voice } = await req.json();

    if (!productName) {
      throw new Error('Product name is required');
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    console.log(`Starting generation for: ${productName} (Language: ${language?.name || 'English'}, Voice: ${voice?.name || 'Alloy'})`);

    // Step 1: Generate product description
    let description;
    try {
      const aiResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at generating engaging product descriptions for e-commerce. Provide a concise yet informative description based on the product name.'
          },
          {
            role: 'user',
            content: `Generate a product description for: ${productName}`
          }
        ]
      });

      description = aiResponse.choices[0].message.content.trim();
      console.log(`Generated description: ${description.substring(0, 100)}...`);
    } catch (error) {
      console.error('Error generating description:', error);
      throw new Error(`Failed to generate description: ${error.message}`);
    }

    // Step 2: Generate audio from description
    let audioBuffer;
    try {
      const audioResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice?.id || "alloy",
        input: description,
      });

      audioBuffer = await audioResponse.arrayBuffer();
      console.log(`Generated audio of size: ${audioBuffer.byteLength} bytes`);
    } catch (error) {
      console.error('Error generating audio:', error);
      throw new Error(`Failed to generate audio: ${error.message}`);
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_product_description.mp3`;

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Ensure the audio_files bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets.some(bucket => bucket.name === 'audio_files');
      
      if (!bucketExists) {
        console.log('Creating audio_files bucket...');
        const { error } = await supabase.storage.createBucket('audio_files', {
          public: true,
        });
        
        if (error) {
          console.error('Error creating bucket:', error);
        } else {
          console.log('Bucket created successfully');
        }
      }
    } catch (error) {
      console.error('Error checking/creating bucket:', error);
    }

    // Save the audio file to Supabase Storage
    let audioUrl;
    try {
      const { data: storageData, error: storageError } = await supabase.storage
        .from('audio_files')
        .upload(fileName, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: false
        });

      if (storageError) {
        throw new Error(`Error uploading audio file: ${storageError.message}`);
      }

      // Get the public URL for the file
      const { data: publicUrlData } = supabase.storage
        .from('audio_files')
        .getPublicUrl(fileName);

      audioUrl = publicUrlData.publicUrl;
      console.log(`File uploaded and available at: ${audioUrl}`);
    } catch (error) {
      console.error('Error saving audio file:', error);
      throw new Error(`Failed to save audio file: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        audioUrl,
        description,
        id: fileName
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-audio function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
