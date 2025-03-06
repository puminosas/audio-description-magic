
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
        audio_url: audioUrl,
        title: fileName,
        language: language,
        voice_name: voice,
        user_id: userId,
        description: textContent.substring(0, 1000), // Store first 1000 chars
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
      fileName: file.title,
      filePath: file.audio_url,
      audioUrl: file.audio_url,
      fileType: 'audio/mpeg',
      language: file.language,
      voice: file.voice_name,
      textContent: file.description,
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
    // First, check if we have a generation_counts table
    const { error: checkError } = await supabase
      .from('generation_counts')
      .select('count')
      .eq('user_id', userId)
      .single();
    
    // If the table exists, update the count
    if (!checkError || checkError.code !== 'PGRST116') { // Not a "table doesn't exist" error
      try {
        const { data: existingRecord, error: fetchError } = await supabase
          .from('generation_counts')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') { // "No rows returned" is okay
          console.error('Error fetching generation count:', fetchError);
          return false;
        }
        
        if (existingRecord) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('generation_counts')
            .update({
              count: existingRecord.count + 1,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
          
          if (updateError) {
            console.error('Error updating generation count:', updateError);
            return false;
          }
        } else {
          // Create new record
          const { error: insertError } = await supabase
            .from('generation_counts')
            .insert({
              user_id: userId,
              count: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Error creating generation count:', insertError);
            return false;
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error handling generation count:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update generation count:', error);
    return false;
  }
};
