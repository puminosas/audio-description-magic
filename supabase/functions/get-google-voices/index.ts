
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

// Fetch voices from Google TTS API
async function fetchGoogleVoices() {
  try {
    // Get credentials from environment variable
    const credentialsJson = Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON");
    if (!credentialsJson) {
      throw new Error("Missing Google credentials");
    }
    
    // Parse credentials
    const credentials = JSON.parse(credentialsJson);
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error("Invalid Google credentials format");
    }
    
    console.log("Getting access token for Google API");
    // Get access token
    const accessToken = await getGoogleAccessToken(credentials);
    
    console.log("Fetching voices from Google TTS API");
    // Call Google TTS API to list voices
    const response = await fetch(
      "https://texttospeech.googleapis.com/v1beta1/voices",
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API error:", errorText);
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      throw new Error(`Failed to parse response: ${parseError.message}`);
    }
    
    // Process voices to match the Python example format
    const voicesByLanguage = {};
    
    if (data.voices && Array.isArray(data.voices)) {
      for (const voice of data.voices) {
        if (voice.languageCodes && voice.languageCodes.length > 0) {
          for (const languageCode of voice.languageCodes) {
            if (!voicesByLanguage[languageCode]) {
              voicesByLanguage[languageCode] = {
                display_name: getLanguageDisplayName(languageCode),
                voices: { MALE: [], FEMALE: [] }
              };
            }
            
            // Map SSML gender to the expected format
            if (voice.ssmlGender === "MALE" || voice.ssmlGender === "FEMALE") {
              const gender = voice.ssmlGender;
              
              voicesByLanguage[languageCode].voices[gender].push({
                name: voice.name,
                ssml_gender: voice.ssmlGender
              });
            }
          }
        }
      }
    }
    
    return voicesByLanguage;
  } catch (error) {
    console.error("Error fetching Google voices:", error);
    // Return a fallback dataset
    return getFallbackVoices();
  }
}

// Helper function to get language display name
function getLanguageDisplayName(code) {
  const languageNames = {
    "en-US": "English (US)",
    "en-GB": "English (UK)",
    "en-AU": "English (Australia)",
    "en-IN": "English (India)",
    "fr-FR": "French (France)",
    "de-DE": "German",
    "es-ES": "Spanish (Spain)",
    "it-IT": "Italian",
    "ja-JP": "Japanese",
    "ko-KR": "Korean",
    "pt-BR": "Portuguese (Brazil)",
    "ru-RU": "Russian",
    "zh-CN": "Chinese (Mandarin)",
    "nl-NL": "Dutch",
    "pl-PL": "Polish",
    "sv-SE": "Swedish",
    "tr-TR": "Turkish"
  };
  
  return languageNames[code] || code;
}

// Fallback voices in case the API fails
function getFallbackVoices() {
  return {
    "en-US": {
      display_name: "English (US)",
      voices: {
        MALE: [
          { name: "en-US-Standard-A", ssml_gender: "MALE" },
          { name: "en-US-Standard-B", ssml_gender: "MALE" },
          { name: "en-US-Wavenet-A", ssml_gender: "MALE" },
          { name: "en-US-Wavenet-B", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "en-US-Standard-C", ssml_gender: "FEMALE" },
          { name: "en-US-Standard-E", ssml_gender: "FEMALE" },
          { name: "en-US-Wavenet-C", ssml_gender: "FEMALE" },
          { name: "en-US-Wavenet-E", ssml_gender: "FEMALE" }
        ]
      }
    },
    "en-GB": {
      display_name: "English (UK)",
      voices: {
        MALE: [
          { name: "en-GB-Standard-B", ssml_gender: "MALE" },
          { name: "en-GB-Wavenet-B", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "en-GB-Standard-A", ssml_gender: "FEMALE" },
          { name: "en-GB-Wavenet-A", ssml_gender: "FEMALE" }
        ]
      }
    },
    "fr-FR": {
      display_name: "French (France)",
      voices: {
        MALE: [
          { name: "fr-FR-Standard-B", ssml_gender: "MALE" },
          { name: "fr-FR-Wavenet-B", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "fr-FR-Standard-A", ssml_gender: "FEMALE" },
          { name: "fr-FR-Wavenet-A", ssml_gender: "FEMALE" }
        ]
      }
    },
    "de-DE": {
      display_name: "German",
      voices: {
        MALE: [
          { name: "de-DE-Standard-B", ssml_gender: "MALE" },
          { name: "de-DE-Wavenet-B", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "de-DE-Standard-A", ssml_gender: "FEMALE" },
          { name: "de-DE-Wavenet-A", ssml_gender: "FEMALE" }
        ]
      }
    },
    "ja-JP": {
      display_name: "Japanese",
      voices: {
        MALE: [
          { name: "ja-JP-Standard-B", ssml_gender: "MALE" },
          { name: "ja-JP-Wavenet-B", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "ja-JP-Standard-A", ssml_gender: "FEMALE" },
          { name: "ja-JP-Wavenet-A", ssml_gender: "FEMALE" }
        ]
      }
    }
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Fetching Google TTS voices");
    
    // Fetch Google TTS voices
    const voices = await fetchGoogleVoices();
    
    return new Response(
      JSON.stringify(voices),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in get-google-voices function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch voices',
        fallback: true,
        data: getFallbackVoices()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
