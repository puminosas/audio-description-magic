
import { binaryToBase64 } from "../utils/base64.ts";

// Convert text to speech using OpenAI TTS
export async function textToSpeech(description: string, voice: string, openaiApiKey: string) {
  console.log("Converting text to speech with OpenAI...");
  const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "tts-1", // Use standard model instead of HD to reduce costs
      voice: voice,
      input: description,
      response_format: "mp3",
      speed: 0.95 // Slightly slower for better clarity
    })
  });

  if (!ttsResponse.ok) {
    const errorText = await ttsResponse.text();
    console.error("TTS API error:", errorText);
    throw new Error(`TTS API error: ${errorText}`);
  }

  // Process the audio data
  const audioBuffer = await ttsResponse.arrayBuffer();
  console.log(`Received audio buffer of size: ${audioBuffer.byteLength} bytes`);
  
  // Process binary data in chunks to avoid stack overflow
  const audioBase64 = binaryToBase64(audioBuffer);
  
  // Create a data URL for the audio file
  const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

  return {
    audioUrl,
    id: crypto.randomUUID()
  };
}
