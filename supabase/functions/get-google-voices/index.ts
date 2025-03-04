
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Since the googleapis.deno.dev import is failing, we'll create a function 
// to fetch the voices directly from the Google API
async function fetchGoogleVoices() {
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
    
    // Call Google Text-to-Speech API to list voices
    const response = await fetch(
      "https://texttospeech.googleapis.com/v1beta1/voices",
      {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Google API error:", await response.text());
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Process the raw voices data into our preferred format - matching the Python example
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
            
            // Determine the gender category - exactly like the Python example
            if (voice.ssmlGender === "MALE" || voice.ssmlGender === "FEMALE") {
              const gender = voice.ssmlGender; // Already "MALE" or "FEMALE"
              
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
