
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues (stack overflow)
function binaryToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let base64 = '';
  const chunkSize = 1024; // Process in smaller chunks
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
    base64 += btoa(String.fromCharCode.apply(null, [...chunk]));
  }
  
  return base64;
}

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
        model: "gpt-4o-mini", // Using available model
        messages: [
          { role: "system", content: "You are a professional e-commerce product description writer." },
          { role: "user", content: `Write a high-quality, engaging product description for "${text}" in ${language}. Highlight its main features and benefits. Keep it under 150 words.` }
        ]
      })
    });

    if (!descriptionResponse.ok) {
      const errorText = await descriptionResponse.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    // Parse the JSON response
    let descriptionData;
    try {
      descriptionData = await descriptionResponse.json();
    } catch (error) {
      console.error("Error parsing description response:", error);
      throw new Error("Failed to parse description response");
    }

    const generatedDescription = descriptionData.choices[0]?.message?.content?.trim();

    if (!generatedDescription) {
      console.error("No description generated", descriptionData);
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
      const errorText = await ttsResponse.text();
      console.error("TTS API error:", errorText);
      throw new Error(`TTS API error: ${errorText}`);
    }

    // Process the audio data with our chunked approach
    try {
      const audioBuffer = await ttsResponse.arrayBuffer();
      console.log(`Received audio buffer of size: ${audioBuffer.byteLength} bytes`);
      
      // Process binary data in chunks to avoid stack overflow
      const audioBase64 = binaryToBase64(audioBuffer);
      
      // Create a data URL for the audio file
      const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

      console.log("Successfully generated audio and converted to data URL");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          audioUrl: audioUrl, 
          text: generatedDescription,
          id: crypto.randomUUID()
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error processing audio data:", error);
      throw new Error(`Failed to process audio data: ${error.message}`);
    }

  } catch (error) {
    console.error("Error in generate-audio function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
