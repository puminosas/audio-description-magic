
// Google Cloud Storage utilities
export async function uploadToGoogleStorage(
  accessToken: string, 
  bucketName: string, 
  filePath: string, 
  content: Uint8Array, 
  contentType: string
): Promise<{
  success: boolean;
  fileName: string;
  fileData: any;
  publicUrl: string;
}> {
  try {
    console.log(`Uploading to Google Cloud Storage: gs://${bucketName}/${filePath}`);
    
    const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${bucketName}/o?uploadType=media&name=${encodeURIComponent(filePath)}`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": contentType
      },
      body: content
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      
      // Check for specific errors and provide better messages
      let errorMessage = `Failed to upload to Google Cloud Storage: ${errorText}`;
      
      if (errorText.includes('permission') || errorText.includes('Access Denied') || uploadResponse.status === 403) {
        errorMessage = `Google Cloud Storage permission denied. Make sure the service account has storage.objects.create permissions for bucket: ${bucketName}`;
      } else if (uploadResponse.status === 404) {
        errorMessage = `Google Cloud Storage bucket not found: ${bucketName}`;
      } else if (errorText.includes('quota')) {
        errorMessage = `Google Cloud Storage quota exceeded. Please check your storage limits.`;
      }
      
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    const uploadData = await uploadResponse.json();
    console.log("Upload successful:", uploadData.name);
    
    // Generate public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(filePath)}`;
    
    return {
      success: true,
      fileName: filePath,
      fileData: uploadData,
      publicUrl: publicUrl
    };
  } catch (error) {
    console.error("Error uploading to Google Cloud Storage:", error);
    throw error;
  }
}
