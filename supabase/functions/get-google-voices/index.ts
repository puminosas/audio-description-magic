
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
    
    console.log("Returning comprehensive default voices data since Google API authentication is not working");
    const comprehensiveVoices = getComprehensiveDefaultVoices();
    
    // Cache the comprehensive default voices
    cachedVoices = comprehensiveVoices;
    cacheTimestamp = now;
    
    return new Response(
      JSON.stringify(comprehensiveVoices),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Unhandled error:", error);
    return getComprehensiveDefaultVoicesResponse();
  }
});

// Return a comprehensive set of default voices covering many languages
function getComprehensiveDefaultVoicesResponse() {
  console.log("Returning comprehensive default voices response");
  
  return new Response(
    JSON.stringify(getComprehensiveDefaultVoices()),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// This function provides a much more comprehensive list of Google TTS voices
function getComprehensiveDefaultVoices() {
  return {
    "af-ZA": {
      display_name: "Afrikaans (South Africa)",
      voices: {
        MALE: [{ name: "af-ZA-Standard-A", ssml_gender: "MALE" }],
        FEMALE: []
      }
    },
    "ar-XA": {
      display_name: "Arabic",
      voices: {
        MALE: [{ name: "ar-XA-Standard-B", ssml_gender: "MALE" }, { name: "ar-XA-Standard-D", ssml_gender: "MALE" }],
        FEMALE: [{ name: "ar-XA-Standard-A", ssml_gender: "FEMALE" }, { name: "ar-XA-Standard-C", ssml_gender: "FEMALE" }]
      }
    },
    "bn-IN": {
      display_name: "Bengali (India)",
      voices: {
        MALE: [{ name: "bn-IN-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "bn-IN-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "bg-BG": {
      display_name: "Bulgarian (Bulgaria)",
      voices: {
        MALE: [{ name: "bg-BG-Standard-A", ssml_gender: "MALE" }],
        FEMALE: []
      }
    },
    "ca-ES": {
      display_name: "Catalan (Spain)",
      voices: {
        MALE: [{ name: "ca-ES-Standard-A", ssml_gender: "MALE" }],
        FEMALE: []
      }
    },
    "zh-CN": {
      display_name: "Chinese (Mandarin)",
      voices: {
        MALE: [
          { name: "zh-CN-Standard-B", ssml_gender: "MALE" },
          { name: "zh-CN-Standard-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "zh-CN-Standard-A", ssml_gender: "FEMALE" },
          { name: "zh-CN-Standard-C", ssml_gender: "FEMALE" }
        ]
      }
    },
    "zh-HK": {
      display_name: "Chinese (Hong Kong)",
      voices: {
        MALE: [{ name: "zh-HK-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "zh-HK-Standard-A", ssml_gender: "FEMALE" }, { name: "zh-HK-Standard-C", ssml_gender: "FEMALE" }]
      }
    },
    "zh-TW": {
      display_name: "Chinese (Taiwan)",
      voices: {
        MALE: [{ name: "zh-TW-Standard-B", ssml_gender: "MALE" }, { name: "zh-TW-Standard-D", ssml_gender: "MALE" }],
        FEMALE: [{ name: "zh-TW-Standard-A", ssml_gender: "FEMALE" }, { name: "zh-TW-Standard-C", ssml_gender: "FEMALE" }]
      }
    },
    "cs-CZ": {
      display_name: "Czech (Czech Republic)",
      voices: {
        MALE: [{ name: "cs-CZ-Standard-A", ssml_gender: "MALE" }],
        FEMALE: [{ name: "cs-CZ-Standard-B", ssml_gender: "FEMALE" }]
      }
    },
    "da-DK": {
      display_name: "Danish (Denmark)",
      voices: {
        MALE: [{ name: "da-DK-Standard-C", ssml_gender: "MALE" }, { name: "da-DK-Standard-E", ssml_gender: "MALE" }],
        FEMALE: [{ name: "da-DK-Standard-A", ssml_gender: "FEMALE" }, { name: "da-DK-Standard-D", ssml_gender: "FEMALE" }]
      }
    },
    "nl-BE": {
      display_name: "Dutch (Belgium)",
      voices: {
        MALE: [{ name: "nl-BE-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "nl-BE-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "nl-NL": {
      display_name: "Dutch (Netherlands)",
      voices: {
        MALE: [{ name: "nl-NL-Standard-B", ssml_gender: "MALE" }, { name: "nl-NL-Standard-D", ssml_gender: "MALE" }],
        FEMALE: [{ name: "nl-NL-Standard-A", ssml_gender: "FEMALE" }, { name: "nl-NL-Standard-C", ssml_gender: "FEMALE" }, { name: "nl-NL-Standard-E", ssml_gender: "FEMALE" }]
      }
    },
    "en-AU": {
      display_name: "English (Australia)",
      voices: {
        MALE: [
          { name: "en-AU-Standard-B", ssml_gender: "MALE" },
          { name: "en-AU-Standard-D", ssml_gender: "MALE" },
          { name: "en-AU-Wavenet-B", ssml_gender: "MALE" },
          { name: "en-AU-Wavenet-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "en-AU-Standard-A", ssml_gender: "FEMALE" },
          { name: "en-AU-Standard-C", ssml_gender: "FEMALE" },
          { name: "en-AU-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "en-AU-Wavenet-C", ssml_gender: "FEMALE" }
        ]
      }
    },
    "en-GB": {
      display_name: "English (UK)",
      voices: {
        MALE: [
          { name: "en-GB-Standard-B", ssml_gender: "MALE" },
          { name: "en-GB-Standard-D", ssml_gender: "MALE" },
          { name: "en-GB-Wavenet-B", ssml_gender: "MALE" },
          { name: "en-GB-Wavenet-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "en-GB-Standard-A", ssml_gender: "FEMALE" },
          { name: "en-GB-Standard-C", ssml_gender: "FEMALE" },
          { name: "en-GB-Standard-F", ssml_gender: "FEMALE" },
          { name: "en-GB-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "en-GB-Wavenet-C", ssml_gender: "FEMALE" },
          { name: "en-GB-Wavenet-F", ssml_gender: "FEMALE" }
        ]
      }
    },
    "en-IN": {
      display_name: "English (India)",
      voices: {
        MALE: [
          { name: "en-IN-Standard-B", ssml_gender: "MALE" },
          { name: "en-IN-Standard-D", ssml_gender: "MALE" },
          { name: "en-IN-Wavenet-B", ssml_gender: "MALE" },
          { name: "en-IN-Wavenet-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "en-IN-Standard-A", ssml_gender: "FEMALE" },
          { name: "en-IN-Standard-C", ssml_gender: "FEMALE" },
          { name: "en-IN-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "en-IN-Wavenet-C", ssml_gender: "FEMALE" }
        ]
      }
    },
    "en-US": {
      display_name: "English (US)",
      voices: {
        MALE: [
          { name: "en-US-Standard-A", ssml_gender: "MALE" },
          { name: "en-US-Standard-B", ssml_gender: "MALE" },
          { name: "en-US-Standard-D", ssml_gender: "MALE" },
          { name: "en-US-Standard-I", ssml_gender: "MALE" },
          { name: "en-US-Standard-J", ssml_gender: "MALE" },
          { name: "en-US-Wavenet-A", ssml_gender: "MALE" },
          { name: "en-US-Wavenet-B", ssml_gender: "MALE" },
          { name: "en-US-Wavenet-D", ssml_gender: "MALE" },
          { name: "en-US-Wavenet-I", ssml_gender: "MALE" },
          { name: "en-US-Wavenet-J", ssml_gender: "MALE" },
          { name: "en-US-Neural2-A", ssml_gender: "MALE" },
          { name: "en-US-Neural2-D", ssml_gender: "MALE" },
          { name: "en-US-Neural2-I", ssml_gender: "MALE" },
          { name: "en-US-Neural2-J", ssml_gender: "MALE" },
          { name: "en-US-Polyglot-1", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "en-US-Standard-C", ssml_gender: "FEMALE" },
          { name: "en-US-Standard-E", ssml_gender: "FEMALE" },
          { name: "en-US-Standard-F", ssml_gender: "FEMALE" },
          { name: "en-US-Standard-G", ssml_gender: "FEMALE" },
          { name: "en-US-Standard-H", ssml_gender: "FEMALE" },
          { name: "en-US-Wavenet-C", ssml_gender: "FEMALE" },
          { name: "en-US-Wavenet-E", ssml_gender: "FEMALE" },
          { name: "en-US-Wavenet-F", ssml_gender: "FEMALE" },
          { name: "en-US-Wavenet-G", ssml_gender: "FEMALE" },
          { name: "en-US-Wavenet-H", ssml_gender: "FEMALE" },
          { name: "en-US-Neural2-C", ssml_gender: "FEMALE" },
          { name: "en-US-Neural2-E", ssml_gender: "FEMALE" },
          { name: "en-US-Neural2-F", ssml_gender: "FEMALE" },
          { name: "en-US-Neural2-G", ssml_gender: "FEMALE" },
          { name: "en-US-Neural2-H", ssml_gender: "FEMALE" },
          { name: "en-US-Studio-O", ssml_gender: "FEMALE" }
        ]
      }
    },
    "fil-PH": {
      display_name: "Filipino (Philippines)",
      voices: {
        MALE: [{ name: "fil-PH-Standard-B", ssml_gender: "MALE" }, { name: "fil-PH-Standard-D", ssml_gender: "MALE" }],
        FEMALE: [{ name: "fil-PH-Standard-A", ssml_gender: "FEMALE" }, { name: "fil-PH-Standard-C", ssml_gender: "FEMALE" }]
      }
    },
    "fi-FI": {
      display_name: "Finnish (Finland)",
      voices: {
        MALE: [{ name: "fi-FI-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "fi-FI-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "fr-CA": {
      display_name: "French (Canada)",
      voices: {
        MALE: [
          { name: "fr-CA-Standard-B", ssml_gender: "MALE" },
          { name: "fr-CA-Standard-D", ssml_gender: "MALE" },
          { name: "fr-CA-Wavenet-B", ssml_gender: "MALE" },
          { name: "fr-CA-Wavenet-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "fr-CA-Standard-A", ssml_gender: "FEMALE" },
          { name: "fr-CA-Standard-C", ssml_gender: "FEMALE" },
          { name: "fr-CA-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "fr-CA-Wavenet-C", ssml_gender: "FEMALE" }
        ]
      }
    },
    "fr-FR": {
      display_name: "French (France)",
      voices: {
        MALE: [
          { name: "fr-FR-Standard-B", ssml_gender: "MALE" },
          { name: "fr-FR-Standard-D", ssml_gender: "MALE" },
          { name: "fr-FR-Wavenet-B", ssml_gender: "MALE" },
          { name: "fr-FR-Wavenet-D", ssml_gender: "MALE" },
          { name: "fr-FR-Neural2-B", ssml_gender: "MALE" },
          { name: "fr-FR-Neural2-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "fr-FR-Standard-A", ssml_gender: "FEMALE" },
          { name: "fr-FR-Standard-C", ssml_gender: "FEMALE" },
          { name: "fr-FR-Standard-E", ssml_gender: "FEMALE" },
          { name: "fr-FR-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "fr-FR-Wavenet-C", ssml_gender: "FEMALE" },
          { name: "fr-FR-Wavenet-E", ssml_gender: "FEMALE" },
          { name: "fr-FR-Neural2-A", ssml_gender: "FEMALE" },
          { name: "fr-FR-Neural2-C", ssml_gender: "FEMALE" },
          { name: "fr-FR-Neural2-E", ssml_gender: "FEMALE" }
        ]
      }
    },
    "de-DE": {
      display_name: "German (Germany)",
      voices: {
        MALE: [
          { name: "de-DE-Standard-B", ssml_gender: "MALE" },
          { name: "de-DE-Standard-D", ssml_gender: "MALE" },
          { name: "de-DE-Standard-E", ssml_gender: "MALE" },
          { name: "de-DE-Wavenet-B", ssml_gender: "MALE" },
          { name: "de-DE-Wavenet-D", ssml_gender: "MALE" },
          { name: "de-DE-Wavenet-E", ssml_gender: "MALE" },
          { name: "de-DE-Neural2-B", ssml_gender: "MALE" },
          { name: "de-DE-Neural2-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "de-DE-Standard-A", ssml_gender: "FEMALE" },
          { name: "de-DE-Standard-C", ssml_gender: "FEMALE" },
          { name: "de-DE-Standard-F", ssml_gender: "FEMALE" },
          { name: "de-DE-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "de-DE-Wavenet-C", ssml_gender: "FEMALE" },
          { name: "de-DE-Wavenet-F", ssml_gender: "FEMALE" },
          { name: "de-DE-Neural2-A", ssml_gender: "FEMALE" },
          { name: "de-DE-Neural2-C", ssml_gender: "FEMALE" },
          { name: "de-DE-Neural2-F", ssml_gender: "FEMALE" }
        ]
      }
    },
    "el-GR": {
      display_name: "Greek (Greece)",
      voices: {
        MALE: [{ name: "el-GR-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "el-GR-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "gu-IN": {
      display_name: "Gujarati (India)",
      voices: {
        MALE: [{ name: "gu-IN-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "gu-IN-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "he-IL": {
      display_name: "Hebrew (Israel)",
      voices: {
        MALE: [{ name: "he-IL-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "he-IL-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "hi-IN": {
      display_name: "Hindi (India)",
      voices: {
        MALE: [
          { name: "hi-IN-Standard-B", ssml_gender: "MALE" },
          { name: "hi-IN-Standard-D", ssml_gender: "MALE" },
          { name: "hi-IN-Wavenet-B", ssml_gender: "MALE" },
          { name: "hi-IN-Wavenet-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "hi-IN-Standard-A", ssml_gender: "FEMALE" },
          { name: "hi-IN-Standard-C", ssml_gender: "FEMALE" },
          { name: "hi-IN-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "hi-IN-Wavenet-C", ssml_gender: "FEMALE" }
        ]
      }
    },
    "hu-HU": {
      display_name: "Hungarian (Hungary)",
      voices: {
        MALE: [{ name: "hu-HU-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "hu-HU-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "is-IS": {
      display_name: "Icelandic (Iceland)",
      voices: {
        MALE: [{ name: "is-IS-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "is-IS-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "id-ID": {
      display_name: "Indonesian (Indonesia)",
      voices: {
        MALE: [
          { name: "id-ID-Standard-B", ssml_gender: "MALE" },
          { name: "id-ID-Standard-D", ssml_gender: "MALE" },
          { name: "id-ID-Wavenet-B", ssml_gender: "MALE" },
          { name: "id-ID-Wavenet-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "id-ID-Standard-A", ssml_gender: "FEMALE" },
          { name: "id-ID-Standard-C", ssml_gender: "FEMALE" },
          { name: "id-ID-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "id-ID-Wavenet-C", ssml_gender: "FEMALE" }
        ]
      }
    },
    "it-IT": {
      display_name: "Italian (Italy)",
      voices: {
        MALE: [
          { name: "it-IT-Standard-B", ssml_gender: "MALE" },
          { name: "it-IT-Standard-D", ssml_gender: "MALE" },
          { name: "it-IT-Wavenet-B", ssml_gender: "MALE" },
          { name: "it-IT-Wavenet-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "it-IT-Standard-A", ssml_gender: "FEMALE" },
          { name: "it-IT-Standard-C", ssml_gender: "FEMALE" },
          { name: "it-IT-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "it-IT-Wavenet-C", ssml_gender: "FEMALE" }
        ]
      }
    },
    "ja-JP": {
      display_name: "Japanese (Japan)",
      voices: {
        MALE: [
          { name: "ja-JP-Standard-B", ssml_gender: "MALE" },
          { name: "ja-JP-Standard-D", ssml_gender: "MALE" },
          { name: "ja-JP-Wavenet-B", ssml_gender: "MALE" },
          { name: "ja-JP-Wavenet-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "ja-JP-Standard-A", ssml_gender: "FEMALE" },
          { name: "ja-JP-Standard-C", ssml_gender: "FEMALE" },
          { name: "ja-JP-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "ja-JP-Wavenet-C", ssml_gender: "FEMALE" }
        ]
      }
    },
    "kn-IN": {
      display_name: "Kannada (India)",
      voices: {
        MALE: [{ name: "kn-IN-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "kn-IN-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "ko-KR": {
      display_name: "Korean (South Korea)",
      voices: {
        MALE: [
          { name: "ko-KR-Standard-B", ssml_gender: "MALE" },
          { name: "ko-KR-Standard-D", ssml_gender: "MALE" },
          { name: "ko-KR-Wavenet-B", ssml_gender: "MALE" },
          { name: "ko-KR-Wavenet-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "ko-KR-Standard-A", ssml_gender: "FEMALE" },
          { name: "ko-KR-Standard-C", ssml_gender: "FEMALE" },
          { name: "ko-KR-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "ko-KR-Wavenet-C", ssml_gender: "FEMALE" }
        ]
      }
    },
    "lv-LV": {
      display_name: "Latvian (Latvia)",
      voices: {
        MALE: [{ name: "lv-LV-Standard-A", ssml_gender: "MALE" }],
        FEMALE: []
      }
    },
    "lt-LT": {
      display_name: "Lithuanian (Lithuania)",
      voices: {
        MALE: [{ name: "lt-LT-Standard-A", ssml_gender: "MALE" }],
        FEMALE: [{ name: "lt-LT-Standard-B", ssml_gender: "FEMALE" }]
      }
    },
    "ms-MY": {
      display_name: "Malay (Malaysia)",
      voices: {
        MALE: [{ name: "ms-MY-Standard-B", ssml_gender: "MALE" }, { name: "ms-MY-Standard-D", ssml_gender: "MALE" }],
        FEMALE: [{ name: "ms-MY-Standard-A", ssml_gender: "FEMALE" }, { name: "ms-MY-Standard-C", ssml_gender: "FEMALE" }]
      }
    },
    "ml-IN": {
      display_name: "Malayalam (India)",
      voices: {
        MALE: [{ name: "ml-IN-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "ml-IN-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "nb-NO": {
      display_name: "Norwegian (Norway)",
      voices: {
        MALE: [{ name: "nb-NO-Standard-B", ssml_gender: "MALE" }, { name: "nb-NO-Standard-D", ssml_gender: "MALE" }],
        FEMALE: [{ name: "nb-NO-Standard-A", ssml_gender: "FEMALE" }, { name: "nb-NO-Standard-C", ssml_gender: "FEMALE" }, { name: "nb-NO-Standard-E", ssml_gender: "FEMALE" }]
      }
    },
    "pl-PL": {
      display_name: "Polish (Poland)",
      voices: {
        MALE: [
          { name: "pl-PL-Standard-B", ssml_gender: "MALE" },
          { name: "pl-PL-Standard-C", ssml_gender: "MALE" },
          { name: "pl-PL-Wavenet-B", ssml_gender: "MALE" },
          { name: "pl-PL-Wavenet-C", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "pl-PL-Standard-A", ssml_gender: "FEMALE" },
          { name: "pl-PL-Standard-D", ssml_gender: "FEMALE" },
          { name: "pl-PL-Standard-E", ssml_gender: "FEMALE" },
          { name: "pl-PL-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "pl-PL-Wavenet-D", ssml_gender: "FEMALE" },
          { name: "pl-PL-Wavenet-E", ssml_gender: "FEMALE" }
        ]
      }
    },
    "pt-BR": {
      display_name: "Portuguese (Brazil)",
      voices: {
        MALE: [
          { name: "pt-BR-Standard-B", ssml_gender: "MALE" },
          { name: "pt-BR-Wavenet-B", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "pt-BR-Standard-A", ssml_gender: "FEMALE" },
          { name: "pt-BR-Wavenet-A", ssml_gender: "FEMALE" }
        ]
      }
    },
    "pt-PT": {
      display_name: "Portuguese (Portugal)",
      voices: {
        MALE: [{ name: "pt-PT-Standard-B", ssml_gender: "MALE" }, { name: "pt-PT-Standard-D", ssml_gender: "MALE" }],
        FEMALE: [{ name: "pt-PT-Standard-A", ssml_gender: "FEMALE" }, { name: "pt-PT-Standard-C", ssml_gender: "FEMALE" }]
      }
    },
    "pa-IN": {
      display_name: "Punjabi (India)",
      voices: {
        MALE: [{ name: "pa-IN-Standard-B", ssml_gender: "MALE" }, { name: "pa-IN-Standard-D", ssml_gender: "MALE" }],
        FEMALE: [{ name: "pa-IN-Standard-A", ssml_gender: "FEMALE" }, { name: "pa-IN-Standard-C", ssml_gender: "FEMALE" }]
      }
    },
    "ro-RO": {
      display_name: "Romanian (Romania)",
      voices: {
        MALE: [{ name: "ro-RO-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "ro-RO-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "ru-RU": {
      display_name: "Russian (Russia)",
      voices: {
        MALE: [
          { name: "ru-RU-Standard-B", ssml_gender: "MALE" },
          { name: "ru-RU-Standard-D", ssml_gender: "MALE" },
          { name: "ru-RU-Wavenet-B", ssml_gender: "MALE" },
          { name: "ru-RU-Wavenet-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "ru-RU-Standard-A", ssml_gender: "FEMALE" },
          { name: "ru-RU-Standard-C", ssml_gender: "FEMALE" },
          { name: "ru-RU-Standard-E", ssml_gender: "FEMALE" },
          { name: "ru-RU-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "ru-RU-Wavenet-C", ssml_gender: "FEMALE" },
          { name: "ru-RU-Wavenet-E", ssml_gender: "FEMALE" }
        ]
      }
    },
    "sr-RS": {
      display_name: "Serbian (Serbia)",
      voices: {
        MALE: [{ name: "sr-RS-Standard-A", ssml_gender: "MALE" }],
        FEMALE: []
      }
    },
    "sk-SK": {
      display_name: "Slovak (Slovakia)",
      voices: {
        MALE: [{ name: "sk-SK-Standard-A", ssml_gender: "MALE" }],
        FEMALE: []
      }
    },
    "es-ES": {
      display_name: "Spanish (Spain)",
      voices: {
        MALE: [
          { name: "es-ES-Standard-B", ssml_gender: "MALE" },
          { name: "es-ES-Standard-D", ssml_gender: "MALE" },
          { name: "es-ES-Wavenet-B", ssml_gender: "MALE" },
          { name: "es-ES-Wavenet-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "es-ES-Standard-A", ssml_gender: "FEMALE" },
          { name: "es-ES-Standard-C", ssml_gender: "FEMALE" },
          { name: "es-ES-Wavenet-C", ssml_gender: "FEMALE" }
        ]
      }
    },
    "es-US": {
      display_name: "Spanish (US)",
      voices: {
        MALE: [
          { name: "es-US-Standard-B", ssml_gender: "MALE" },
          { name: "es-US-Standard-C", ssml_gender: "MALE" },
          { name: "es-US-Wavenet-B", ssml_gender: "MALE" },
          { name: "es-US-Wavenet-C", ssml_gender: "MALE" },
          { name: "es-US-Neural2-B", ssml_gender: "MALE" },
          { name: "es-US-Neural2-C", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "es-US-Standard-A", ssml_gender: "FEMALE" },
          { name: "es-US-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "es-US-Neural2-A", ssml_gender: "FEMALE" }
        ]
      }
    },
    "sv-SE": {
      display_name: "Swedish (Sweden)",
      voices: {
        MALE: [{ name: "sv-SE-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "sv-SE-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "ta-IN": {
      display_name: "Tamil (India)",
      voices: {
        MALE: [{ name: "ta-IN-Standard-B", ssml_gender: "MALE" }, { name: "ta-IN-Standard-D", ssml_gender: "MALE" }],
        FEMALE: [{ name: "ta-IN-Standard-A", ssml_gender: "FEMALE" }, { name: "ta-IN-Standard-C", ssml_gender: "FEMALE" }]
      }
    },
    "te-IN": {
      display_name: "Telugu (India)",
      voices: {
        MALE: [{ name: "te-IN-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "te-IN-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "th-TH": {
      display_name: "Thai (Thailand)",
      voices: {
        MALE: [{ name: "th-TH-Standard-B", ssml_gender: "MALE" }],
        FEMALE: [{ name: "th-TH-Standard-A", ssml_gender: "FEMALE" }]
      }
    },
    "tr-TR": {
      display_name: "Turkish (Turkey)",
      voices: {
        MALE: [
          { name: "tr-TR-Standard-B", ssml_gender: "MALE" },
          { name: "tr-TR-Standard-D", ssml_gender: "MALE" },
          { name: "tr-TR-Wavenet-B", ssml_gender: "MALE" },
          { name: "tr-TR-Wavenet-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "tr-TR-Standard-A", ssml_gender: "FEMALE" },
          { name: "tr-TR-Standard-C", ssml_gender: "FEMALE" },
          { name: "tr-TR-Standard-E", ssml_gender: "FEMALE" },
          { name: "tr-TR-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "tr-TR-Wavenet-C", ssml_gender: "FEMALE" },
          { name: "tr-TR-Wavenet-E", ssml_gender: "FEMALE" }
        ]
      }
    },
    "uk-UA": {
      display_name: "Ukrainian (Ukraine)",
      voices: {
        MALE: [{ name: "uk-UA-Standard-A", ssml_gender: "MALE" }],
        FEMALE: []
      }
    },
    "vi-VN": {
      display_name: "Vietnamese (Vietnam)",
      voices: {
        MALE: [
          { name: "vi-VN-Standard-B", ssml_gender: "MALE" },
          { name: "vi-VN-Standard-D", ssml_gender: "MALE" },
          { name: "vi-VN-Wavenet-B", ssml_gender: "MALE" },
          { name: "vi-VN-Wavenet-D", ssml_gender: "MALE" }
        ],
        FEMALE: [
          { name: "vi-VN-Standard-A", ssml_gender: "FEMALE" },
          { name: "vi-VN-Standard-C", ssml_gender: "FEMALE" },
          { name: "vi-VN-Wavenet-A", ssml_gender: "FEMALE" },
          { name: "vi-VN-Wavenet-C", ssml_gender: "FEMALE" }
        ]
      }
    }
  };
}
