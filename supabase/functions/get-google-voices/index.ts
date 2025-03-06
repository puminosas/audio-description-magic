
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
    
    // Fetch the Google OAuth token
    const credentials = {
      type: Deno.env.get("GOOGLE_CREDENTIALS_TYPE"),
      project_id: Deno.env.get("GOOGLE_CREDENTIALS_PROJECT_ID"),
      private_key_id: Deno.env.get("GOOGLE_CREDENTIALS_PRIVATE_KEY_ID"),
      private_key: Deno.env.get("GOOGLE_CREDENTIALS_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
      client_email: Deno.env.get("GOOGLE_CREDENTIALS_CLIENT_EMAIL"),
      client_id: Deno.env.get("GOOGLE_CREDENTIALS_CLIENT_ID"),
      auth_uri: Deno.env.get("GOOGLE_CREDENTIALS_AUTH_URI"),
      token_uri: Deno.env.get("GOOGLE_CREDENTIALS_TOKEN_URI"),
      auth_provider_x509_cert_url: Deno.env.get("GOOGLE_CREDENTIALS_AUTH_PROVIDER_CERT_URL"),
      client_x509_cert_url: Deno.env.get("GOOGLE_CREDENTIALS_CLIENT_CERT_URL"),
    };
    
    // Validate that we have the necessary credentials
    if (!credentials.private_key || !credentials.client_email) {
      console.error("Missing Google credentials");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error: Missing Google credentials",
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Get Google OAuth token
    let accessToken;
    try {
      const tokenResponse = await fetch(
        "https://oauth2.googleapis.com/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: generateJWT(
              credentials.client_email,
              credentials.private_key,
              "https://texttospeech.googleapis.com"
            ),
          }),
        }
      );
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Failed to get access token: ${errorText}`);
      }
      
      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;
      
      if (!accessToken) {
        throw new Error("No access token in response");
      }
      
    } catch (error) {
      console.error("Error obtaining access token:", error);
      return getDefaultVoicesResponse();
    }
    
    // Call the Google Cloud Text-to-Speech API to get available voices
    try {
      const voicesResponse = await fetch(
        "https://texttospeech.googleapis.com/v1/voices",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!voicesResponse.ok) {
        const errorText = await voicesResponse.text();
        throw new Error(`Failed to fetch voices: ${errorText}`);
      }
      
      const voicesData = await voicesResponse.json();
      
      // Process the voices into a more usable format
      const processedVoices = processVoices(voicesData.voices || []);
      
      // Cache the processed data
      cachedVoices = processedVoices;
      cacheTimestamp = now;
      
      return new Response(
        JSON.stringify(processedVoices),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (error) {
      console.error("Error fetching voices:", error);
      return getDefaultVoicesResponse();
    }
    
  } catch (error) {
    console.error("Unhandled error:", error);
    return getDefaultVoicesResponse();
  }
});

// Helper function to generate a JWT for Google authentication
function generateJWT(clientEmail: string, privateKey: string, audience: string): string {
  const now = Math.floor(Date.now() / 1000);
  const oneHourFromNow = now + 3600;
  
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: audience,
    iat: now,
    exp: oneHourFromNow,
  };
  
  // Encode the JWT header and payload
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // Create the content to sign
  const signContent = `${encodedHeader}.${encodedPayload}`;
  
  // Sign the content with the private key
  const textEncoder = new TextEncoder();
  const signBytes = textEncoder.encode(signContent);
  
  const privateKeyObject = crypto.subtle.importKey(
    "pkcs8",
    str2ab(pemToDer(privateKey)),
    { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );
  
  return privateKeyObject.then((key) =>
    crypto.subtle.sign({ name: "RSASSA-PKCS1-v1_5" }, key, signBytes)
  ).then((signature) => {
    const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)));
    return `${signContent}.${base64Signature}`;
  });
}

// Helper function to convert PEM format to DER format
function pemToDer(pem: string): ArrayBuffer {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  
  const binary = atob(pemContents);
  return str2ab(binary);
}

// Helper function to convert a string to an ArrayBuffer
function str2ab(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// Process the raw voices data from Google into a more usable format
function processVoices(voices: any[]): any {
  const result: Record<string, any> = {};
  
  // Group voices by language code
  voices.forEach((voice) => {
    const languageCode = voice.languageCode;
    
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

// Return default voices when we can't fetch from the API
function getDefaultVoicesResponse() {
  console.log("Returning default voices data");
  
  const defaultVoices = {
    "en-US": {
      display_name: "English (US)",
      voices: {
        MALE: [
          { name: "en-US-Wavenet-A", ssml_gender: "MALE" },
          { name: "en-US-Wavenet-B", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "en-US-Wavenet-C", ssml_gender: "FEMALE" },
          { name: "en-US-Wavenet-E", ssml_gender: "FEMALE" }
        ]
      }
    },
    "es-ES": {
      display_name: "Spanish (Spain)",
      voices: {
        MALE: [{ name: "es-ES-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "es-ES-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "fr-FR": {
      display_name: "French (France)",
      voices: {
        MALE: [{ name: "fr-FR-Wavenet-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "fr-FR-Wavenet-A", ssml_gender: "FEMALE" }]
      }
    },
    "lt-LT": {
      display_name: "Lithuanian (Lithuania)",
      voices: {
        MALE: [{ name: "lt-LT-Standard-A", ssml_gender: "MALE" }],
        FEMALE: [{ name: "lt-LT-Standard-B", ssml_gender: "FEMALE" }]
      }
    }
  };
  
  return new Response(
    JSON.stringify(defaultVoices),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
