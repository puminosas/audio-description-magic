
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to create JWT token for Google API authentication
async function getGoogleAccessToken(credentials) {
  try {
    // Create JWT claims
    const now = Math.floor(Date.now() / 1000);
    const expTime = now + 3600; // 1 hour
    
    const claims = {
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://www.googleapis.com/oauth2/v4/token",
      exp: expTime,
      iat: now
    };
    
    // Create JWT header
    const header = { alg: "RS256", typ: "JWT" };
    
    // Encode header and claims
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedClaims = btoa(JSON.stringify(claims));
    
    // Create signature base
    const signatureBase = `${encodedHeader}.${encodedClaims}`;
    
    // Import private key for signing
    const privateKey = credentials.private_key;
    const textEncoder = new TextEncoder();
    const signData = textEncoder.encode(signatureBase);
    
    try {
      // Convert PEM format to ArrayBuffer format that crypto API can use
      const pemHeader = "-----BEGIN PRIVATE KEY-----";
      const pemFooter = "-----END PRIVATE KEY-----";
      const pemContents = privateKey.substring(
        privateKey.indexOf(pemHeader) + pemHeader.length,
        privateKey.indexOf(pemFooter)
      ).replace(/\s/g, '');
      
      const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
      
      // Import the key
      const cryptoKey = await crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
      );
      
      // Create signature
      const signatureArrayBuffer = await crypto.subtle.sign(
        { name: "RSASSA-PKCS1-v1_5" },
        cryptoKey,
        signData
      );
      
      // Convert signature to base64url
      const signature = btoa(String.fromCharCode(
        ...new Uint8Array(signatureArrayBuffer)
      )).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      
      // Create JWT
      const jwt = `${signatureBase}.${signature}`;
      
      // Exchange JWT for access token
      const tokenResponse = await fetch("https://www.googleapis.com/oauth2/v4/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error(`Failed to get access token: ${errorText}`);
        throw new Error(`Failed to get access token: ${errorText}`);
      }
      
      const tokenData = await tokenResponse.json();
      return tokenData.access_token;
      
    } catch (err) {
      console.error("Error signing JWT:", err);
      throw err;
    }
  } catch (error) {
    console.error("Error in getGoogleAccessToken:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    const requestData = await req.json();
    const { text, language, voice, user_id } = requestData;

    // Validate request parameters
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

    console.log(`Processing TTS request for "${text.substring(0, 50)}..." in language: ${language}, voice: ${voice}`);

    // Initialize Supabase client for storage operations
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase configuration');
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Load Google credentials
    const credentialsJson = Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON");
    if (!credentialsJson) {
      throw new Error("Missing Google credentials");
    }
    
    // Parse credentials
    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
      if (!credentials.client_email || !credentials.private_key) {
        throw new Error("Invalid Google credentials format");
      }
    } catch (error) {
      console.error("Failed to parse Google credentials:", error);
      throw new Error("Invalid Google credentials JSON format");
    }
    
    console.log("Getting access token for Google API");
    // Get access token using the credentials
    const accessToken = await getGoogleAccessToken(credentials);
    console.log("Access token obtained successfully");
    
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

    console.log("Calling Google TTS API with parameters:", {
      language, 
      voice, 
      textLength: text.length
    });
    
    // Call the TTS API
    const ttsResponse = await fetch(
      "https://texttospeech.googleapis.com/v1/text:synthesize",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ttsRequestBody),
      }
    );

    // Check if TTS API call was successful
    if (!ttsResponse.ok) {
      const errorBody = await ttsResponse.text();
      console.error("TTS API error response:", errorBody);
      throw new Error(`Failed to generate speech: ${ttsResponse.status} - ${errorBody}`);
    }

    // Parse TTS response
    const ttsResult = await ttsResponse.json();
    
    if (!ttsResult.audioContent) {
      console.error("TTS API returned no audio content:", ttsResult);
      throw new Error("No audio content returned from TTS API");
    }
    
    console.log("Successfully received audio content from Google TTS API");
    
    // Create a buffer from the base64 audio content
    const audioContent = ttsResult.audioContent;
    const binaryAudio = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
    
    // Create user folder path for storage
    const userFolderPath = `audio-files/${user_id}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedText = text.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${sanitizedText}_${language}_${timestamp}.mp3`;
    const filePath = `${userFolderPath}/${fileName}`;
    
    console.log(`Preparing to upload ${binaryAudio.length} bytes of audio to Supabase Storage`);
    
    // Check if any buckets exist at all
    const { data: buckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets();
      
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      throw new Error(`Failed to list storage buckets: ${bucketsError.message}`);
    }
    
    console.log("Available buckets:", buckets ? buckets.map(b => b.name).join(", ") : "none");
    
    // Check if "users_generated_files" bucket exists, create it if not
    const bucketName = "users_generated_files";
    const bucket = buckets?.find(b => b.name === bucketName);

    if (!bucket) {
      console.log(`Creating '${bucketName}' bucket`);
      const { error: createBucketError } = await supabaseAdmin
        .storage
        .createBucket(bucketName, { 
          public: true,
          fileSizeLimit: 50000000 // 50MB
        });
        
      if (createBucketError) {
        console.error("Error creating bucket:", createBucketError);
        throw new Error(`Failed to create storage bucket: ${createBucketError.message}`);
      }
      console.log(`Successfully created bucket: ${bucketName}`);
    } else {
      console.log(`Bucket '${bucketName}' already exists`);
    }
    
    // Upload to Storage
    console.log(`Uploading file to path: ${filePath} in bucket: ${bucketName}`);
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(filePath, binaryAudio, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }
    
    console.log("Successfully uploaded audio to storage:", uploadData);
    
    // Get the public URL
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    // Get the folder public URL
    const { data: folderUrlData } = supabaseAdmin
      .storage
      .from(bucketName)
      .getPublicUrl(userFolderPath);
    
    console.log(`Successfully generated and stored audio file: ${fileName}`);
    console.log(`Public URL: ${publicUrlData?.publicUrl}`);
    
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
    console.error("Error in generate-google-tts:", error);
    
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
