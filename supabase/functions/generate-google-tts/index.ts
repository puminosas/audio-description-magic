
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    const { text, language, voice, user_id } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    if (!language) {
      throw new Error('Language is required');
    }

    if (!voice) {
      throw new Error('Voice is required');
    }

    if (!user_id) {
      throw new Error('User ID is required');
    }

    // Initialize Supabase client for storage operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Generating TTS for: "${text.substring(0, 50)}..." in language: ${language} with voice: ${voice}`);
    
    try {
      // Load Google credentials
      const googleCredentials = JSON.parse(Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON") || "{}");
      
      if (!googleCredentials.client_email) {
        throw new Error("Missing Google Cloud credentials");
      }

      // Create a JWT token for authenticating with Google's API
      const now = Math.floor(Date.now() / 1000);
      const expTime = now + 3600; // 1 hour

      const jwtHeader = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
      const jwtClaimSet = btoa(JSON.stringify({
        iss: googleCredentials.client_email,
        scope: "https://www.googleapis.com/auth/cloud-platform",
        aud: "https://www.googleapis.com/oauth2/v4/token",
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

      // Get an access token first
      const tokenResponse = await fetch("https://www.googleapis.com/oauth2/v4/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error("Token response error:", error);
        throw new Error(`Failed to get access token: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      
      // Prepare the TTS request body
      const ttsRequestBody = {
        input: { text },
        voice: {
          languageCode: language,
          name: voice,
        },
        audioConfig: {
          audioEncoding: "MP3",
        },
      };

      // Call the TTS API
      const ttsResponse = await fetch(
        "https://texttospeech.googleapis.com/v1beta1/text:synthesize",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ttsRequestBody),
        }
      );

      if (!ttsResponse.ok) {
        const error = await ttsResponse.text();
        console.error("TTS API error:", error);
        throw new Error(`Failed to generate speech: ${ttsResponse.status}`);
      }

      const ttsResult = await ttsResponse.json();
      
      // Create a buffer from the base64 audio content
      const audioContent = ttsResult.audioContent;
      const binaryAudio = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
      
      // Store the audio in Supabase Storage
      // Create user folder if it doesn't exist
      const userFolderPath = `audio-files/${user_id}`;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedText = text.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${sanitizedText}_${language}_${timestamp}.mp3`;
      const filePath = `${userFolderPath}/${fileName}`;
      
      // Upload to Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('public')
        .upload(filePath, binaryAudio, {
          contentType: 'audio/mpeg',
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(`Failed to upload audio: ${uploadError.message}`);
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabaseAdmin
        .storage
        .from('public')
        .getPublicUrl(filePath);
      
      // Get the folder public URL
      const { data: folderUrlData } = supabaseAdmin
        .storage
        .from('public')
        .getPublicUrl(userFolderPath);
      
      console.log(`Successfully generated and stored audio file: ${fileName}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          audio_url: publicUrlData.publicUrl,
          folder_url: folderUrlData.publicUrl,
          fileName: fileName
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error generating speech:", error);
      throw error;  // Re-throw for outer error handler
    }
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
