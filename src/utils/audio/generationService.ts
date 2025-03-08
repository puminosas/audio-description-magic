
import { supabase } from '@/integrations/supabase/client';
import { AudioGenerationResult, AudioSuccessResult, AudioErrorResult, LanguageOption, VoiceOption } from './types';

// Create a simple rate limiter for API calls
const apiCallTimestamps: Record<string, number[]> = {};

const checkRateLimiting = (apiName: string, maxCalls: number, timeWindowMs: number): boolean => {
  const now = Date.now();
  const timestamps = apiCallTimestamps[apiName] || [];
  
  // Filter out timestamps older than our time window
  const recentCalls = timestamps.filter(time => (now - time) < timeWindowMs);
  
  // Add current timestamp
  recentCalls.push(now);
  apiCallTimestamps[apiName] = recentCalls;
  
  // Check if we've exceeded our rate limit
  return recentCalls.length <= maxCalls;
};

/**
 * Check if unlimited generations for all users is enabled
 */
async function isUnlimitedGenerationsEnabled(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('unlimitedgenerationsforall')
      .single();
    
    if (error) {
      console.error('Error checking unlimited generations setting:', error);
      return false;
    }
    
    return data?.unlimitedgenerationsforall || false;
  } catch (error) {
    console.error('Failed to fetch unlimited generations setting:', error);
    return false;
  }
}

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

    // Apply rate limiting - 10 calls per minute
    if (!checkRateLimiting('generateDescription', 10, 60000)) {
      return { success: false, error: 'Rate limit exceeded. Please wait a moment before generating more audio.' };
    }

    // Check if unlimited generations are enabled
    const unlimitedGenerations = await isUnlimitedGenerationsEnabled();
    
    // If unlimited generations are not enabled, check remaining generations
    if (!unlimitedGenerations) {
      // Check user's remaining generations before proceeding
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('remaining_generations')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { success: false, error: 'Could not verify your remaining generations. Please try again.' };
      }
      
      if (profileData && profileData.remaining_generations <= 0) {
        return { success: false, error: 'You have used all your daily generations. Please try again tomorrow or upgrade your plan.' };
      }
    }

    // First determine if we need to generate a description
    let finalText = text;
    
    if (text.length < 50) {
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
        } else if (descriptionData?.success && descriptionData?.generated_text) {
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
      
      // Apply rate limiting - 5 calls per minute for TTS
      if (!checkRateLimiting('generateAudio', 5, 60000)) {
        return { success: false, error: 'Rate limit exceeded for audio generation. Please wait a moment before generating more audio.' };
      }
      
      // Generate the audio using Google TTS
      const { data, error } = await supabase.functions.invoke('generate-google-tts', {
        body: {
          text: finalText,
          language: language.code,
          voice: voice.id,
          user_id: session.user.id,
          unlimited_generations: unlimitedGenerations
        }
      });

      if (error) {
        console.error('Error generating audio:', error);
        
        // Improved error message based on error type
        let errorMessage = error.message || 'Failed to generate audio';
        if (error.message?.includes('Access Denied') || error.message?.includes('Permission denied')) {
          errorMessage = 'Storage access denied. Please contact the administrator to check storage permissions.';
        } else if (error.message?.includes('timeout')) {
          errorMessage = 'The request timed out. Please try with shorter text.';
        }
        
        return { success: false, error: errorMessage };
      }

      if (!data || !data.success) {
        console.error('Invalid response from TTS service:', data);
        return { success: false, error: data?.error || 'Failed to generate audio, invalid response from server' };
      }

      // Return success response
      const result: AudioSuccessResult = {
        success: true,
        audioUrl: data.audio_url,
        text: finalText,
        id: data.fileName || crypto.randomUUID() // Store the filename as ID for reference
      };

      return result;
    } catch (audioError) {
      console.error('Connection error with audio generation service:', audioError);
      
      const errorMessage = audioError instanceof Error ? audioError.message : String(audioError);
      const isFetchError = errorMessage.includes('Failed to fetch') || errorMessage.includes('Failed to send');
      
      return { 
        success: false,
        error: isFetchError 
          ? 'Unable to connect to audio generation service. Please check your network connection and try again later.'
          : 'Error generating audio. Please try again with different text or settings.'
      };
    }
  } catch (error) {
    console.error('Error in generateAudioDescription:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate audio description' };
  }
}

/**
 * Fetch available Google TTS voices from our Supabase Edge Function
 */
export async function fetchGoogleVoices() {
  try {
    // Apply rate limiting - 1 call per minute for voice list
    if (!checkRateLimiting('fetchVoices', 1, 60000)) {
      console.warn('Rate limiting applied to voice fetching - using cached voices');
      throw new Error('Rate limit reached for voice fetching. Try again later.');
    }
    
    console.log('Fetching Google TTS voices...');
    const { data, error } = await supabase.functions.invoke('get-google-voices');
    
    if (error) {
      console.error('Error fetching Google voices:', error);
      throw new Error(error.message);
    }
    
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      throw new Error('No voices available. Google TTS API may be unreachable.');
    }
    
    console.log('Successfully fetched Google TTS voices');
    return data;
  } catch (error) {
    console.error('Error in fetchGoogleVoices:', error);
    throw error;
  }
}
