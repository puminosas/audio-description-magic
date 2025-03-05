
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
      console.error(`Failed to upload to Google Cloud Storage: ${errorText}`);
      throw new Error(`Failed to upload to Google Cloud Storage: ${errorText}`);
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
