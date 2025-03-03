
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleAuth } from 'https://esm.sh/google-auth-library@8.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface RequestBody {
  text: string;
  language: string;
  voice: string;
  user_id: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const gcsProjectId = Deno.env.get('GCS_PROJECT_ID') || '';
    const gcsBucketName = Deno.env.get('GCS_BUCKET_NAME') || '';

    // Validate request
    if (!req.body) {
      return new Response(
        JSON.stringify({ error: 'Request body is missing' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { text, language, voice, user_id } = await req.json() as RequestBody;
    
    if (!text || !language || !voice || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key for admin rights
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create Google Auth client
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();

    // Prepare request to Google TTS API
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize`;
    const data = {
      input: { text },
      voice: {
        languageCode: language,
        name: voice,
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    };

    // Make request to Google TTS API
    const response = await client.request({
      url,
      method: 'POST',
      data,
    });

    if (!response.data || !response.data.audioContent) {
      throw new Error('Failed to generate audio content');
    }

    // Convert base64 to buffer
    const audioBuffer = Uint8Array.from(atob(response.data.audioContent), c => c.charCodeAt(0));

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `audio_${timestamp}_${user_id.substring(0, 8)}.mp3`;
    const filePath = `${user_id}/${filename}`;

    // Upload to Google Cloud Storage
    const gcsUrl = `https://storage.googleapis.com/upload/storage/v1/b/${gcsBucketName}/o?uploadType=media&name=${encodeURIComponent(filePath)}`;
    const uploadResponse = await client.request({
      url: gcsUrl,
      method: 'POST',
      body: audioBuffer,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });

    if (!uploadResponse.data || !uploadResponse.data.name) {
      throw new Error('Failed to upload audio to Google Cloud Storage');
    }

    // Generate public URL for the uploaded file
    const publicUrl = `https://storage.googleapis.com/${gcsBucketName}/${filePath}`;

    // Store in database
    const { data: dbData, error: dbError } = await supabase
      .from('audio_files')
      .insert([
        {
          user_id,
          title: filename,
          description: text.substring(0, 255),
          language,
          voice_name: voice,
          audio_url: publicUrl,
          file_path: filePath
        }
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save audio record in database');
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        audio_url: publicUrl,
        filename,
        generated_text: text
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } 
  catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate audio' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
