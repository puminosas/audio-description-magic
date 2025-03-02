
// Import necessary modules for Supabase Edge Functions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import OpenAI from 'https://esm.sh/openai@4.20.1';

// Define CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request body
    const { text, language, voice } = await req.json();
    
    // Validate input
    if (!text) {
      throw new Error('Text content is required');
    }

    // Get the authentication context if available
    const authHeader = req.headers.get('Authorization');
    let userId = null;

    if (authHeader) {
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Verify the user's token
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!error && user) {
        userId = user.id;
      }
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY') || '',
    });

    // Enhance the product description for e-commerce
    let enhancedText = text;
    
    // Only enhance if the text is relatively short (indicating it might be just a product name)
    if (text.length < 100) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert e-commerce copywriter. Your task is to create compelling, persuasive product descriptions that highlight benefits, features, and create emotional appeal. Keep descriptions concise (under 100 words) but impactful. Focus on what makes the product special and why customers should buy it. Use a tone appropriate for online shopping and audio narration.`
          },
          {
            role: "user",
            content: `Create a compelling product description for: "${text}". Make it engaging for audio narration in ${language || 'English'}.`
          }
        ],
        temperature: 0.7,
        max_tokens: 250,
      });

      enhancedText = completion.choices[0].message.content || text;
    }

    // Generate speech from text
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: enhancedText,
        voice: voice || 'alloy',
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate speech');
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to Base64 for easier handling
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    // Create a unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `audio_${timestamp}.mp3`;
    
    // Initialize Supabase Storage client for file upload
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Define the file path
    const filePath = `audio/${userId || 'anonymous'}/${fileName}`;
    
    // Convert Base64 to Uint8Array for storage
    const binaryData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
    
    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('public')
      .upload(filePath, binaryData, {
        contentType: 'audio/mpeg',
        upsert: false,
      });
    
    if (storageError) {
      throw new Error(`Storage error: ${storageError.message}`);
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('public')
      .getPublicUrl(filePath);
    
    // If user is authenticated, save to audio_files table
    let audioFileId = null;
    
    if (userId) {
      const { data: audioData, error: audioError } = await supabase
        .from('audio_files')
        .insert({
          user_id: userId,
          title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
          description: enhancedText,
          language: language || 'en',
          voice_name: voice || 'alloy',
          audio_url: publicUrl,
          is_temporary: false,
        })
        .select('id')
        .single();
      
      if (audioError) {
        console.error('Error saving audio file metadata:', audioError);
      } else {
        audioFileId = audioData.id;
      }
    }
    
    // Return the response
    return new Response(
      JSON.stringify({
        audioUrl: publicUrl,
        text: enhancedText,
        id: audioFileId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('Error in generate-audio function:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
