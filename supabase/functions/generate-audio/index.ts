
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

    // Step 1: Generate product description
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini as it's more widely available
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

    const description = aiResponse.choices[0].message.content.trim();

    // Step 2: Generate audio from description
    const audioResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice || "alloy",
      input: description,
    });

    // Convert to base64 for response
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    // Generate a unique filename
    const fileName = `${Date.now()}_product_description.mp3`;

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save the audio file to Supabase Storage
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

    const audioUrl = publicUrlData.publicUrl;

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
