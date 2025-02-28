
import { supabase } from '@/integrations/supabase/client';
import { supabaseTyped } from './supabaseHelper';
import { saveBlobAsFile, getOrCreateGuestSessionId } from './fileStorageService';

// Reuse the types from the components
import { LanguageOption } from '@/components/ui/LanguageSelector';
import { VoiceOption } from '@/components/ui/VoiceSelector';

export type { LanguageOption, VoiceOption };

export interface AudioGenerationResult {
  audioUrl?: string;
  error?: string;
  text?: string;
  id?: string;
}

export const generateAudioDescription = async (
  productName: string,
  language: LanguageOption,
  voice: VoiceOption
): Promise<AudioGenerationResult> => {
  try {
    console.log(`Generating audio for: ${productName} in ${language.name} with voice ${voice.name}`);
    
    const { data, error } = await supabase.functions.invoke('generate-audio', {
      body: {
        text: productName,
        language: language.code,
        voiceId: voice.id
      },
    });

    if (error) {
      console.error('Error invoking generate-audio function:', error);
      return { error: error.message };
    }

    if (!data || !data.success) {
      console.error('Generation failed:', data?.error || 'Unknown error');
      return { error: data?.error || 'Failed to generate audio' };
    }

    console.log('Audio generated successfully:', data);
    
    return {
      audioUrl: data.audioUrl,
      text: data.text,
      id: data.id
    };
  } catch (error) {
    console.error('Error in generateAudioDescription:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error generating audio'
    };
  }
};

// Save the generated audio to the user's history
export const saveAudioToHistory = async (
  audioUrl: string,
  text: string,
  language: string,
  voiceName: string,
  userId?: string
): Promise<string | null> => {
  try {
    // Create a file name from the text
    const sanitizedText = text.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${sanitizedText}_${Date.now()}.mp3`;
    
    // Fetch the audio file
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio file: ${response.statusText}`);
    }
    
    const audioBlob = await response.blob();
    
    // Save the file to storage
    const sessionId = !userId ? getOrCreateGuestSessionId() : undefined;
    const fileMetadata = await saveBlobAsFile(audioBlob, fileName, userId);
    
    if (!fileMetadata) {
      throw new Error('Failed to save audio file');
    }
    
    // Add to audio_files table
    const { data, error } = await supabaseTyped.audio_files
      .insert([{
        user_id: userId,
        title: text.substring(0, 50),
        description: text.substring(0, 200),
        language: language,
        voice_name: voiceName,
        audio_url: fileMetadata.filePath,
        file_id: fileMetadata.id,
        is_temporary: !userId,
        session_id: sessionId
      }])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error saving to audio_files:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('Error in saveAudioToHistory:', error);
    return null;
  }
};

// Update the generation count for the user
export const updateGenerationCount = async (userId?: string): Promise<void> => {
  if (!userId) return;
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have a count for today
    const { data: existingData, error: fetchError } = await supabaseTyped.generation_counts
      .select()
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching generation count:', fetchError);
      return;
    }
    
    if (existingData) {
      // Update existing count
      const { error: updateError } = await supabaseTyped.generation_counts
        .update({ count: existingData.count + 1 })
        .eq('id', existingData.id);
      
      if (updateError) {
        console.error('Error updating generation count:', updateError);
      }
    } else {
      // Create new count
      const { error: insertError } = await supabaseTyped.generation_counts
        .insert([{
          user_id: userId,
          date: today,
          count: 1
        }]);
      
      if (insertError) {
        console.error('Error inserting generation count:', insertError);
      }
    }
  } catch (error) {
    console.error('Error in updateGenerationCount:', error);
  }
};

export const getAvailableLanguages = (): LanguageOption[] => {
  return [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  ];
};

export const getAvailableVoices = (languageCode: string): VoiceOption[] => {
  // Default voices that work for all languages
  return [
    { id: 'alloy', name: 'Alloy', gender: 'neutral' },
    { id: 'echo', name: 'Echo', gender: 'male' },
    { id: 'fable', name: 'Fable', gender: 'female' },
    { id: 'onyx', name: 'Onyx', gender: 'male' },
    { id: 'nova', name: 'Nova', gender: 'female' },
    { id: 'shimmer', name: 'Shimmer', gender: 'female', premium: true },
  ];
};
