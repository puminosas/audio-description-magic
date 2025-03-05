
// Google Text-to-Speech utilities
export async function generateSpeech(
  accessToken: string,
  text: string,
  language: string,
  voice: string
): Promise<Uint8Array> {
  try {
    // Prepare the TTS request body
    const ttsRequestBody = {
      input: { text },
      voice: {
        languageCode: language,
        name: voice,
      },
      audioConfig: {
        audioEncoding: "MP3",
      },
    };

    console.log("Calling Google TTS API with parameters:", {
      language, 
      voice, 
      textLength: text.length
    });
    
    // Call the TTS API
    const ttsResponse = await fetch(
      "https://texttospeech.googleapis.com/v1/text:synthesize",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ttsRequestBody),
      }
    );

    // Check if TTS API call was successful
    if (!ttsResponse.ok) {
      const errorBody = await ttsResponse.text();
      console.error("TTS API error response:", errorBody);
      throw new Error(`Failed to generate speech: ${ttsResponse.status} - ${errorBody}`);
    }

    // Parse TTS response
    const ttsResult = await ttsResponse.json();
    
    if (!ttsResult.audioContent) {
      console.error("TTS API returned no audio content:", ttsResult);
      throw new Error("No audio content returned from TTS API");
    }
    
    console.log("Successfully received audio content from Google TTS API");
    
    // Create a buffer from the base64 audio content
    const audioContent = ttsResult.audioContent;
    const binaryAudio = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
    
    return binaryAudio;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
}
