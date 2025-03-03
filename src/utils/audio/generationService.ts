
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
      try {
        // This is likely a product name, so generate a description
        const { data: descriptionData, error: descriptionError } = await supabase.functions.invoke('generate-description', {
          body: {
            product_name: text,
            language: language.code,
            voice_name: voice.name
          }
        });

        if (descriptionError) {
          console.error('Error generating description:', descriptionError);
          // Continue with original text if description generation fails
        } else if (descriptionData && descriptionData.success) {
          finalText = descriptionData.generated_text;
        }
      } catch (descError) {
        console.error('Failed to connect to description service:', descError);
        // Continue with original text if connection fails
      }
    }

    try {
      // Now generate the audio using Google TTS
      const { data, error } = await supabase.functions.invoke('generate-google-tts', {
        body: {
          text: finalText,
          language: language.code,
          voice: voice.id,
          user_id: session.user.id
        }
      });

      if (error) {
        console.error('Error generating audio:', error);
        return { error: error.message || 'Failed to generate audio' };
      }

      if (!data || !data.success) {
        return { error: data?.error || 'Failed to generate audio, invalid response from server' };
      }

      // Return success response
      const result: AudioSuccessResult = {
        audioUrl: data.audio_url,
        text: finalText,
      };

      return result;
    } catch (audioError) {
      console.error('Connection error with audio generation service:', audioError);
      return { error: 'Unable to connect to audio generation service. Please try again later.' };
    }
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
    
    // Return fallback voice data if API call fails
    return {
      "en-US": {
        display_name: "English (US)",
        voices: {
          MALE: [{ name: "en-US-Wavenet-A", ssml_gender: "MALE" }],
          FEMALE: [{ name: "en-US-Wavenet-C", ssml_gender: "FEMALE" }]
        }
      }
    };
  }
}
