
import { supabase } from '@/integrations/supabase/client';

// Function to get Google TTS voices from Edge Function
export async function fetchGoogleVoices() {
  try {
    const { data, error } = await supabase.functions.invoke('get-google-voices');
    
    if (error) {
      throw new Error(`Failed to fetch Google voices: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching Google voices:', error);
    throw error;
  }
}

// Add more API functions as needed
