
import { supabase } from '@/integrations/supabase/client';
import { AudioGenerationResult } from '@/utils/audio';
import { saveAudioToHistory, updateGenerationCount } from '@/utils/audio/historyService';

export const useAudioServices = () => {
  // Generate enhanced description for short inputs
  const generateEnhancedDescription = async (
    text: string,
    languageCode: string,
    voiceName: string
  ): Promise<string | null> => {
    try {
      // Add a timeout for description generation
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Description generation timed out')), 15000)
      );
      
      // Call Supabase Edge Function to generate a better description
      const descPromise = supabase.functions.invoke('generate-description', {
        body: {
          product_name: text,
          language: languageCode,
          voice_name: voiceName
        }
      });
      
      // Race the promises
      const descResponse = await Promise.race([descPromise, timeoutPromise]);
      
      // Check for error first
      if (descResponse.error) {
        console.error("Error generating description:", descResponse.error);
        return null;
      } 
      // Then check if we have data and it contains success property
      else if (descResponse.data && descResponse.data.success && descResponse.data.generated_text) {
        return descResponse.data.generated_text;
      }
      
      return null;
    } catch (error) {
      console.error("Error in generateEnhancedDescription:", error);
      return null;
    }
  };

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

  // Save audio to user history and update generation count
  const saveToUserHistory = async (
    audioUrl: string,
    text: string,
    languageName: string,
    voiceName: string,
    userId: string,
    onSuccess?: () => Promise<void>
  ): Promise<void> => {
    try {
      await Promise.all([
        saveAudioToHistory(
          audioUrl,
          text,
          languageName,
          voiceName,
          userId
        ),
        updateGenerationCount(userId)
      ]);
      
      if (onSuccess) {
        await onSuccess();
      }
    } catch (historyErr) {
      console.error("Error saving to history:", historyErr);
      throw historyErr;
    }
  };

  return {
    generateEnhancedDescription,
    generateAudioFromText,
    saveToUserHistory
  };
};
