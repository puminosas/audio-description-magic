
import { supabase } from '@/integrations/supabase/client';

// Define types for language and voice options
export interface LanguageOption {
  id: string;
  name: string;
  nativeText: string;
  code: string;
  nativeName: string;
  flag?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: "male" | "female" | "neutral";
  preview?: string;
  premium?: boolean;
}

// Available languages
const LANGUAGES: LanguageOption[] = [
  { id: 'en', code: 'en', name: 'English', nativeText: 'English', nativeName: 'English', flag: '🇺🇸' },
  { id: 'es', code: 'es', name: 'Spanish', nativeText: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  { id: 'fr', code: 'fr', name: 'French', nativeText: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { id: 'de', code: 'de', name: 'German', nativeText: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
  { id: 'it', code: 'it', name: 'Italian', nativeText: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹' },
  { id: 'pt', code: 'pt', name: 'Portuguese', nativeText: 'Português', nativeName: 'Português', flag: '🇵🇹' },
  // Add more languages as needed
];

// Available voices with properly typed gender
const VOICES: Record<string, VoiceOption[]> = {
  all: [
    // OpenAI voices
    { id: 'alloy', name: 'Alloy', gender: 'neutral' },
    { id: 'echo', name: 'Echo', gender: 'male' },
    { id: 'fable', name: 'Fable', gender: 'female' },
    { id: 'onyx', name: 'Onyx', gender: 'male' },
    { id: 'nova', name: 'Nova', gender: 'female' },
    { id: 'shimmer', name: 'Shimmer', gender: 'female', premium: true },
    // Add more voices as needed
  ]
};

/**
 * Get available languages
 */
export const getAvailableLanguages = (): LanguageOption[] => {
  return LANGUAGES;
};

/**
 * Get available voices for a specific language
 */
export const getAvailableVoices = (languageCode: string): VoiceOption[] => {
  // For now, return all voices for any language as modern TTS can handle multiple languages
  return VOICES.all;
};

/**
 * Generate an audio description for a product
 */
export const generateAudioDescription = async (
  productName: string,
  language: string | LanguageOption,
  voice: string | VoiceOption
) => {
  try {
    // Extract language/voice IDs if objects were passed
    const languageId = typeof language === 'string' ? language : language.id;
    const voiceId = typeof voice === 'string' ? voice : voice.id;
    
    console.log(`Generating description for: ${productName}`);

    // We'll use Supabase Edge Function for this since it has access to OPENAI_API_KEY
    // and we don't want to expose the key in the client-side code
    const { data, error } = await supabase.functions.invoke('generate-audio', {
      body: {
        productName,
        language: languageId,
        voice: voiceId
      }
    });

    if (error) {
      console.error('Error invoking generate-audio function:', error);
      return { error: error.message };
    }

    return {
      audioUrl: data.audioUrl,
      text: data.description,
      id: data.id
    };
  } catch (error) {
    console.error('Error in generateAudioDescription:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error generating audio' };
  }
};

/**
 * Save an audio file to the user's history
 */
export const saveAudioToHistory = async (
  audioUrl: string,
  text: string,
  language: string,
  voiceName: string,
  userId?: string
) => {
  try {
    const sessionId = !userId ? getSessionId() : null;
    
    // Use the any-typed client to bypass TypeScript checking
    const { data, error } = await (supabase as any)
      .from('audio_files')
      .insert([{
        user_id: userId,
        title: text.substring(0, 100),
        description: text,
        language,
        voice_name: voiceName,
        audio_url: audioUrl,
        is_temporary: !userId,
        session_id: sessionId
      }])
      .select('*')
      .single();
    
    if (error) {
      console.error('Error saving audio to history:', error);
      return { error: error.message };
    }
    
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Error in saveAudioToHistory:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error saving audio' };
  }
};

/**
 * Update the generation count for a user
 */
export const updateGenerationCount = async (userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's an entry for today
    const { data: existingCount } = await (supabase as any)
      .from('generation_counts')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    if (existingCount) {
      // Update existing count
      await (supabase as any)
        .from('generation_counts')
        .update({ count: existingCount.count + 1 })
        .eq('id', existingCount.id);
    } else {
      // Create new count
      await (supabase as any)
        .from('generation_counts')
        .insert([{
          user_id: userId,
          date: today,
          count: 1
        }]);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating generation count:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error updating count' };
  }
};

/**
 * Get a session ID for tracking guest users
 */
const getSessionId = (): string => {
  const storageKey = 'audioDesc_guestSessionId';
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
};
