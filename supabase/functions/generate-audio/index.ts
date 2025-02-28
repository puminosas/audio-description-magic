
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
        JSON.stringify({
          success: false,
          error: 'Text is required'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing request for text: "${text}", language: ${language}, voice: ${voice}`);
    
    if (!openaiApiKey) {
      console.error('No OpenAI API key found in environment variables');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'API key configuration error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Step 1: Generate a basic product description
    const systemPrompt = "You are a professional e-commerce product description writer.";
    const userPrompt = `Write a high-quality, engaging product description for "${text}" in ${language}. Highlight its main features and benefits. Keep it under 150 words.`;
    
    console.log("Generating description with OpenAI...");
    
    try {
      // First call - Generate the description
      const descriptionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
        }),
      });
      
      if (!descriptionResponse.ok) {
        const errorData = await descriptionResponse.json();
        console.error('Error calling OpenAI description API:', errorData);
        return new Response(
          JSON.stringify({
            success: false,
            error: `OpenAI description API error: ${errorData.error?.message || 'Unknown error'}`
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const descriptionData = await descriptionResponse.json();
      
      if (!descriptionData.choices || !descriptionData.choices[0]) {
        console.error('Invalid response from OpenAI:', descriptionData);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to generate product description'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const generatedDescription = descriptionData.choices[0].message.content;
      console.log("Description generated successfully:", generatedDescription.substring(0, 50) + "...");
      
      // Step 2: Generate audio from the description
      console.log("Generating TTS with voice:", voice);
      
      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice,
          input: generatedDescription,
          response_format: 'mp3'
        }),
      });
      
      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error?.message || 'Unknown TTS error';
        } catch (e) {
          errorMessage = `TTS API error (${ttsResponse.status})`;
        }
        
        console.error('TTS API error:', errorMessage);
        return new Response(
          JSON.stringify({
            success: false,
            error: errorMessage
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Get audio data as array buffer
      const audioArrayBuffer = await ttsResponse.arrayBuffer();
      
      // Convert to base64
      const audioBase64 = _arrayBufferToBase64(audioArrayBuffer);
      
      console.log("Audio generated successfully!");
      
      return new Response(
        JSON.stringify({
          success: true,
          audio_content: audioBase64,
          generated_text: generatedDescription
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
      
    } catch (innerError) {
      console.error('Error in OpenAI API calls:', innerError);
      return new Response(
        JSON.stringify({
          success: false,
          error: innerError instanceof Error ? innerError.message : 'Error processing OpenAI request'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
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
