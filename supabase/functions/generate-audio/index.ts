
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { checkRateLimit } from "./utils/rateLimiting.ts";
import { generateDescription } from "./services/description.ts";
import { textToSpeech } from "./services/textToSpeech.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing audio generation request");
    
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown-ip';
    
    // Apply rate limits (5 OpenAI calls per minute, 3 TTS calls per minute)
    if (!checkRateLimit('openai', clientIP, 5)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Rate limit exceeded for description generation. Please try again in a minute.' 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!req.body) {
      console.error("Request body is empty");
      return new Response(
        JSON.stringify({ success: false, error: 'Request body is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { text, language = 'en', voice = 'alloy' } = requestData;
    
    if (!text) {
      console.error("Text parameter is missing");
      return new Response(
        JSON.stringify({ success: false, error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enforce input length limits to control costs
    if (text.length > 1000) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Text exceeds maximum length of 1000 characters'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing request for text: "${text.substring(0, 30)}...", language: ${language}, voice: ${voice}`);
    
    if (!openaiApiKey) {
      console.error('No OpenAI API key found in environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'API key configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine if we need a full description (for short inputs) or just basic enhancement
    const needsFullDescription = text.length < 100;
    
    try {
      // Step 1: Generate a product description
      const generatedDescription = await generateDescription(
        text, 
        language, 
        needsFullDescription, 
        openaiApiKey
      );

      // Apply TTS rate limiting
      if (!checkRateLimit('tts', clientIP, 3)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Rate limit exceeded for text-to-speech. Please try again in a minute.' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Step 2: Convert description into speech
      const { audioUrl, id } = await textToSpeech(generatedDescription, voice, openaiApiKey);

      console.log("Successfully generated audio and converted to data URL");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          audioUrl: audioUrl, 
          text: generatedDescription,
          id: id
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error in text-to-speech process:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message || "Failed to generate audio" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error in generate-audio function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
