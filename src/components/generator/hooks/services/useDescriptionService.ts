
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export const useDescriptionService = () => {
  const [modelUsed, setModelUsed] = useState<string | null>(null);

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
        // Store the model used for reference
        if (descResponse.data.model_used) {
          setModelUsed(descResponse.data.model_used);
        }
        return descResponse.data.generated_text;
      }
      
      return null;
    } catch (error) {
      console.error("Error in generateEnhancedDescription:", error);
      return null;
    }
  };

  return {
    generateEnhancedDescription,
    modelUsed
  };
};
