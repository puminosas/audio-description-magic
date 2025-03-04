
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// We'll handle the Google TTS API directly instead of using googleapis.deno.dev
// which seems to be having issues

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
    const { text, language, voice, user_id } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load Google credentials from environment
    const googleCredentials = JSON.parse(Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON") || "{}");
    const bucketName = Deno.env.get("GCS_BUCKET_NAME") || "";
    const projectId = Deno.env.get("GCS_PROJECT_ID") || "";
    
    if (!googleCredentials.client_email || !bucketName || !projectId) {
      console.error("Missing required Google Cloud credentials");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating TTS for "${text.substring(0, 30)}..." in ${language} with voice ${voice}`);

    // Create a JWT token for authenticating with Google's API
    const now = Math.floor(Date.now() / 1000);
    const expTime = now + 3600; // 1 hour

    const jwtHeader = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const jwtClaimSet = btoa(JSON.stringify({
      iss: googleCredentials.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://texttospeech.googleapis.com/",
      exp: expTime,
      iat: now
    }));
    
    // Sign the JWT using the private key from credentials
    const textEncoder = new TextEncoder();
    const toSign = textEncoder.encode(`${jwtHeader}.${jwtClaimSet}`);
    const privateKey = googleCredentials.private_key;
    
    // Convert PEM private key to CryptoKey
    const importedKey = await crypto.subtle.importKey(
      "pkcs8",
      Uint8Array.from(atob(privateKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, "")), c => c.charCodeAt(0)),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      importedKey,
      toSign
    );
    
    const signatureBytes = new Uint8Array(signatureBuffer);
    const signature = btoa(String.fromCharCode(...signatureBytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    
    const jwt = `${jwtHeader}.${jwtClaimSet}.${signature}`;

    // Call Google Text-to-Speech API
    const ttsResponse = await fetch(
      "https://texttospeech.googleapis.com/v1beta1/text:synthesize",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: language || 'en-US',
            name: voice || 'en-US-Wavenet-A',
          },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json();
      console.error("Google TTS API error:", errorData);
      return new Response(
        JSON.stringify({ error: `Google TTS API error: ${errorData.error?.message || ttsResponse.statusText}` }),
        { status: ttsResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ttsData = await ttsResponse.json();
    
    if (!ttsData.audioContent) {
      console.error("No audio content returned from Google TTS");
      return new Response(
        JSON.stringify({ error: 'Failed to generate audio' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Storage API JWT
    const storageJwtClaimSet = btoa(JSON.stringify({
      iss: googleCredentials.client_email,
      scope: "https://www.googleapis.com/auth/devstorage.full_control",
      aud: "https://storage.googleapis.com/",
      exp: expTime,
      iat: now
    }));
    
    const storageToSign = textEncoder.encode(`${jwtHeader}.${storageJwtClaimSet}`);
    const storageSignatureBuffer = await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      importedKey,
      storageToSign
    );
    
    const storageSignatureBytes = new Uint8Array(storageSignatureBuffer);
    const storageSignature = btoa(String.fromCharCode(...storageSignatureBytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    
    const storageJwt = `${jwtHeader}.${storageJwtClaimSet}.${storageSignature}`;

    // Create user folder if it doesn't exist
    const userFolderPath = `audio/${user_id}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}-${language}-${voice.split('-').pop()}.mp3`;
    const filePath = `${userFolderPath}/${fileName}`;

    // Upload the audio file to Google Cloud Storage
    const audioContent = ttsData.audioContent;
    const uploadResponse = await fetch(
      `https://storage.googleapis.com/upload/storage/v1/b/${bucketName}/o?uploadType=media&name=${encodeURIComponent(filePath)}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${storageJwt}`,
          "Content-Type": "audio/mp3",
        },
        body: Uint8Array.from(atob(audioContent), c => c.charCodeAt(0)),
      }
    );

    if (!uploadResponse.ok) {
      const uploadError = await uploadResponse.json();
      console.error('Error uploading file to GCS:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload audio file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set the object to be publicly readable
    const patchResponse = await fetch(
      `https://storage.googleapis.com/storage/v1/b/${bucketName}/o/${encodeURIComponent(filePath)}?predefinedAcl=publicRead`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${storageJwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (!patchResponse.ok) {
      console.error('Error setting file to public:', await patchResponse.text());
      // Continue anyway as we've already uploaded successfully
    }
      
    console.log(`File uploaded to: ${filePath}`);
    
    // Generate public URL
    const audioUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
    const folderUrl = `https://console.cloud.google.com/storage/browser/${bucketName}/${userFolderPath}`;
    
    // Save file metadata to Supabase
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data, error } = await supabase
          .from('user_audio_files')
          .insert({
            user_id,
            file_name: fileName,
            file_path: filePath,
            text,
            language,
            voice,
            audio_url: audioUrl,
            folder_url: folderUrl
          });
        
        if (error) {
          console.error('Error saving file metadata to Supabase:', error);
        } else {
          console.log('File metadata saved to Supabase');
        }
      }
    } catch (dbError) {
      console.error('Error saving file metadata to Supabase:', dbError);
      // Continue even if Supabase save fails
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        audio_url: audioUrl,
        folder_url: folderUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in TTS generation:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process TTS request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
