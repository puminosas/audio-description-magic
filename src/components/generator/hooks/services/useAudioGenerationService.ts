
import { supabase } from '@/integrations/supabase/client';
import { AudioGenerationResult } from '@/utils/audio';

export const useAudioGenerationService = () => {
  // Generate audio from text
  const generateAudioFromText = async (
    text: string,
    language: any,
    voice: any
  ): Promise<AudioGenerationResult> => {
    try {
      // Add a timeout to prevent long-running requests
      const timeoutPromise = new Promise<{success: false, error: string}>((_, reject) => 
        setTimeout(() => ({ success: false, error: 'The request took too long to complete. Try with a shorter text.' }), 60000)
      );
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { success: false, error: 'Authentication required to generate audio descriptions' };
      }
      
      // Generate the audio with our text via Supabase Edge Function
      const generatePromise = supabase.functions.invoke('generate-google-tts', {
        body: {
          text: text,
          language: language.code,
          voice: voice.id,
          user_id: session.user.id
        }
      }).then(response => {
        if (response.error) {
          return { 
            success: false, 
            error: response.error.message || 'Failed to generate audio'
          };
        }
        
        if (!response.data || !response.data.success) {
          return { 
            success: false, 
            error: response.data?.error || 'Failed to generate audio, invalid response from server'
          };
        }
        
        return {
          success: true,
          audioUrl: response.data.audio_url,
          text: text,
          id: response.data.fileName || crypto.randomUUID()
        };
      });
      
      // Race the generation with a timeout
      return await Promise.race([generatePromise, timeoutPromise]) as AudioGenerationResult;
    } catch (error) {
      console.error("Error in generateAudioFromText:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return { 
        success: false,
        error: errorMessage
      };
    }
  };

  return {
    generateAudioFromText
  };
};
