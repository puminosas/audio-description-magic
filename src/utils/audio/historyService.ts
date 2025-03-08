
import { supabase } from '@/integrations/supabase/client';

/**
 * Save generated audio to the user's history
 */
export const saveAudioToHistory = async (
  audioUrl: string,
  text: string,
  language: string,
  voice: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('audio_files')
      .insert({
        user_id: userId,
        title: text.substring(0, 100), // Use first 100 chars as title
        description: text,
        audio_url: audioUrl,
        language,
        voice_name: voice,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error saving to history:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveAudioToHistory:', error);
    return false;
  }
};

/**
 * Get user's audio generation history with pagination support
 * @param page Page number starting from 1
 * @param pageSize Number of items per page
 * @returns Paginated audio history data
 */
export const getAudioHistory = async (page = 1, pageSize = 10) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session?.user) {
      console.warn('No authenticated user for audio history');
      return { data: [], count: 0 };
    }
    
    // Calculate pagination offset
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Get count first for pagination info
    const { count, error: countError } = await supabase
      .from('audio_files')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.session.user.id);
      
    if (countError) {
      console.error('Error fetching count:', countError);
      return { data: [], count: 0 };
    }
    
    // Then get paginated data
    const { data, error } = await supabase
      .from('audio_files')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);
      
    if (error) {
      console.error('Error fetching audio history:', error);
      return { data: [], count: 0 };
    }
    
    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error('Error in getAudioHistory:', error);
    return { data: [], count: 0 };
  }
};

/**
 * Update the user's generation count
 */
export const updateGenerationCount = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('generation_counts')
      .upsert({
        user_id: userId,
        count: 1, // This will be incremented by database trigger if one exists
        date: new Date().toISOString().split('T')[0] // Get date part only
      }, {
        onConflict: 'user_id,date'
      });
      
    if (error) {
      console.error('Error updating generation count:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateGenerationCount:', error);
    return false;
  }
};

/**
 * Delete an audio file from history
 */
export const deleteAudioFile = async (fileId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('audio_files')
      .delete()
      .eq('id', fileId);
      
    if (error) {
      console.error('Error deleting audio file:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteAudioFile:', error);
    return false;
  }
};

/**
 * Fetch limited audio files for a user with optimized query
 */
export const fetchUserAudios = async (userId: string, limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('audio_files')
      .select('id, title, description, audio_url, voice_name, language, created_at') // Select only needed fields
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching user audios:', error);
      return { data: [] };
    }
    
    return { data: data || [] };
  } catch (error) {
    console.error('Error in fetchUserAudios:', error);
    return { data: [] };
  }
};
