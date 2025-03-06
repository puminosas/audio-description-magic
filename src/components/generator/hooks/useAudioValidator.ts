
import { useState, useEffect } from 'react';

export const useAudioValidator = () => {
  const validateAudioUrl = (url: string): boolean => {
    if (!url) return false;
    
    // Supabase storage URLs
    if (url.includes('supabase.co') || url.includes('supabase.in')) {
      return true;
    }
    
    // For data URLs (fallback)
    if (url.startsWith('data:audio/')) {
      if (!url.includes('base64,')) return false;
      const base64Part = url.split('base64,')[1];
      return base64Part && base64Part.length > 5000;
    }
    
    return false;
  };

  return { validateAudioUrl };
};
