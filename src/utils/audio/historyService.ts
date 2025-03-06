
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Function to save an audio file to history
export const saveAudioToHistory = async (
  audioUrl: string,
  textContent: string,
  language: string,
  voice: string,
  userId: string
) => {
  try {
    const timestamp = new Date().toISOString();
    const fileName = `audio_${timestamp}.mp3`;
    
    // Insert file metadata into database
    const { data, error } = await supabase
      .from('audio_files')
      .insert({
        id: uuidv4(),
        user_id: userId,
        file_name: fileName,
        file_path: `${userId}/${fileName}`,
        storage_url: audioUrl,
        language: language,
        voice: voice,
        text_content: textContent.substring(0, 1000), // Store first 1000 chars
        created_at: timestamp
      });
    
    if (error) {
      console.error('Error saving to history:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to save audio to history:', error);
    throw error;
  }
};

// Function to get audio file history for a user
export const getAudioHistory = async () => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Return empty array if no user logged in
      return [];
    }
    
    // Check for audio files in the session if user is not authenticated
    if (!user.id) {
      return [];
    }
    
    // Get the user's audio files
    const { data, error } = await supabase
      .from('audio_files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching audio history:', error);
      throw error;
    }
    
    // Map the database data to the expected format
    return data.map((file: any) => ({
      id: file.id,
      fileName: file.file_name,
      filePath: file.file_path,
      audioUrl: file.storage_url,
      fileType: 'audio/mpeg',
      language: file.language,
      voice: file.voice,
      textContent: file.text_content,
      createdAt: new Date(file.created_at)
    }));
  } catch (error) {
    console.error('Failed to get audio history:', error);
    throw error;
  }
};

// Function to delete an audio file
export const deleteAudioFile = async (fileId: string) => {
  try {
    // Get the file info first
    const { data: file, error: fetchError } = await supabase
      .from('audio_files')
      .select('*')
      .eq('id', fileId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching file data:', fetchError);
      throw fetchError;
    }
    
    // Delete the database record
    const { error: deleteError } = await supabase
      .from('audio_files')
      .delete()
      .eq('id', fileId);
    
    if (deleteError) {
      console.error('Error deleting file record:', deleteError);
      throw deleteError;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete audio file:', error);
    throw error;
  }
};

// Function to update the generation count for a user
export const updateGenerationCount = async (userId: string) => {
  try {
    // Get current user stats
    const { data: existingStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (statsError && statsError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching user stats:', statsError);
      throw statsError;
    }
    
    if (existingStats) {
      // Update existing stats
      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          generation_count: existingStats.generation_count + 1,
          last_generation_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating user stats:', updateError);
        throw updateError;
      }
    } else {
      // Create new stats
      const { error: insertError } = await supabase
        .from('user_stats')
        .insert({
          user_id: userId,
          generation_count: 1,
          last_generation_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating user stats:', insertError);
        throw insertError;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update generation count:', error);
    throw error;
  }
};
