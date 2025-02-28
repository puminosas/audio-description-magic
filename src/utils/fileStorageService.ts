
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface FileMetadata {
  id?: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  size?: number;
  isTemporary: boolean;
  userId?: string;
  sessionId?: string;
  createdAt?: Date;
}

// Cast the Supabase client to any to bypass TypeScript checking
// This is needed because our Database type doesn't include all tables we're using
const db = supabase as any;

/**
 * Save a file to a user's folder if authenticated, or to a temporary folder if not
 */
export const saveFile = async (
  file: File,
  userId?: string
): Promise<FileMetadata | null> => {
  try {
    const isAuthenticated = !!userId;
    const sessionId = !isAuthenticated ? getOrCreateGuestSessionId() : undefined;
    
    // Create path: 'user_id/filename' for authenticated users or 'temp/session_id/filename' for guests
    const folderPath = isAuthenticated 
      ? `${userId}/` 
      : `temp/${sessionId}/`;
    
    // Generate a unique filename to avoid collisions
    const uniqueFileName = `${Date.now()}_${file.name.substring(0, 50)}`;
    const filePath = folderPath + uniqueFileName;
    
    // Upload the file to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('user_files')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });
    
    if (storageError) {
      console.error('Error uploading file to storage:', storageError);
      return null;
    }
    
    // Get a public URL for the file
    const { data: publicUrlData } = supabase.storage
      .from('user_files')
      .getPublicUrl(filePath);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error('Failed to get public URL for file');
      return null;
    }
    
    // Create file metadata entry in the database
    const fileData = {
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      size: file.size,
      is_temporary: !isAuthenticated,
      user_id: userId || null,
      session_id: sessionId || null
    };
    
    // Use the any-typed client to bypass TypeScript checking
    const { data: metadataData, error: metadataError } = await db
      .from('user_files')
      .insert([fileData])
      .select('*')
      .single();
    
    if (metadataError) {
      console.error('Error saving file metadata:', metadataError);
      return null;
    }
    
    return {
      id: metadataData.id,
      fileName: metadataData.file_name,
      filePath: metadataData.file_path,
      fileType: metadataData.file_type,
      size: metadataData.size,
      isTemporary: metadataData.is_temporary,
      userId: metadataData.user_id,
      sessionId: metadataData.session_id,
      createdAt: new Date(metadataData.created_at)
    };
  } catch (error) {
    console.error('Error in saveFile:', error);
    return null;
  }
};

/**
 * Save a blob as a file (used for audio files)
 */
export const saveBlobAsFile = async (
  blob: Blob,
  fileName: string,
  userId?: string
): Promise<FileMetadata | null> => {
  try {
    // Convert blob to file
    const file = new File([blob], fileName, { type: blob.type });
    return await saveFile(file, userId);
  } catch (error) {
    console.error('Error in saveBlobAsFile:', error);
    return null;
  }
};

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
 * Get a session ID for guest users or create a new one
 */
export const getOrCreateGuestSessionId = (): string => {
  const storageKey = 'audioDesc_guestSessionId';
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
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
