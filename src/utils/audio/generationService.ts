
import { supabase } from '@/integrations/supabase/client';
import { AudioGenerationResult, AudioSuccessResult, AudioErrorResult, LanguageOption, VoiceOption } from './types';

/**
 * Generate an audio description using Google Text-to-Speech via our Supabase Edge Function
 */
export async function generateAudioDescription(
  text: string,
  language: LanguageOption,
  voice: VoiceOption
): Promise<AudioGenerationResult> {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { error: 'Authentication required to generate audio descriptions' };
    }

    // First determine if we need to generate a description
    let finalText = text;
    
    if (text.length < 20) {
      // This is likely a product name, so generate a description
      const { data: descriptionData, error: descriptionError } = await supabase.functions.invoke('generate-description', {
        body: {
          product_name: text,
          language: language.code,
          voice_name: voice.name
        }
      });

      if (descriptionError || !descriptionData.success) {
        console.error('Error generating description:', descriptionError || descriptionData.error);
        return { error: 'Failed to generate product description' };
      }

      finalText = descriptionData.generated_text;
    }

    // Now generate the audio using Google TTS
    const { data, error } = await supabase.functions.invoke('generate-google-tts', {
      body: {
        text: finalText,
        language: language.code,
        voice: voice.id,
        user_id: session.user.id
      }
    });

    if (error || !data.success) {
      console.error('Error generating audio:', error || data.error);
      return { error: error?.message || data?.error || 'Failed to generate audio' };
    }

    // Return success response
    const result: AudioSuccessResult = {
      audioUrl: data.audio_url,
      text: finalText,
    };

    return result;
  } catch (error) {
    console.error('Error in generateAudioDescription:', error);
    return { error: error.message || 'Failed to generate audio description' };
  }
}

/**
 * Fetch available Google TTS voices from our Supabase Edge Function
 */
export async function fetchGoogleVoices() {
  try {
    const { data, error } = await supabase.functions.invoke('get-google-voices');
    
    if (error) {
      console.error('Error fetching Google voices:', error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchGoogleVoices:', error);
    throw error;
  }
}
