
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.8.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// Helper function to generate a random ID instead of using a dependency
function generateRandomId(length = 10) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, length);
}

serve(async (req) => {
  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create an OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
    });

    // Parse the request body
    const { text, language, voice } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Missing required text parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating audio for: "${text}" in ${language} with voice ${voice}`);

    // First, ensure the storage bucket exists
    const { data: buckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets();

    const bucketName = 'user_files';
    
    if (bucketsError) {
      console.error("Error checking buckets:", bucketsError);
      return new Response(
        JSON.stringify({ error: "Error checking storage buckets" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const bucketExists = buckets.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      console.log("Creating bucket:", bucketName);
      const { error: createBucketError } = await supabaseAdmin
        .storage
        .createBucket(bucketName, { public: true });
        
      if (createBucketError) {
        console.error("Error creating bucket:", createBucketError);
        return new Response(
          JSON.stringify({ error: "Error creating storage bucket" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Generate audio with OpenAI
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice, // Use the voice parameter
      input: text,
    });

    // Convert to buffer
    const buffer = await mp3.arrayBuffer();

    // Generate a filename and path
    const fileId = generateRandomId();
    const fileName = `audio_${fileId}.mp3`;
    const filePath = `audio/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: "audio/mpeg",
        upsert: false
      });

    if (error) {
      console.error("Error uploading audio:", error);
      return new Response(
        JSON.stringify({ error: "Error uploading audio file" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log("Audio generated successfully:", publicUrl);

    // Return the audio URL and data
    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: publicUrl,
        text: text,
        id: fileId
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-audio function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
