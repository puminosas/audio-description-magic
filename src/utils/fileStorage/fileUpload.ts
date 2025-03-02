
import { supabase } from '@/integrations/supabase/client';
import { FileMetadata } from './types';
import { getOrCreateGuestSessionId } from './sessionUtils';

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
