
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
    const { text, language, voice } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    console.log(`Generating description for "${text}" in language ${language} with voice ${voice}`);

    // Step 1: Generate a detailed product description with GPT-4o
    const descriptionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using GPT-4o mini for cost efficiency
        messages: [
          {
            role: 'system',
            content: 'You are a professional e-commerce product description writer.'
          },
          {
            role: 'user',
            content: `Write a high-quality, engaging product description for "${text}" in ${language}.
            - Highlight its main features and benefits.
            - Mention why it is better than competitors.
            - Keep the description natural and appealing for an online store.
            - Output a clear, well-structured 150-200 word description that would be useful for e-commerce listings.`
          }
        ],
        temperature: 0.7,
      }),
    });

    const descriptionData = await descriptionResponse.json();
    
    if (!descriptionData.choices || !descriptionData.choices[0]) {
      throw new Error('Failed to generate product description');
    }

    const generatedDescription = descriptionData.choices[0].message.content;
    console.log("Generated description:", generatedDescription);

    // Step 2: Convert the generated description to speech using TTS-1
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voice,
        input: generatedDescription,
        response_format: 'mp3'
      }),
    });

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json();
      throw new Error(`TTS API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    // Get audio data as array buffer
    const audioArrayBuffer = await ttsResponse.arrayBuffer();
    
    // Convert to base64
    const audioBase64 = _arrayBufferToBase64(audioArrayBuffer);

    return new Response(
      JSON.stringify({
        success: true,
        audio_content: audioBase64,
        generated_text: generatedDescription
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-audio function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to convert ArrayBuffer to base64
function _arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
