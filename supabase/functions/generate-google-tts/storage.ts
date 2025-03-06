
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

/**
 * Initialize storage and prepare user folder information
 */
export async function prepareUserStorage(supabaseUrl: string, supabaseKey: string, userId: string, text: string) {
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
  
  // Get user email for folder organization
  let userData;
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.warn("Warning: Couldn't fetch user email:", error.message);
    } else {
      userData = data;
    }
  } catch (userError) {
    console.warn("Error fetching user data:", userError);
    // Continue with fallback to user_id
  }
  
  // Generate a folder path based on user email or fallback to user ID
  const userEmail = userData?.email || userId;
  const sanitizedUserIdentifier = userEmail.replace(/[^a-zA-Z0-9_-]/g, '_');
  
  // Create file path and name
  const timestamp = new Date().toISOString();
  const sanitizedText = text.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${sanitizedText}_${timestamp}.mp3`;
  const filePath = `${sanitizedUserIdentifier}/${fileName}`;
  
  await ensureAudioFilesBucketExists(supabaseAdmin);
  
  return { supabaseAdmin, filePath, fileName };
}

/**
 * Ensure the audio_files bucket exists and is correctly configured
 */
async function ensureAudioFilesBucketExists(supabaseAdmin: any) {
  try {
    const { data: buckets, error } = await supabaseAdmin
      .storage
      .listBuckets();
      
    if (error) {
      throw new Error(`Error listing buckets: ${error.message}`);
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'audio_files');
    
    if (!bucketExists) {
      console.log("Creating audio_files bucket as it doesn't exist");
      const { error: createError } = await supabaseAdmin
        .storage
        .createBucket('audio_files', { 
          public: true,
          fileSizeLimit: 52428800, // 50MB
        });
        
      if (createError) {
        throw new Error(`Error creating audio_files bucket: ${createError.message}`);
      }
      console.log("Successfully created audio_files bucket");
    }
  } catch (bucketError) {
    console.error("Bucket setup error:", bucketError);
    throw bucketError;
  }
}

/**
 * Upload audio content to Supabase Storage
 */
export async function uploadAudioToStorage(supabaseAdmin: any, filePath: string, binaryAudio: Uint8Array) {
  try {
    const { data, error } = await supabaseAdmin
      .storage
      .from('audio_files')
      .upload(filePath, binaryAudio, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      throw new Error(`Error uploading to Supabase Storage: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error("Error uploading to storage:", error);
    throw error;
  }
}

/**
 * Get the public URL for the uploaded file
 */
export function getPublicUrl(supabaseAdmin: any, filePath: string) {
  try {
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from('audio_files')
      .getPublicUrl(filePath);
      
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error("Failed to generate public URL for the uploaded file");
    }
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error getting public URL:", error);
    throw error;
  }
}

/**
 * Store metadata about the generated audio in Supabase
 */
export async function storeMetadata(supabaseAdmin: any, metadata: {
  user_id: string;
  fileName: string;
  filePath: string;
  publicUrl: string;
  fileSize: number;
  language: string;
  voice: string;
  textContent: string;
}) {
  try {
    const { error: metadataError } = await supabaseAdmin
      .from('audio_files')
      .insert({
        user_id: metadata.user_id,
        file_name: metadata.fileName,
        file_path: metadata.filePath,
        storage_url: metadata.publicUrl,
        file_size: metadata.fileSize,
        language: metadata.language,
        voice: metadata.voice,
        text_content: metadata.textContent
      });
      
    if (metadataError) {
      console.warn("Warning: Failed to store file metadata in Supabase:", metadataError);
      throw metadataError;
    } else {
      console.log("Stored file metadata in Supabase");
    }
  } catch (error) {
    console.warn("Error storing metadata:", error);
    throw error;
  }
}
