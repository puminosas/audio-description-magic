
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
    
    // Import languageVoiceData dynamically to avoid circular dependencies
    const { fetchAndStoreGoogleVoices } = await import('./languageVoiceData');
    await fetchAndStoreGoogleVoices();
    googleVoicesInitialized = true;
    console.log('Google voices initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google voices:', error);
    // Don't set initialized flag if it failed
    throw error;
  }
};
