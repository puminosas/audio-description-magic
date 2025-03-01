
import { toast } from '@/hooks/use-toast';
import { supabaseTyped } from '../supabaseHelper';
import { getSessionId } from './sessionUtils';

/**
 * Save an audio file to the user's history
 */
export const saveAudioToHistory = async (
  audioUrl: string,
  text: string,
  language: string,
  voiceName: string,
  userId?: string
) => {
  try {
    const sessionId = !userId ? getSessionId() : null;
    
    console.log(`Saving audio to history. User ID: ${userId || 'Guest'}, Session ID: ${sessionId}`);
    
    // Use the supabaseTyped helper
    const { data, error } = await supabaseTyped.audio_files
      .insert({
        user_id: userId,
        title: text.substring(0, 100),
        description: text,
        language,
        voice_name: voiceName,
        audio_url: audioUrl,
        is_temporary: !userId,
        session_id: sessionId
      });
    
    if (error) {
      console.error('Error saving audio to history:', error);
      return { error: error.message };
    }
    
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Error in saveAudioToHistory:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error saving audio' };
  }
};

/**
 * Update the generation count for a user
 */
export const updateGenerationCount = async (userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's an entry for today
    const { data: existingCount } = await supabaseTyped.generation_counts
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();
    
    if (existingCount) {
      // Update existing count
      await supabaseTyped.generation_counts
        .update({ count: existingCount.count + 1 })
        .eq('id', existingCount.id);
    } else {
      // Create new count
      await supabaseTyped.generation_counts
        .insert({
          user_id: userId,
          date: today,
          count: 1
        });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating generation count:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error updating count' };
  }
};

/**
 * Get user generation statistics
 */
export const getUserGenerationStats = async (userId: string) => {
  try {
    const { data, error } = await supabaseTyped.generation_counts
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Calculate total and recent stats
    const total = data.reduce((sum, item) => sum + item.count, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayCount = data.find(item => item.date === today)?.count || 0;
    
    return { 
      total,
      today: todayCount,
      history: data
    };
  } catch (error) {
    console.error('Error getting user generation stats:', error);
    toast({
      title: 'Error',
      description: 'Failed to load generation statistics.',
      variant: 'destructive',
    });
    return { total: 0, today: 0, history: [] };
  }
};

/**
 * Get all audio files for a user
 */
export const getUserAudioFiles = async (userId?: string) => {
  try {
    if (!userId) {
      const sessionId = getSessionId();
      const { data, error } = await supabaseTyped.audio_files
        .eq('session_id', sessionId)
        .eq('is_temporary', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      const { data, error } = await supabaseTyped.audio_files
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  } catch (error) {
    console.error('Error getting user audio files:', error);
    toast({
      title: 'Error',
      description: 'Failed to load audio history.',
      variant: 'destructive',
    });
    return [];
  }
};

/**
 * Delete an audio file
 */
export const deleteAudioFile = async (audioId: string) => {
  try {
    const { error } = await supabaseTyped.audio_files
      .delete()
      .eq('id', audioId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting audio file:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error deleting audio' };
  }
};

/**
 * Convert temporary files to permanent for a user after login
 */
export const convertTemporaryAudioFiles = async (userId: string) => {
  try {
    const sessionId = getSessionId();
    
    const { data: tempFiles, error } = await supabaseTyped.audio_files
      .eq('session_id', sessionId)
      .eq('is_temporary', true);
    
    if (error) throw error;
    
    if (tempFiles && tempFiles.length > 0) {
      for (const file of tempFiles) {
        await supabaseTyped.audio_files
          .update({
            user_id: userId,
            is_temporary: false,
            session_id: null
          })
          .eq('id', file.id);
      }
      
      return { success: true, count: tempFiles.length };
    }
    
    return { success: true, count: 0 };
  } catch (error) {
    console.error('Error converting temporary audio files:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error converting files' };
  }
};
