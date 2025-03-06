
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
    let ttsResponse;
    try {
      ttsResponse = await fetch(
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
    } catch (fetchError) {
      console.error("Network error calling TTS API:", fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }

    // Check if TTS API call was successful
    if (!ttsResponse.ok) {
      let errorBody;
      try {
        errorBody = await ttsResponse.text();
      } catch (e) {
        errorBody = `Status ${ttsResponse.status} ${ttsResponse.statusText}`;
      }
      
      console.error("TTS API error response:", errorBody);
      
      // Check for common error types and provide more helpful messages
      if (ttsResponse.status === 400) {
        throw new Error(`Invalid request parameters: ${errorBody}`);
      } else if (ttsResponse.status === 401 || ttsResponse.status === 403) {
        throw new Error(`Authentication error: ${errorBody}`);
      } else if (ttsResponse.status === 404) {
        throw new Error(`Voice '${voice}' not found for language '${language}'`);
      } else if (ttsResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      } else if (ttsResponse.status >= 500) {
        throw new Error("Google TTS service is currently unavailable. Please try again later.");
      } else {
        throw new Error(`Failed to generate speech: ${ttsResponse.status} - ${errorBody}`);
      }
    }

    // Parse TTS response
    let ttsResult;
    try {
      ttsResult = await ttsResponse.json();
    } catch (parseError) {
      console.error("Error parsing TTS response:", parseError);
      throw new Error("Invalid response format from TTS service");
    }
    
    if (!ttsResult.audioContent) {
      console.error("TTS API returned no audio content:", ttsResult);
      throw new Error("No audio content returned from TTS API");
    }
    
    console.log("Successfully received audio content from Google TTS API");
    
    // Create a buffer from the base64 audio content
    const audioContent = ttsResult.audioContent;
    
    try {
      const binaryAudio = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
      return binaryAudio;
    } catch (conversionError) {
      console.error("Error converting audio content:", conversionError);
      throw new Error("Failed to process the audio data");
    }
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
}
