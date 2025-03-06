
import { supabase } from '@/integrations/supabase/client';
import { 
  generateAudioDescription, 
  LanguageOption,
  VoiceOption,
  AudioGenerationResult,
  AudioErrorResult,
  AudioSuccessResult
} from '@/utils/audio';
import { GeneratedAudio } from '../useGenerationState';

// Define a type for the Supabase function response
type SupabaseFunctionResponse = {
  data: {
    success: boolean;
    audioUrl?: string;
    text?: string;
    id?: string;
    error?: string;
  } | null;
  error: Error | null;
};

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
      // Try using the generate-audio fallback function
      const audioPromise = supabase.functions.invoke('generate-audio', {
        body: {
          text: enhancedText,
          language: language.code,
          voice: voice.gender === 'MALE' ? 'echo' : 'alloy'
        }
      });
      
      const timeoutPromise = new Promise<AudioErrorResult>((resolve) => {
        setTimeout(() => {
          resolve({ 
            success: false, 
            error: 'The request took too long to complete. Try with a shorter text.' 
          });
        }, 30000);
      });
      
      // Race the generation with a timeout
      const result = await Promise.race([audioPromise, timeoutPromise]) as SupabaseFunctionResponse | AudioErrorResult;
      
      // Handle the case where result is undefined
      if (!result) {
        return { success: false, error: 'Failed to generate audio: No response from server' };
      }
      
      // If it's already an AudioErrorResult (from the timeout), just return it
      if ('success' in result && result.success === false) {
        return result;
      }
      
      // Now we're dealing with a SupabaseFunctionResponse
      // Check if there's an error in the response
      if ('error' in result && result.error) {
        const errorMessage = result.error?.message || 'Unknown error';
        console.error("Error in audio generation:", errorMessage);
        return { success: false, error: errorMessage };
      }
      
      // Check if data exists and has the success property
      const responseData = 'data' in result ? result.data : null;
      
      // Handle missing data or failed generation
      if (!responseData || responseData.success === false) {
        const errorMessage = responseData?.error || 'Generation failed for unknown reason';
        return { success: false, error: errorMessage };
      }
      
      // Create the audio object
      const audioData: GeneratedAudio = {
        audioUrl: responseData.audioUrl || '',
        text: responseData.text || enhancedText,
        folderUrl: null, // Adding null as required by GeneratedAudio type
        id: responseData.id || crypto.randomUUID(),
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
