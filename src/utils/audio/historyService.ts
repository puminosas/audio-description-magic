
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
      .from('audio_history')
      .insert({
        user_id: userId,
        text_content: text,
        audio_url: audioUrl,
        language,
        voice,
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
 * Get user's audio generation history
 */
export const getAudioHistory = async () => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session?.user) {
      console.warn('No authenticated user for audio history');
      return [];
    }
    
    const { data, error } = await supabase
      .from('audio_files')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching audio history:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAudioHistory:', error);
    return [];
  }
};

/**
 * Update the user's generation count
 */
export const updateGenerationCount = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        total_generations: 1, // This will be incremented by RLS trigger
        last_generation: new Date().toISOString()
      }, {
        onConflict: 'user_id'
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
