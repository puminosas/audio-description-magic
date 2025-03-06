
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
        // Use Promise.race with a timeout for description generation
        const descPromise = supabase.functions.invoke('generate-description', {
          body: {
            product_name: text,
            language: language.code,
            voice_name: voice.name
          }
        });
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Description generation timed out'));
          }, 15000);
        });
        
        // Race the description generation with the timeout
        const descResponse = await Promise.race([descPromise, timeoutPromise]) as any;
        
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
    
    try {
      // Add a timeout to prevent long-running requests
      const audioPromise = generateAudioDescription(
        enhancedText,
        language,
        voice
      );
      
      const timeoutPromise = new Promise<AudioErrorResult>((resolve) => {
        setTimeout(() => {
          resolve({ 
            success: false, 
            error: 'The request took too long to complete. Try with a shorter text.' 
          });
        }, 60000);
      });
      
      // Race the generation with a timeout
      const result = await Promise.race([audioPromise, timeoutPromise]);
      
      if (!result.success) {
        return result as AudioErrorResult;
      }
      
      // Create the audio object with the required folderUrl property
      const audioData: GeneratedAudio = {
        audioUrl: result.audioUrl || '',
        text: result.text || enhancedText,
        folderUrl: null, // Adding null as required by GeneratedAudio type
        id: result.id || crypto.randomUUID(),
        timestamp: Date.now()
      };
      
      return audioData;
    } catch (error) {
      console.error("Error in audio generation:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error in audio generation"
      };
    }
  };

  return {
    generateEnhancedAudio
  };
};
