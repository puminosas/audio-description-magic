
import { useEffect } from 'react';
import { initializeGoogleVoices } from '@/utils/audio';

export const useInitializeVoices = () => {
  useEffect(() => {
    const initializeVoices = async () => {
      try {
        await initializeGoogleVoices();
      } catch (error) {
        console.error('Failed to initialize Google voices:', error);
        // Continue even if initialization fails - we'll use defaults
      }
    };
    
    initializeVoices();
  }, []);
};
