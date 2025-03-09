
// Fallback data for when the Google API is unavailable
export const fallbackVoices = {
  "en-US": {
    display_name: "English (US)",
    voices: {
      MALE: [
        { name: "en-US-Standard-A", ssml_gender: "MALE" },
        { name: "en-US-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "en-US-Standard-C", ssml_gender: "FEMALE" },
        { name: "en-US-Standard-E", ssml_gender: "FEMALE" }
      ]
    }
  },
  "en-GB": {
    display_name: "English (UK)",
    voices: {
      MALE: [
        { name: "en-GB-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "en-GB-Standard-A", ssml_gender: "FEMALE" }
      ]
    }
  },
  "es-ES": {
    display_name: "Spanish (Spain)",
    voices: {
      MALE: [
        { name: "es-ES-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "es-ES-Standard-A", ssml_gender: "FEMALE" }
      ]
    }
  },
  "fr-FR": {
    display_name: "French (France)",
    voices: {
      MALE: [
        { name: "fr-FR-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "fr-FR-Standard-A", ssml_gender: "FEMALE" }
      ]
    }
  },
  "de-DE": {
    display_name: "German (Germany)",
    voices: {
      MALE: [
        { name: "de-DE-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "de-DE-Standard-A", ssml_gender: "FEMALE" }
      ]
    }
  },
  "zh-CN": {
    display_name: "Chinese (Mandarin)",
    voices: {
      MALE: [
        { name: "zh-CN-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "zh-CN-Standard-A", ssml_gender: "FEMALE" }
      ]
    }
  },
  "ja-JP": {
    display_name: "Japanese",
    voices: {
      MALE: [
        { name: "ja-JP-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "ja-JP-Standard-A", ssml_gender: "FEMALE" }
      ]
    }
  },
  "ru-RU": {
    display_name: "Russian",
    voices: {
      MALE: [
        { name: "ru-RU-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "ru-RU-Standard-A", ssml_gender: "FEMALE" }
      ]
    }
  },
  "ar-XA": {
    display_name: "Arabic",
    voices: {
      MALE: [
        { name: "ar-XA-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "ar-XA-Standard-A", ssml_gender: "FEMALE" }
      ]
    }
  },
  "hi-IN": {
    display_name: "Hindi (India)",
    voices: {
      MALE: [
        { name: "hi-IN-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "hi-IN-Standard-A", ssml_gender: "FEMALE" }
      ]
    }
  },
  "pt-BR": {
    display_name: "Portuguese (Brazil)",
    voices: {
      MALE: [
        { name: "pt-BR-Standard-B", ssml_gender: "MALE" }
      ],
      FEMALE: [
        { name: "pt-BR-Standard-A", ssml_gender: "FEMALE" }
      ]
    }
  }
};

// Language display name mapping
export const languageDisplayNames: Record<string, string> = {
  "en-US": "English (US)",
  "en-GB": "English (UK)",
  "es-ES": "Spanish (Spain)",
  "fr-FR": "French (France)",
  "de-DE": "German (Germany)",
  "zh-CN": "Chinese (Mandarin)",
  "ja-JP": "Japanese",
  "ru-RU": "Russian",
  "ar-XA": "Arabic",
  "hi-IN": "Hindi (India)",
  "pt-BR": "Portuguese (Brazil)",
  "it-IT": "Italian",
  "ko-KR": "Korean",
  "pl-PL": "Polish",
  "nl-NL": "Dutch",
  "cs-CZ": "Czech",
  "da-DK": "Danish",
  "fi-FI": "Finnish",
  "el-GR": "Greek",
  "hu-HU": "Hungarian",
  "id-ID": "Indonesian",
  "nb-NO": "Norwegian",
  "ro-RO": "Romanian",
  "sk-SK": "Slovak",
  "sv-SE": "Swedish",
  "tr-TR": "Turkish",
  "uk-UA": "Ukrainian",
  "vi-VN": "Vietnamese",
  "cmn-CN": "Chinese (Mandarin, Simplified)",
  "cmn-TW": "Chinese (Traditional)"
};
