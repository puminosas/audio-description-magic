
import { useState, useEffect } from 'react';

export interface GeneratedAudio {
  audioUrl: string;
  text: string;
  folderUrl: null; // Keeping for backward compatibility but setting to null
  id?: string; // Add ID for better tracking
  timestamp?: number; // Add timestamp for caching
}

// Add a cache to prevent redundant generations
const recentGenerationsCache = new Map<string, GeneratedAudio>();

export const useGenerationState = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);

  // Clear old cache entries (older than 30 minutes)
  useEffect(() => {
    const now = Date.now();
    const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    // Clear old cache entries
    recentGenerationsCache.forEach((value, key) => {
      if (value.timestamp && (now - value.timestamp) > CACHE_TTL) {
        recentGenerationsCache.delete(key);
      }
    });
  }, []);

  // Enhanced setter with caching
  const setCachedGeneratedAudio = (audio: GeneratedAudio | null) => {
    setGeneratedAudio(audio);
    
    // Cache the result if it's valid
    if (audio && audio.audioUrl && audio.text) {
      const cacheKey = `${audio.text.substring(0, 100)}_${audio.id || ''}`;
      recentGenerationsCache.set(cacheKey, {
        ...audio,
        timestamp: Date.now(),
      });
    }
  };
  
  // Try to find in cache by text
  const findInCache = (text: string): GeneratedAudio | null => {
    let cachedAudio: GeneratedAudio | null = null;
    
    // Simple search in cache by text prefix
    recentGenerationsCache.forEach((value) => {
      if (value.text && value.text.startsWith(text.substring(0, 50))) {
        cachedAudio = value;
      }
    });
    
    if (cachedAudio) {
      setIsCached(true);
    }
    
    return cachedAudio;
  };

  return {
    loading,
    setLoading,
    generatedAudio,
    setGeneratedAudio: setCachedGeneratedAudio,
    findInCache,
    isCached
  };
};
