
import { supabase } from '@/integrations/supabase/client';
import { FileMetadata } from './types';

// Cast the Supabase client to any to bypass TypeScript checking
const db = supabase as any;

/**
 * Get a list of user files
 */
export const getUserFiles = async (
  userId?: string,
  sessionId?: string
): Promise<FileMetadata[]> => {
  try {
    let query = db.from('user_files').select('*');
    
    if (userId) {
      // Authenticated user - get their files
      query = query.eq('user_id', userId).order('created_at', { ascending: false });
    } else if (sessionId) {
      // Guest user - get temporary files for their session
      query = query.eq('session_id', sessionId).eq('is_temporary', true).order('created_at', { ascending: false });
    } else {
      return [];
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching user files:', error);
      return [];
    }
    
    if (!data) return [];
    
    return data.map(item => ({
      id: item.id,
      fileName: item.file_name,
      filePath: item.file_path,
      fileType: item.file_type,
      size: item.size,
      isTemporary: item.is_temporary,
      userId: item.user_id,
      sessionId: item.session_id,
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.error('Error in getUserFiles:', error);
    return [];
  }
};

/**
 * Delete a file
 */
export const deleteFile = async (fileId: string): Promise<boolean> => {
  try {
    // First get the file path
    const { data: fileData, error: fileError } = await db
      .from('user_files')
      .select('file_path')
      .eq('id', fileId)
      .single();
    
    if (fileError || !fileData) {
      console.error('Error getting file path:', fileError);
      return false;
    }
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user_files')
      .remove([fileData.file_path]);
    
    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      return false;
    }
    
    // Delete metadata
    const { error: metadataError } = await db
      .from('user_files')
      .delete()
      .eq('id', fileId);
    
    if (metadataError) {
      console.error('Error deleting file metadata:', metadataError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
};

/**
 * Convert temporary files to permanent user files after login
 */
export const convertTemporaryFilesToUserFiles = async (
  userId: string,
  sessionId: string
): Promise<boolean> => {
  try {
    // Get all temporary files for this session
    const { data: tempFiles, error: fetchError } = await db
      .from('user_files')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_temporary', true);
    
    if (fetchError) {
      console.error('Error fetching temporary files:', fetchError);
      return false;
    }
    
    if (!tempFiles || tempFiles.length === 0) {
      return true; // No files to convert
    }
    
    // Process each file
    for (const file of tempFiles) {
      // Create a new path for the file in the user's folder
      const oldPath = file.file_path;
      const fileName = oldPath.split('/').pop();
      const newPath = `${userId}/${fileName}`;
      
      // Copy the file to the new location
      const { error: copyError } = await supabase.storage
        .from('user_files')
        .copy(oldPath, newPath);
      
      if (copyError) {
        console.error(`Error copying file ${oldPath} to ${newPath}:`, copyError);
        continue;
      }
      
      // Update the file metadata
      const { error: updateError } = await db
        .from('user_files')
        .update({
          user_id: userId,
          file_path: newPath,
          is_temporary: false,
          session_id: null
        })
        .eq('id', file.id);
      
      if (updateError) {
        console.error(`Error updating file metadata for ${file.id}:`, updateError);
        continue;
      }
      
      // Delete the original file from storage
      await supabase.storage
        .from('user_files')
        .remove([oldPath]);
    }
    
    return true;
  } catch (error) {
    console.error('Error in convertTemporaryFilesToUserFiles:', error);
    return false;
  }
};
