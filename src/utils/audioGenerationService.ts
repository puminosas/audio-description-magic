import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { supabaseTyped } from './supabaseHelper';

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
  // Additional languages
  { id: 'zh', code: 'zh', name: 'Chinese', nativeText: '中文', nativeName: '中文', flag: '🇨🇳' },
  { id: 'ja', code: 'ja', name: 'Japanese', nativeText: '日本語', nativeName: '日本語', flag: '🇯🇵' },
  { id: 'ko', code: 'ko', name: 'Korean', nativeText: '한국어', nativeName: '한국어', flag: '🇰🇷' },
  { id: 'ru', code: 'ru', name: 'Russian', nativeText: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
  { id: 'ar', code: 'ar', name: 'Arabic', nativeText: 'العربية', nativeName: 'العربية', flag: '🇸🇦' },
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
    // Additional premium voices
    { id: 'aria', name: 'Aria', gender: 'female', premium: true },
    { id: 'roger', name: 'Roger', gender: 'male', premium: true },
    { id: 'sarah', name: 'Sarah', gender: 'female', premium: true },
    { id: 'daniel', name: 'Daniel', gender: 'male', premium: true },
    { id: 'emma', name: 'Emma', gender: 'female', premium: true },
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
  productText: string,
  language: string | LanguageOption,
  voice: string | VoiceOption
) => {
  try {
    // Extract language/voice IDs if objects were passed
    const languageId = typeof language === 'string' ? language : language.id;
    const voiceId = typeof voice === 'string' ? voice : voice.id;
    
    console.log(`Generating description for: ${productText} in language: ${languageId} with voice: ${voiceId}`);

    // We'll use Supabase Edge Function for this since it has access to OPENAI_API_KEY
    // and we don't want to expose the key in the client-side code
    const { data, error } = await supabase.functions.invoke('generate-audio', {
      body: {
        text: productText,
        language: languageId,
        voice: voiceId
      }
    });

    // Log detailed error information
    if (error) {
      console.error('Error invoking generate-audio function:', error);
      return { error: `Edge Function Error: ${error.message}` };
    }

    // Check response format
    if (!data) {
      console.error('No data returned from function');
      return { error: 'No response data received from server' };
    }

    // Check for error message in the data
    if (data.error) {
      console.error('Error in function response:', data.error);
      return { error: data.error };
    }

    // Check for missing audioUrl
    if (!data.audioUrl) {
      console.error('No audio URL returned from function', data);
      return { error: 'Failed to generate audio. No audio URL returned.' };
    }

    console.log('Successfully generated audio:', data);
    
    return {
      audioUrl: data.audioUrl,
      text: data.text || productText,
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
    
    console.log(`Saving audio to history. User ID: ${userId || 'Guest'}, Session ID: ${sessionId}`);
    
    // Use the supabaseTyped helper
    const { data, error } = await supabaseTyped.audio_files
      .insert({
        user_id: userId,
        title: text.substring(0, 100),
        description: text,
        language,
        voice_name: voiceName,
        audio_url: audioUrl,
        is_temporary: !userId,
        session_id: sessionId
      });
    
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
    const { data: existingCount } = await supabaseTyped.generation_counts
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();
    
    if (existingCount) {
      // Update existing count
      await supabaseTyped.generation_counts
        .update({ count: existingCount.count + 1 })
        .eq('id', existingCount.id);
    } else {
      // Create new count
      await supabaseTyped.generation_counts
        .insert({
          user_id: userId,
          date: today,
          count: 1
        });
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

/**
 * Get user generation statistics
 */
export const getUserGenerationStats = async (userId: string) => {
  try {
    const { data, error } = await supabaseTyped.generation_counts
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Calculate total and recent stats
    const total = data.reduce((sum, item) => sum + item.count, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayCount = data.find(item => item.date === today)?.count || 0;
    
    return { 
      total,
      today: todayCount,
      history: data
    };
  } catch (error) {
    console.error('Error getting user generation stats:', error);
    toast({
      title: 'Error',
      description: 'Failed to load generation statistics.',
      variant: 'destructive',
    });
    return { total: 0, today: 0, history: [] };
  }
};

/**
 * Get all audio files for a user
 */
export const getUserAudioFiles = async (userId?: string) => {
  try {
    if (!userId) {
      const sessionId = getSessionId();
      const { data, error } = await supabaseTyped.audio_files
        .eq('session_id', sessionId)
        .eq('is_temporary', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      const { data, error } = await supabaseTyped.audio_files
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  } catch (error) {
    console.error('Error getting user audio files:', error);
    toast({
      title: 'Error',
      description: 'Failed to load audio history.',
      variant: 'destructive',
    });
    return [];
  }
};

/**
 * Delete an audio file
 */
export const deleteAudioFile = async (audioId: string) => {
  try {
    const { error } = await supabaseTyped.audio_files
      .delete()
      .eq('id', audioId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting audio file:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error deleting audio' };
  }
};

/**
 * Convert temporary files to permanent for a user after login
 */
export const convertTemporaryAudioFiles = async (userId: string) => {
  try {
    const sessionId = getSessionId();
    
    const { data: tempFiles, error } = await supabaseTyped.audio_files
      .eq('session_id', sessionId)
      .eq('is_temporary', true);
    
    if (error) throw error;
    
    if (tempFiles && tempFiles.length > 0) {
      for (const file of tempFiles) {
        await supabaseTyped.audio_files
          .update({
            user_id: userId,
            is_temporary: false,
            session_id: null
          })
          .eq('id', file.id);
      }
      
      return { success: true, count: tempFiles.length };
    }
    
    return { success: true, count: 0 };
  } catch (error) {
    console.error('Error converting temporary audio files:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error converting files' };
  }
};
