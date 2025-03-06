
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Cache the voices to avoid repeatedly fetching them
let cachedVoices: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    
    // Check if we have a valid cache
    if (cachedVoices && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log("Returning cached voices data");
      return new Response(JSON.stringify(cachedVoices), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get Google credentials from environment variables
    const credentialsJson = Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON");
    if (!credentialsJson) {
      console.error("Google credentials not found in environment variables");
      return new Response(JSON.stringify({
        error: "Google TTS API credentials not configured"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Parse the credentials
    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch (parseError) {
      console.error("Failed to parse Google credentials:", parseError);
      return new Response(JSON.stringify({
        error: "Invalid Google TTS API credentials format"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate that we have the necessary credentials
    if (!credentials.private_key || !credentials.client_email) {
      console.error("Invalid Google credentials format");
      return new Response(JSON.stringify({
        error: "Incomplete Google TTS API credentials"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get access token for Google API
    console.log("Getting access token for Google TTS API");
    let accessToken;
    try {
      accessToken = await getGoogleAccessToken(credentials);
      console.log("Successfully obtained access token");
    } catch (tokenError) {
      console.error("Failed to get access token:", tokenError);
      return new Response(JSON.stringify({
        error: "Failed to authenticate with Google TTS API: " + tokenError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Call the Google Cloud Text-to-Speech API to get voices
    console.log("Fetching voices from Google TTS API");
    try {
      const voicesResponse = await fetch(
        "https://texttospeech.googleapis.com/v1/voices",
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!voicesResponse.ok) {
        console.error(`API error: ${voicesResponse.status} - ${voicesResponse.statusText}`);
        return new Response(JSON.stringify({
          error: `Google TTS API responded with error: ${voicesResponse.status} ${voicesResponse.statusText}`
        }), {
          status: voicesResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const voicesData = await voicesResponse.json();
      
      if (!voicesData.voices || !Array.isArray(voicesData.voices)) {
        console.error("Invalid response format from Google TTS API");
        return new Response(JSON.stringify({
          error: "Invalid response format from Google TTS API"
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Process the voices into our desired format
      const formattedVoices = processVoices(voicesData.voices);
      
      // Update cache
      cachedVoices = formattedVoices;
      cacheTimestamp = now;
      
      console.log(`Successfully fetched ${voicesData.voices.length} voices from Google TTS API`);
      
      return new Response(JSON.stringify(formattedVoices), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } catch (apiError) {
      console.error("Error fetching voices from API:", apiError);
      return new Response(JSON.stringify({
        error: `Failed to fetch voices from Google TTS API: ${apiError.message}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(JSON.stringify({
      error: `Unhandled error in get-google-voices: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Get Google OAuth access token
async function getGoogleAccessToken(credentials: any): Promise<string> {
  try {
    // Create JWT claims for authentication
    const now = Math.floor(Date.now() / 1000);
    const expTime = now + 3600; // 1 hour
    
    const claims = {
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
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
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`Failed to get token: ${tokenResponse.status} - ${tokenResponse.statusText}`);
    }
    
    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
    
  } catch (error) {
    console.error("Error in getGoogleAccessToken:", error);
    throw error;
  }
}

// Process the raw voices data from Google into a more usable format
function processVoices(voices: any[]): any {
  const result: Record<string, any> = {};
  
  // Group voices by language code
  voices.forEach((voice) => {
    voice.languageCodes.forEach((languageCode: string) => {
      if (!result[languageCode]) {
        result[languageCode] = {
          display_name: getLanguageDisplayName(languageCode),
          voices: {
            MALE: [],
            FEMALE: [],
          },
        };
      }
      
      // Add the voice to the appropriate gender category
      if (voice.ssmlGender === "MALE" || voice.ssmlGender === "FEMALE") {
        result[languageCode].voices[voice.ssmlGender].push({
          name: voice.name,
          ssml_gender: voice.ssmlGender,
        });
      }
    });
  });
  
  return result;
}

// Get a human-readable language name from a language code
function getLanguageDisplayName(code: string): string {
  const languageNames: Record<string, string> = {
    "en-US": "English (US)",
    "en-GB": "English (UK)",
    "es-ES": "Spanish (Spain)",
    "es-US": "Spanish (US)",
    "fr-FR": "French (France)",
    "de-DE": "German (Germany)",
    "it-IT": "Italian (Italy)",
    "ja-JP": "Japanese (Japan)",
    "ko-KR": "Korean (Korea)",
    "pt-BR": "Portuguese (Brazil)",
    "ru-RU": "Russian (Russia)",
    "zh-CN": "Chinese (Mandarin)",
    "nl-NL": "Dutch (Netherlands)",
    "hi-IN": "Hindi (India)",
    "ar-XA": "Arabic",
    "cs-CZ": "Czech (Czech Republic)",
    "da-DK": "Danish (Denmark)",
    "fi-FI": "Finnish (Finland)",
    "el-GR": "Greek (Greece)",
    "hu-HU": "Hungarian (Hungary)",
    "id-ID": "Indonesian (Indonesia)",
    "nb-NO": "Norwegian (Norway)",
    "pl-PL": "Polish (Poland)",
    "sk-SK": "Slovak (Slovakia)",
    "sv-SE": "Swedish (Sweden)",
    "tr-TR": "Turkish (Turkey)",
    "uk-UA": "Ukrainian (Ukraine)",
    "vi-VN": "Vietnamese (Vietnam)",
    "lt-LT": "Lithuanian (Lithuania)",
  };
  
  return languageNames[code] || code;
}
