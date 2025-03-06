
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
        console.log(`Generating description for: ${text} in language: ${language.code}`);
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
        } else if (descriptionData && descriptionData.success && descriptionData.generated_text) {
          finalText = descriptionData.generated_text;
          console.log('Successfully generated description:', finalText.substring(0, 50) + '...');
        } else {
          console.warn('Description generation returned unexpected format:', descriptionData);
        }
      } catch (descError) {
        console.error('Failed to connect to description service:', descError);
      }
    }

    try {
      console.log(`Generating audio for ${finalText.substring(0, 30)}... with voice ${voice.id}`);
      
      // For short descriptions, try using OpenAI first (as a fallback)
      if (finalText.length < 500) {
        try {
          console.log("Attempting to generate with OpenAI TTS (faster response)...");
          const { data: openaiData, error: openaiError } = await supabase.functions.invoke('generate-audio', {
            body: {
              text: finalText,
              language: language.code,
              voice: voice.name.toLowerCase()
            }
          });
          
          if (!openaiError && openaiData && openaiData.success && openaiData.audioUrl) {
            console.log("Successfully generated audio with OpenAI TTS");
            return {
              audioUrl: openaiData.audioUrl,
              text: finalText,
              folderUrl: null
            };
          } else {
            console.log("OpenAI TTS failed, falling back to Google TTS");
          }
        } catch (openaiErr) {
          console.log("OpenAI TTS error, falling back to Google TTS:", openaiErr);
        }
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

      if (error) {
        console.error('Error generating audio:', error);
        return { error: error.message || 'Failed to generate audio' };
      }

      if (!data || !data.success) {
        console.error('Invalid response from TTS service:', data);
        return { error: data?.error || 'Failed to generate audio, invalid response from server' };
      }

      // Return success response
      const result: AudioSuccessResult = {
        audioUrl: data.audio_url,
        text: finalText,
        folderUrl: data.folder_url || null
      };

      return result;
    } catch (audioError) {
      console.error('Connection error with audio generation service:', audioError);
      
      const errorMessage = audioError instanceof Error ? audioError.message : String(audioError);
      const isFetchError = errorMessage.includes('Failed to fetch') || errorMessage.includes('Failed to send');
      
      return { 
        error: isFetchError 
          ? 'Unable to connect to audio generation service. Please check your network connection and try again later.'
          : 'Error generating audio. Please try again with different text or settings.'
      };
    }
  } catch (error) {
    console.error('Error in generateAudioDescription:', error);
    return { error: error instanceof Error ? error.message : 'Failed to generate audio description' };
  }
}

/**
 * Fetch available Google TTS voices from our Supabase Edge Function
 */
export async function fetchGoogleVoices() {
  try {
    console.log('Fetching Google TTS voices...');
    const { data, error } = await supabase.functions.invoke('get-google-voices');
    
    if (error) {
      console.error('Error fetching Google voices:', error);
      throw new Error(error.message);
    }
    
    console.log('Successfully fetched Google TTS voices');
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
