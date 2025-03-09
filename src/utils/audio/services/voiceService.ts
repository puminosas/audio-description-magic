
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
    
    console.log('Fetching Google TTS voices from Edge Function...');
    
    // Important fix: Use proper environment variable handling for Vite
    // and correctly pass the anon key in the headers
    const { data, error } = await supabase.functions.invoke('get-google-voices', {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      }
    });
    
    if (error) {
      console.error('Error fetching Google voices:', error);
      throw error;
    }
    
    // Check if we got fallback data due to an error
    if (data && data.fallbackUsed) {
      console.warn('Using fallback voice data:', data.message || 'Unknown error');
      // We still have data in data.data, so continue
      return data.data;
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
