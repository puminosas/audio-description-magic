
import { supabase } from '@/integrations/supabase/client';
import { AudioGenerationResult } from '@/utils/audio';

// Simple in-memory cache to prevent duplicate API calls
const audioCache = new Map<string, {result: AudioGenerationResult, timestamp: number}>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache TTL
const MAX_API_CALLS_PER_MINUTE = 5; // Limit API calls
let apiCallTimestamps: number[] = [];

export const useAudioGenerationService = () => {
  // Generate audio from text
  const generateAudioFromText = async (
    text: string,
    language: any,
    voice: any
  ): Promise<AudioGenerationResult> => {
    try {
      console.log(`Attempting to generate audio for: "${text.substring(0, 30)}..."`);
      
      // 1. First check cache based on text+language+voice combo
      const cacheKey = `${text}_${language.code}_${voice.name}`;
      const now = Date.now();
      const cachedItem = audioCache.get(cacheKey);
      
      if (cachedItem && (now - cachedItem.timestamp) < CACHE_TTL) {
        console.log("Using cached audio result");
        return cachedItem.result;
      }
      
      // 2. Rate limiting check
      const recentApiCalls = apiCallTimestamps.filter(timestamp => 
        (now - timestamp) < 60000 // Last minute
      );
      
      if (recentApiCalls.length >= MAX_API_CALLS_PER_MINUTE) {
        return { 
          success: false, 
          error: 'Rate limit reached. Please wait a moment before generating more audio.' 
        };
      }
      
      // 3. Check text length to prevent excessive tokens
      if (text.length > 1000) {
        return {
          success: false,
          error: 'Text exceeds the maximum length (1000 characters). Please use shorter text.'
        };
      }
      
      // 4. Add a timeout to prevent long-running requests
      const timeoutPromise = new Promise<AudioGenerationResult>((_, reject) => 
        setTimeout(() => ({ 
          success: false, 
          error: 'The request took too long to complete. Try with a shorter text.' 
        }), 45000) // Reduced from 60s to 45s
      );
      
      // Now use the refactored generateAudioDescription function imported from utils
      const { generateAudioDescription } = await import('@/utils/audio/generationService');
      
      const generatePromise = generateAudioDescription(text, language, voice)
        .then(response => {
          // Update API call timestamps
          apiCallTimestamps.push(Date.now());
          apiCallTimestamps = apiCallTimestamps.filter(ts => (Date.now() - ts) < 60000);
          
          // Cache the result if successful
          if (response.success) {
            audioCache.set(cacheKey, {
              result: response,
              timestamp: Date.now()
            });
          }
          
          return response;
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
