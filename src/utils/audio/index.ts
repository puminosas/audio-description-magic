
// Re-export all audio utility functions
export * from './types';
export * from './generationService';
export * from './historyService';
export * from './sessionUtils';

// Export functions from languageVoiceData
export { 
  getAvailableLanguages, 
  getAvailableVoices,
  initializeGoogleVoices as initGoogleVoicesFromSource
} from './languageVoiceData';

// Export types from languageVoiceData
export type { LanguageOption, VoiceOption } from './types';

// Google TTS initialization with error handling
let googleVoicesInitialized = false;
export const initializeGoogleVoices = async () => {
  try {
    if (googleVoicesInitialized) {
      console.log('Google voices already initialized, skipping');
      return;
    }
    
    // Import languageVoiceData dynamically to avoid circular dependencies
    const { fetchAndStoreGoogleVoices } = await import('./languageVoiceData');
    await fetchAndStoreGoogleVoices();
    googleVoicesInitialized = true;
    console.log('Google voices initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google voices:', error);
    // Don't set initialized flag if it failed
    googleVoicesInitialized = false;
    throw error;
  }
};

// Added for compatibility with existing code
export const getUserGenerationStats = async (userId: string) => {
  try {
    // Query generation counts
    const { data: counts } = await supabase
      .from('generation_counts')
      .select('count')
      .eq('user_id', userId);
      
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's generations
    const { data: todayData } = await supabase
      .from('generation_counts')
      .select('count')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    // Calculate total generations
    const totalGenerations = counts?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
    
    // Get recent audio files
    const { data: recentGenerations } = await supabase
      .from('audio_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    return { 
      totalGenerations, 
      recentGenerations: recentGenerations || [],
      todayCount: todayData?.count || 0
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { totalGenerations: 0, recentGenerations: [], todayCount: 0 };
  }
};

// Add supabase import for the functions above
import { supabase } from '@/integrations/supabase/client';
