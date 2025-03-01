
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
    const { text, language = 'en', voice = 'alloy' } = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ success: false, error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing request for text: "${text}", language: ${language}, voice: ${voice}`);
    
    if (!openaiApiKey) {
      console.error('No OpenAI API key found in environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'API key configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Generate a product description
    console.log("Generating description with OpenAI...");
    const descriptionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a professional e-commerce product description writer. Write in ${language} language.` },
          { role: "user", content: `Write a high-quality, engaging product description for "${text}" in ${language}. Highlight its main features and benefits. Keep it under 150 words.` }
        ]
      })
    });

    const descriptionData = await descriptionResponse.json();
    
    if (!descriptionData.choices || descriptionData.choices.length === 0) {
      console.error("OpenAI description generation error:", descriptionData);
      throw new Error("Failed to generate a description");
    }
    
    const generatedDescription = descriptionData.choices[0]?.message?.content?.trim();

    if (!generatedDescription) {
      throw new Error("Failed to generate a description");
    }

    console.log("Generated Description:", generatedDescription);

    // Step 2: Convert description into speech using OpenAI TTS
    console.log("Converting text to speech with OpenAI...");
    const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: voice,
        input: generatedDescription,
        response_format: "mp3"
      })
    });

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.text();
      console.error("OpenAI TTS error:", errorData);
      throw new Error(`Failed to generate audio: ${errorData}`);
    }

    // Get the audio data as a buffer
    const audioBuffer = await ttsResponse.arrayBuffer();
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');
    
    // Create a unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedText = text.substring(0, 20).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `audio-${sanitizedText}-${timestamp}.mp3`;
    const filePath = `audio-files/${filename}`;
    
    // Make sure the storage bucket exists
    try {
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('user_files');
      
      if (bucketError && bucketError.message.includes('does not exist')) {
        // Create the bucket if it doesn't exist
        await supabase.storage.createBucket('user_files', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
      }
    } catch (error) {
      console.log("Bucket check error:", error);
      // Continue anyway, the bucket might already exist
    }
    
    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user_files')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      });
    
    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      throw new Error(`Failed to upload audio file: ${uploadError.message}`);
    }
    
    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('user_files')
      .getPublicUrl(filePath);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error("Failed to get public URL for the audio file");
    }
    
    console.log("Generated Audio URL:", publicUrlData.publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioUrl: publicUrlData.publicUrl, 
        text: generatedDescription,
        language: language,
        voice: voice
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-audio function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
