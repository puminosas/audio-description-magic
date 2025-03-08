
import { AudioGenerationResult, AudioSuccessResult, AudioErrorResult, LanguageOption, VoiceOption } from './types';
import { isUnlimitedGenerationsEnabled } from './unlimitedGenerations';
import { checkUserRemainingGenerations } from './quotaManagement';
import { generateDescription } from './descriptionGenerator';
import { generateAudio } from './audioGenerator';
import { fetchGoogleVoices } from './googleVoices';
import { supabase } from '@/integrations/supabase/client';

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
      return { success: false, error: 'Authentication required to generate audio descriptions' };
    }

    // Check if unlimited generations are enabled
    const unlimitedGenerations = await isUnlimitedGenerationsEnabled();
    
    // If unlimited generations are not enabled, check remaining generations
    if (!unlimitedGenerations) {
      const { hasGenerationsLeft, error } = await checkUserRemainingGenerations(session.user.id);
      
      if (!hasGenerationsLeft) {
        return { success: false, error };
      }
    }

    // First determine if we need to generate a description
    let finalText = await generateDescription(text, language.code, voice.name);

    try {
      // Generate the audio using the potentially enhanced text
      const result = await generateAudio(
        finalText, 
        language.code, 
        voice.id, 
        session.user.id, 
        unlimitedGenerations
      );
      
      return result;
    } catch (audioError) {
      console.error('Error in audio generation step:', audioError);
      return { 
        success: false, 
        error: audioError instanceof Error ? audioError.message : 'Unknown error in audio generation'
      };
    }
  } catch (error) {
    console.error('Error in generateAudioDescription:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate audio description' 
    };
  }
}

// Re-export the Google voices fetching function
export { fetchGoogleVoices };
