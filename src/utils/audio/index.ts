
// Re-export all audio utility functions
export * from './types';
export * from './generationService';
export * from './languageVoiceData';
export * from './historyService';
export * from './sessionUtils';

// Google TTS initialization with error handling
let googleVoicesInitialized = false;
export const initializeGoogleVoices = async () => {
  try {
    if (googleVoicesInitialized) {
      console.log('Google voices already initialized, skipping');
      return;
    }
    
    // Use the exported function from languageVoiceData
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
    return { totalGenerations: 0, recentGenerations: [] };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { totalGenerations: 0, recentGenerations: [] };
  }
};

// Added for compatibility with existing code
export const fetchUserAudios = async (userId: string) => {
  try {
    const { getAudioHistory } = await import('./historyService');
    return await getAudioHistory();
  } catch (error) {
    console.error('Error fetching user audios:', error);
    return [];
  }
};
