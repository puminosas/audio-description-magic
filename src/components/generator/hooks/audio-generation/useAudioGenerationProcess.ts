
import { supabase } from '@/integrations/supabase/client';
import { 
  generateAudioDescription, 
  LanguageOption,
  VoiceOption,
  AudioGenerationResult,
  AudioErrorResult,
} from '@/utils/audio';
import { GeneratedAudio } from '../useGenerationState';

export const useAudioGenerationProcess = () => {
  const generateEnhancedAudio = async (
    text: string,
    language: LanguageOption,
    voice: VoiceOption,
    activeTab: string
  ): Promise<GeneratedAudio | AudioErrorResult> => {
    let enhancedText = text;
    
    // Step 1: First, generate an enhanced product description if the text is short
    if (text.length < 100 && activeTab === 'generate') {
      console.log("Input is short, generating enhanced description...");
      
      try {
        // Add a timeout for description generation
        const descTimeoutPromise = new Promise<{success: false, error: string}>((_, reject) => 
          setTimeout(() => reject(new Error('Description generation timed out')), 15000)
        );
        
        // Call our Supabase Edge Function to generate a better description
        const descResponse = await supabase.functions.invoke('generate-description', {
          body: {
            product_name: text,
            language: language.code,
            voice_name: voice.name
          }
        });
        
        // Check for error first
        if (descResponse.error) {
          console.error("Error generating description:", descResponse.error);
        } 
        // Then check if we have data and it contains success property
        else if (descResponse.data && descResponse.data.success && descResponse.data.generated_text) {
          enhancedText = descResponse.data.generated_text;
          console.log("Generated enhanced description:", enhancedText.substring(0, 100) + "...");
        }
      } catch (descErr) {
        console.error("Failed to generate description:", descErr);
        // Continue with original text if enhancement fails
      }
    }
    
    // Step 2: Generate the audio with our enhanced text
    console.log(`Generating audio with ${enhancedText !== text ? 'enhanced' : 'original'} text...`);
    
    // Add a timeout to prevent long-running requests
    const timeoutPromise = new Promise<AudioErrorResult>((_, reject) => 
      setTimeout(() => ({ success: false, error: 'The request took too long to complete. Try with a shorter text.' }), 60000)
    );
    
    // Race the generation with a timeout
    const result = await Promise.race([
      generateAudioDescription(
        enhancedText,
        language,
        voice
      ),
      timeoutPromise
    ]) as AudioGenerationResult;
    
    if ('error' in result) {
      return result;
    }
    
    // Create the audio object
    const audioData: GeneratedAudio = {
      audioUrl: result.audioUrl,
      text: result.text || enhancedText,
      folderUrl: null, // Removing folderUrl since we only use Supabase Storage
      id: result.id || crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    return audioData;
  };

  return {
    generateEnhancedAudio
  };
};
