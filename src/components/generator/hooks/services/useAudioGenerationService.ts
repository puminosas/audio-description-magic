
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
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { success: false, error: 'Authentication required to generate audio descriptions' };
      }
      
      // First try the generate-audio function
      const generatePromise = supabase.functions.invoke('generate-audio', {
        body: {
          text: text,
          language: language.code,
          voice: voice.name
        }
      }).then(response => {
        console.log("Response from generate-audio:", response);
        
        if (response.error) {
          console.error("Error from generate-audio:", response.error);
          return { 
            success: false, 
            error: response.error.message || 'Failed to generate audio'
          };
        }
        
        if (!response.data || !response.data.success) {
          console.error("Invalid response from generate-audio:", response.data);
          return { 
            success: false, 
            error: response.data?.error || 'Failed to generate audio, invalid response from server'
          };
        }
        
        const result = {
          success: true,
          audioUrl: response.data.audioUrl,
          text: response.data.text || text,
          id: response.data.id || crypto.randomUUID()
        };
        
        // Update API call timestamps
        apiCallTimestamps.push(Date.now());
        apiCallTimestamps = apiCallTimestamps.filter(ts => (Date.now() - ts) < 60000);
        
        // Cache the result
        audioCache.set(cacheKey, {
          result,
          timestamp: Date.now()
        });
        
        return result;
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
