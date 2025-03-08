
import { AudioSuccessResult, AudioErrorResult } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { checkRateLimiting } from '../rateLimiting';

/**
 * Generate audio using Google TTS via Supabase Edge Function
 */
export async function generateAudio(
  text: string,
  languageCode: string,
  voiceId: string,
  userId: string,
  unlimitedGenerations: boolean
): Promise<AudioSuccessResult | AudioErrorResult> {
  try {
    console.log(`Generating audio for ${text.substring(0, 30)}... with voice ${voiceId}`);
    
    // Apply rate limiting - 5 calls per minute for TTS
    if (!checkRateLimiting('generateAudio', 5, 60000)) {
      return { 
        success: false, 
        error: 'Rate limit exceeded for audio generation. Please wait a moment before generating more audio.'
      };
    }
    
    // Generate the audio using Google TTS
    const { data, error } = await supabase.functions.invoke('generate-google-tts', {
      body: {
        text,
        language: languageCode,
        voice: voiceId,
        user_id: userId,
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
    return {
      success: true,
      audioUrl: data.audio_url,
      text,
      id: data.fileName || crypto.randomUUID() // Store the filename as ID for reference
    };
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
}
