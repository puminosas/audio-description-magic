
import { supabase } from '@/integrations/supabase/client';
import { checkRateLimiting } from './rateLimiting';

/**
 * Generate a description for short text inputs
 * @param text The text to generate a description for
 * @param languageCode The language code for the description
 * @param voiceName The voice name to optimize for
 * @returns The generated description or original text if generation fails
 */
export async function generateDescription(
  text: string,
  languageCode: string,
  voiceName: string
): Promise<string> {
  // If text is long enough, just return it
  if (text.length >= 50) {
    return text;
  }
  
  try {
    // Apply rate limiting for description generation - 3 calls per minute
    if (!checkRateLimiting('generateDescription', 3, 60000)) {
      console.warn('Rate limit exceeded for description generation');
      return text;
    }
    
    console.log(`Generating description for: ${text} in language: ${languageCode}`);
    
    const { data: descriptionData, error: descriptionError } = await supabase.functions.invoke('generate-description', {
      body: {
        product_name: text,
        language: languageCode,
        voice_name: voiceName
      }
    });

    if (descriptionError) {
      console.error('Error generating description:', descriptionError);
      return text;
    } 
    
    if (descriptionData?.success && descriptionData?.generated_text) {
      const finalText = descriptionData.generated_text;
      console.log('Successfully generated description:', finalText.substring(0, 50) + '...');
      return finalText;
    } 
    
    console.warn('Description generation returned unexpected format:', descriptionData);
    return text;
  } catch (descError) {
    console.error('Failed to connect to description service:', descError);
    return text;
  }
}
