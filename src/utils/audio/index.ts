
import { getAvailableLanguages, getAvailableVoices, initializeGoogleVoices, getVoicesForLanguage } from './languageVoiceData';
import { LanguageOption, VoiceOption, AudioGenerationResult, AudioSuccessResult, AudioErrorResult } from './types';
import { saveAudioToHistory, updateGenerationCount, getUserGenerationStats } from './historyService';

// Function to generate audio description (placeholder until we connect to the real API)
export const generateAudioDescription = async (
  text: string,
  language: LanguageOption,
  voice: VoiceOption
): Promise<AudioGenerationResult> => {
  try {
    // Call Supabase Edge Function for Google TTS
    const response = await fetch('https://cttaphbzhmheecbqhtjj.supabase.co/functions/v1/generate-google-tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        language_code: language.code,
        voice_name: voice.id,
        voice_gender: voice.gender
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Failed to generate audio'
      };
    }

    return {
      success: true,
      audioUrl: data.audio_url,
      text: text,
      id: data.id || crypto.randomUUID()
    };
  } catch (error) {
    console.error('Error generating audio description:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Re-export types for easier importing
export type { LanguageOption, VoiceOption, AudioGenerationResult, AudioSuccessResult, AudioErrorResult };

// Re-export functions for easier importing
export {
  getAvailableLanguages,
  getAvailableVoices,
  initializeGoogleVoices,
  getVoicesForLanguage,
  saveAudioToHistory,
  updateGenerationCount,
  getUserGenerationStats
};
