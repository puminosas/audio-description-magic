import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

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
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a professional e-commerce product description writer." },
          { role: "user", content: `Write a high-quality, engaging product description for "${text}" in ${language}. Highlight its main features and benefits. Keep it under 150 words.` }
        ]
      })
    });

    const descriptionData = await descriptionResponse.json();
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
        input: generatedDescription
      })
    });

    const ttsData = await ttsResponse.json();

    if (!ttsData.audio_url) {
      throw new Error("Failed to generate audio");
    }

    console.log("Generated Audio URL:", ttsData.audio_url);

    return new Response(
      JSON.stringify({ success: true, audioUrl: ttsData.audio_url, text: generatedDescription }),
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
