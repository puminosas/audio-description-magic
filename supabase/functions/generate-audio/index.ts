
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    // Get user ID from the authorization header
    const authHeader = req.headers.get('authorization')?.split(' ')[1];
    let userId = null;
    
    if (authHeader) {
      // Check if it's a session token or API key
      if (authHeader.startsWith('ak_')) {
        // It's an API key
        const { data, error } = await supabase
          .from('api_keys')
          .select('user_id')
          .eq('key', authHeader)
          .single();
        
        if (error) throw new Error('Invalid API key');
        userId = data.user_id;
        
        // Update the last_used timestamp
        await supabase
          .from('api_keys')
          .update({ last_used: new Date().toISOString() })
          .eq('key', authHeader);
      } else {
        // It's a session token
        const { data: { user }, error } = await supabase.auth.getUser(authHeader);
        if (error || !user) throw new Error('Authentication required');
        userId = user.id;
      }
    } else {
      throw new Error('Authentication required');
    }

    // Parse the request body
    const { text, language = 'en', voice = 'alloy' } = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ success: false, error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing request for text: "${text}", language: ${language}, voice: ${voice}`);
    console.log(`User ID: ${userId}`);
    
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
        model: "gpt-4o-mini",  // Updated to recommended model
        messages: [
          { role: "system", content: "You are a professional e-commerce product description writer." },
          { role: "user", content: `Write a high-quality, engaging product description for "${text}" in ${language}. Highlight its main features and benefits. Keep it under 150 words.` }
        ]
      })
    });

    if (!descriptionResponse.ok) {
      const errorData = await descriptionResponse.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

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

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json();
      throw new Error(`OpenAI TTS API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    // Get the audio data as ArrayBuffer
    const audioArrayBuffer = await ttsResponse.arrayBuffer();
    
    // Create a unique file name based on timestamp and some random characters
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const fileName = `${timestamp}-${randomStr}.mp3`;
    
    // Create user's folder if it doesn't exist
    const folderPath = `audio/${userId}`;
    
    // Check if bucket exists, if not create it
    const { data: buckets } = await supabase.storage.listBuckets();
    const audioBucket = buckets?.find(b => b.name === 'audio');
    
    if (!audioBucket) {
      await supabase.storage.createBucket('audio', {
        public: false,
        fileSizeLimit: 10485760 // 10MB limit
      });
    }
    
    // Upload the file to storage
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(`${folderPath}/${fileName}`, audioArrayBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600'
      });
      
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error(`Failed to upload audio file: ${uploadError.message}`);
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(`${folderPath}/${fileName}`);
    const audioUrl = publicUrlData.publicUrl;
    
    // Save the audio file reference in the database
    const { error: dbError } = await supabase
      .from('audio_files')
      .insert({
        user_id: userId,
        file_path: `${folderPath}/${fileName}`,
        original_text: text,
        generated_text: generatedDescription,
        language: language,
        voice: voice,
        created_at: new Date().toISOString(),
        file_size: audioArrayBuffer.byteLength,
        public_url: audioUrl
      });
      
    if (dbError) {
      console.error('Error saving to database:', dbError);
      // Don't throw here, as we still want to return the audio URL even if DB save fails
    }
    
    // Update generation count for the user
    const { data: countData, error: countError } = await supabase
      .from('generation_counts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (countError) {
      console.error('Error checking generation count:', countError);
    } else if (countData) {
      // Update existing count
      await supabase
        .from('generation_counts')
        .update({ 
          count: countData.count + 1,
          last_generated: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      // Create new count record
      await supabase
        .from('generation_counts')
        .insert({
          user_id: userId,
          count: 1,
          last_generated: new Date().toISOString()
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioUrl, 
        text: generatedDescription,
        fileName,
        language,
        voice
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-audio function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Unknown error" }),
      { status: error.message.includes('Authentication') ? 401 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
