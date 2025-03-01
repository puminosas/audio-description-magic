
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch user's audio files
 * @param userId The user ID
 * @param limit Optional limit on number of results
 * @returns Array of audio files
 */
export const fetchUserAudios = async (userId: string, limit?: number) => {
  let query = supabase
    .from('audio_files')
    .select('*')
    .eq('user_id', userId)
    .eq('is_temporary', false)
    .order('created_at', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching user audios:', error);
    throw error;
  }
  
  return { data, error };
};

// Alias for backward compatibility
export const fetchUserAudioHistory = fetchUserAudios;
