
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { text, language, voice } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openAIApiKey,
    });

    // Map frontend voice IDs to OpenAI voice names
    // OpenAI voices: alloy, echo, fable, onyx, nova, shimmer
    const voiceMapping: Record<string, string> = {
      // Default male voices by language
      'en-US-1': 'onyx',   // Matthew -> onyx (male)
      'en-US-4': 'echo',   // Joey -> echo (male)
      'en-US-7': 'fable',  // Brian -> fable (male)
      'en-US-9': 'nova',   // Russell -> nova (male)
      'es-ES-1': 'onyx',   // Miguel -> onyx
      'fr-FR-1': 'onyx',   // Mathieu -> onyx
      'de-DE-1': 'onyx',   // Hans -> onyx
      
      // Default female voices by language
      'en-US-2': 'nova',   // Joanna -> nova (female)
      'en-US-3': 'shimmer', // Salli -> shimmer (female)
      'en-US-5': 'alloy',  // Kimberly -> alloy (female)
      'en-US-6': 'fable',  // Amy -> fable (female)
      'en-US-8': 'shimmer', // Emma -> shimmer (female)
      'es-ES-2': 'nova',   // Penélope -> nova
      'es-ES-3': 'shimmer', // Lupe -> shimmer
      'fr-FR-2': 'nova',   // Céline -> nova
      'fr-FR-3': 'shimmer', // Léa -> shimmer
      'de-DE-2': 'nova',   // Marlene -> nova
      'de-DE-3': 'shimmer', // Vicki -> shimmer
    };

    // Get the appropriate OpenAI voice or default to 'alloy'
    const openaiVoice = voiceMapping[voice] || 'alloy';

    console.log(`Generating audio with text: "${text.substring(0, 50)}..." in language: ${language}, voice: ${openaiVoice}`);

    // Generate speech with OpenAI
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: openaiVoice,
      input: text,
    });

    // Convert response to arraybuffer
    const buffer = await mp3.arrayBuffer();
    
    // Convert to base64 for easy transport
    const uint8Array = new Uint8Array(buffer);
    const binary = Array.from(uint8Array).map(byte => String.fromCharCode(byte)).join("");
    const base64Audio = btoa(binary);

    // For development/testing - store a timestamp with the generated audio
    const timestamp = new Date().toISOString();
    
    // Return success response with the base64-encoded audio
    return new Response(
      JSON.stringify({ 
        success: true, 
        audio_content: base64Audio,
        timestamp: timestamp 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-audio function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate audio' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
