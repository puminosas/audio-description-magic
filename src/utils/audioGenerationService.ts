
import { supabase } from '@/integrations/supabase/client';
import { supabaseTyped } from '@/utils/supabaseHelper';
import { User } from '@supabase/supabase-js';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  sample?: string;
  premium?: boolean;
}

export interface GenerateAudioParams {
  text: string;
  language: LanguageOption;
  voice: VoiceOption;
}

export interface SaveAudioParams {
  audioUrl: string;
  audioData: string;
  text: string;
  generatedText: string;
  language: LanguageOption;
  voice: VoiceOption;
  user: User;
}

// Base64 to Blob conversion for creating audio URL
export const base64ToBlob = (base64: string, mimeType: string) => {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
};

// Generate audio via Supabase Edge Function
export const generateAudio = async ({ text, language, voice }: GenerateAudioParams) => {
  // Call the Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('generate-audio', {
    body: {
      text: text.trim(),
      language: language.code,
      voice: voice.id,
    },
  });
  
  if (error) throw error;
  
  if (!data.success || !data.audio_content) {
    throw new Error(data.error || 'Failed to generate audio');
  }
  
  // Create a blob from the base64 audio data
  const audioBlob = base64ToBlob(data.audio_content, 'audio/mpeg');
  const url = URL.createObjectURL(audioBlob);
  
  return {
    audioUrl: url,
    audioData: data.audio_content,
    generatedText: data.generated_text
  };
};

// Save audio to user's history in Supabase
export const saveAudioToHistory = async ({
  audioUrl,
  audioData,
  text,
  generatedText,
  language,
  voice,
  user
}: SaveAudioParams) => {
  try {
    // Generate filename based on first few words of text and timestamp
    const firstWords = text.trim().split(' ').slice(0, 5).join('-');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${firstWords.toLowerCase()}-${timestamp}.mp3`;
    
    // Get audio duration - this is a dummy calculation since we don't have actual duration
    // In a production app, you'd want to properly calculate this
    const approximateDuration = Math.max(10, Math.ceil(generatedText.length / 20));
    
    // Insert record into audio_files table
    const { error } = await supabaseTyped.audio_files
      .insert({
        user_id: user?.id,
        title: text.trim().substring(0, 50) + (text.length > 50 ? '...' : ''),
        description: generatedText, // Save the generated description here
        language: language.code,
        voice_name: voice.name,
        audio_url: audioUrl, // Note: this URL will expire when the page refreshes
        audio_data: audioData, // Store the base64 data
        duration: approximateDuration,
      });
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error saving audio to history:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
