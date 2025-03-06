
import { useMemo } from 'react';

export interface AudioUrlValidationResult {
  hasValidUrl: boolean;
  isValidUrl: boolean;
  validationDetails: Record<string, any>;
}

interface AudioUrlValidatorProps {
  audioUrl?: string;
  isGenerating?: boolean;
}

export const useAudioUrlValidator = ({ 
  audioUrl, 
  isGenerating = false 
}: AudioUrlValidatorProps): AudioUrlValidationResult => {
  // Enhanced validation of the audioUrl format with useMemo for efficiency
  return useMemo(() => {
    // Don't validate if no URL or still generating
    if (!audioUrl || isGenerating) {
      return { 
        hasValidUrl: false, 
        isValidUrl: false, 
        validationDetails: { reason: 'No URL or still generating' } 
      };
    }
    
    try {
      // Check for valid data URL format
      const isValidDataUrl = 
        (audioUrl.startsWith('data:audio/') && audioUrl.includes('base64,')) || 
        audioUrl.startsWith('https://') || 
        audioUrl.startsWith('http://');
      
      // If it's not a data URL, just validate that it's a valid URL
      if (!audioUrl.startsWith('data:audio/')) {
        return {
          hasValidUrl: isValidDataUrl,
          isValidUrl: isValidDataUrl,
          validationDetails: {
            isExternalUrl: true,
            url: audioUrl.substring(0, 30) + '...'
          }
        };
      }
      
      const parts = audioUrl.split('base64,');
      const base64Data = parts.length === 2 ? parts[1] : '';
      
      // Enhanced validation for data URLs
      let hasValidDataFormat = true;
      
      // Check if base64 data is substantial enough
      const isValidLength = base64Data.length >= 10000;
      
      // Check if base64 has valid padding
      const hasValidPadding = base64Data.length % 4 === 0;
      
      hasValidDataFormat = isValidLength && hasValidPadding;
      
      const validationDetails = {
        isValidDataUrl,
        hasValidDataFormat,
        urlLength: audioUrl.length,
        base64Length: base64Data.length,
        sizeKB: Math.round(base64Data.length / 1024),
        hasValidPadding: base64Data.length % 4 === 0,
        startsWithDataAudio: audioUrl.startsWith('data:audio/'),
        includesBase64: audioUrl.includes('base64,'),
        minimumRequired: 10000
      };
      
      return { 
        hasValidUrl: isValidDataUrl && (audioUrl.startsWith('http') || hasValidDataFormat),
        isValidUrl: isValidDataUrl,
        validationDetails
      };
    } catch (err) {
      console.error("Error validating audio URL:", err);
      return { 
        hasValidUrl: false, 
        isValidUrl: false,
        validationDetails: { error: err, reason: 'Validation error' }
      };
    }
  }, [audioUrl, isGenerating]);
};
