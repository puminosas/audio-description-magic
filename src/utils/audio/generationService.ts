
import { supabase } from '@/integrations/supabase/client';
import { supabaseTyped } from '../supabaseHelper';
import { LanguageOption, VoiceOption, AudioGenerationResult } from './types';

/**
 * Generate an audio description for a product
 */
export const generateAudioDescription = async (
  productText: string,
  language: string | LanguageOption,
  voice: string | VoiceOption
): Promise<AudioGenerationResult> => {
  try {
    // Extract language/voice IDs if objects were passed
    const languageId = typeof language === 'string' ? language : language.id;
    const voiceId = typeof voice === 'string' ? voice : voice.id;
    
    console.log(`Generating description for: ${productText} in language: ${languageId} with voice: ${voiceId}`);

    // Check if we have an active session
    const { data: { session } } = await supabase.auth.getSession();
    
    // We'll use Supabase Edge Function for this since it has access to OPENAI_API_KEY
    const response = await supabase.functions.invoke('generate-audio', {
      body: {
        text: productText,
        language: languageId,
        voice: voiceId
      },
      // Using public invocation for better accessibility for guest users
      headers: session ? {
        Authorization: `Bearer ${session.access_token}`
      } : undefined
    });

    console.log("Edge function response:", response);

    // Check for Edge Function errors
    if (response.error) {
      console.error('Error invoking generate-audio function:', response.error);
      return { 
        error: `Edge Function Error: ${response.error.message || 'Unknown Edge Function error'}`
      };
    }

    // Get the data from the response
    const data = response.data;

    // Check response format
    if (!data) {
      console.error('No data returned from function');
      return { error: 'No response data received from server' };
    }

    // Check for error message in the data
    if (!data.success || data.error) {
      console.error('Error in function response:', data.error);
      return { error: data.error || 'Unknown error in function response' };
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
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error generating audio';
      
    // Provide more detailed error message based on common issues
    if (errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
      return { error: 'Network error when connecting to the audio generation service. Please try again later.' };
    }
    
    if (errorMessage.includes('timeout')) {
      return { error: 'The audio generation service timed out. Please try with shorter text or try again later.' };
    }
    
    return { error: errorMessage };
  }
};
