
import { supabase } from '@/integrations/supabase/client';
import { checkRateLimiting } from '../rateLimiting';

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
