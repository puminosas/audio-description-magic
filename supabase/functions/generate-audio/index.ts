
// This is the Edge Function for generating audio from text
// It needs access to the OPENAI_API_KEY, which is stored in Supabase secrets

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// CORS headers to allow requests from any origin
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
    // Get the OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not set in the environment variables');
    }

    // Get request body
    const body = await req.json();
    const { text, language, voice } = body;

    if (!text) {
      throw new Error('No text provided for audio generation');
    }

    console.log(`Generating audio for text: ${text.substring(0, 50)}... with language: ${language}, voice: ${voice}`);

    // Make OpenAI TTS API request
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice || 'alloy',
      }),
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${response.status} - ${errorData}`);
    }

    // Get the audio data as a blob
    const audioBlob = await response.blob();
    
    // Convert to base64 for storing in Supabase Storage
    const buffer = await audioBlob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const base64Audio = btoa(String.fromCharCode(...bytes));

    // Generate a unique ID for the file
    const id = crypto.randomUUID();
    const fileName = `audio_${id}.mp3`;
    
    // Store in Supabase Storage (optional - if we want to persist)
    // For now, just return as a data URL
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    console.log('Audio generated successfully!');
    
    // Return the data
    return new Response(
      JSON.stringify({
        audioUrl,
        text,
        id,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in generate-audio function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
