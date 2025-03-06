
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

/**
 * Get audio history for the current user
 * @returns Array of audio files
 */
export const getAudioHistory = async () => {
  try {
    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      // For non-authenticated users, try to get temporary files from local storage
      return [];
    }
    
    // Fetch authenticated user's files
    const { data } = await fetchUserAudios(session.user.id);
    return data || [];
  } catch (error) {
    console.error('Failed to get audio history:', error);
    return [];
  }
};

/**
 * Save audio to history
 * @param audioUrl The audio URL
 * @param text The text content
 * @param language The language
 * @param voiceName The voice name
 * @param userId The user ID
 * @returns The saved audio record
 */
export const saveAudioToHistory = async (
  audioUrl: string,
  text: string,
  language: string,
  voiceName: string,
  userId: string
) => {
  const title = text.length > 50 ? `${text.substring(0, 47)}...` : text;
  
  const { data, error } = await supabase
    .from('audio_files')
    .insert({
      user_id: userId,
      audio_url: audioUrl,
      title,
      description: text,
      language,
      voice_name: voiceName,
      is_temporary: false
    })
    .select('*')
    .single();
  
  if (error) {
    console.error('Error saving audio to history:', error);
    throw error;
  }
  
  return data;
};

/**
 * Update generation count
 * @param userId The user ID
 * @returns Whether the update was successful
 */
export const updateGenerationCount = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if an entry exists for today
  const { data: existingEntry } = await supabase
    .from('generation_counts')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
  
  if (existingEntry) {
    // Update existing entry
    const { error } = await supabase
      .from('generation_counts')
      .update({ count: existingEntry.count + 1 })
      .eq('id', existingEntry.id);
    
    return !error;
  } else {
    // Create new entry
    const { error } = await supabase
      .from('generation_counts')
      .insert({
        user_id: userId,
        date: today,
        count: 1
      });
    
    return !error;
  }
};

/**
 * Get user generation statistics
 * @param userId The user ID
 * @returns Generation statistics
 */
export const getUserGenerationStats = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Get today's count
  const { data: todayData } = await supabase
    .from('generation_counts')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
  
  // Get total count
  const { data: totalData, error } = await supabase
    .from('generation_counts')
    .select('count')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching generation stats:', error);
    return { total: 0, today: 0 };
  }
  
  const total = totalData.reduce((sum, item) => sum + item.count, 0);
  
  return {
    total,
    today: todayData?.count || 0
  };
};

/**
 * Delete audio file
 * @param audioId The audio ID
 * @returns Object with success flag and possible error
 */
export const deleteAudioFile = async (audioId: string) => {
  const { error } = await supabase
    .from('audio_files')
    .delete()
    .eq('id', audioId);
  
  return { 
    success: !error,
    error: error ? error.message : null 
  };
};
