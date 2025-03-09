import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VoiceOption } from '@/utils/audio/types';
import { formatVoiceName } from '../utils';
import { fetchGoogleVoices } from '@/utils/audio/services/voiceService';

// Fallback voices for common languages
const fallbackVoices: Record<string, VoiceOption[]> = {
  'en-US': [
    { id: 'en-US-Standard-A', name: 'Standard A (Male)', gender: 'MALE' },
    { id: 'en-US-Standard-C', name: 'Standard C (Female)', gender: 'FEMALE' }
  ],
  'en-GB': [
    { id: 'en-GB-Standard-B', name: 'Standard B (Male)', gender: 'MALE' },
    { id: 'en-GB-Standard-A', name: 'Standard A (Female)', gender: 'FEMALE' }
  ],
  'es-ES': [
    { id: 'es-ES-Standard-B', name: 'Standard B (Male)', gender: 'MALE' },
    { id: 'es-ES-Standard-A', name: 'Standard A (Female)', gender: 'FEMALE' }
  ],
  'fr-FR': [
    { id: 'fr-FR-Standard-B', name: 'Standard B (Male)', gender: 'MALE' },
    { id: 'fr-FR-Standard-A', name: 'Standard A (Female)', gender: 'FEMALE' }
  ],
  'de-DE': [
    { id: 'de-DE-Standard-B', name: 'Standard B (Male)', gender: 'MALE' },
    { id: 'de-DE-Standard-A', name: 'Standard A (Female)', gender: 'FEMALE' }
  ],
  'af-ZA': [
    { id: 'af-ZA-Standard-A', name: 'Standard A (Female)', gender: 'FEMALE' }
  ],
  'ar-AE': [
    { id: 'ar-AE-Standard-A', name: 'Standard A (Female)', gender: 'FEMALE' },
    { id: 'ar-AE-Standard-B', name: 'Standard B (Male)', gender: 'MALE' }
  ],
  'zh-CN': [
    { id: 'zh-CN-Standard-A', name: 'Standard A (Female)', gender: 'FEMALE' },
    { id: 'zh-CN-Standard-B', name: 'Standard B (Male)', gender: 'MALE' }
  ],
  'nl-NL': [
    { id: 'nl-NL-Standard-A', name: 'Standard A (Female)', gender: 'FEMALE' },
    { id: 'nl-NL-Standard-B', name: 'Standard B (Male)', gender: 'MALE' }
  ],
  'ja-JP': [
    { id: 'ja-JP-Standard-A', name: 'Standard A (Female)', gender: 'FEMALE' },
    { id: 'ja-JP-Standard-B', name: 'Standard B (Male)', gender: 'MALE' }
  ],
  'ru-RU': [
    { id: 'ru-RU-Standard-A', name: 'Standard A (Female)', gender: 'FEMALE' },
    { id: 'ru-RU-Standard-B', name: 'Standard B (Male)', gender: 'MALE' }
  ]
};

// Generic fallback for any language not in our predefined list
const genericFallbackVoices: VoiceOption[] = [
  { id: 'generic-male', name: 'Male Voice', gender: 'MALE' },
  { id: 'generic-female', name: 'Female Voice', gender: 'FEMALE' }
];

export function useVoiceData(
  language: string,
  selectedVoice?: VoiceOption,
  onSelect?: (voice: VoiceOption) => void
) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchVoices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use the fetchGoogleVoices service
        const data = await fetchGoogleVoices();
        
        if (isMounted) {
          processVoiceData(data, language);
        }
      } catch (error) {
        console.warn('Error loading voices, using fallbacks:', error);
        
        if (isMounted) {
          applyFallbackVoices(language);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchVoices();
    
    return () => {
      isMounted = false;
    };
  }, [language, selectedVoice, onSelect]);

  // Process voice data returned from API
  const processVoiceData = (data: any, languageCode: string) => {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      console.warn('Invalid voice data format received, using fallbacks');
      applyFallbackVoices(languageCode);
      return;
    }
    
    if (!data[languageCode]) {
      console.warn(`No voices found for language: ${languageCode}, using fallbacks`);
      applyFallbackVoices(languageCode);
      return;
    }
    
    // Format the voices for our component
    const formattedVoices = formatVoicesFromAPI(data[languageCode]);
    
    if (formattedVoices.length === 0) {
      console.warn(`Empty voices array for language: ${languageCode}, using fallbacks`);
      applyFallbackVoices(languageCode);
    } else {
      setVoices(formattedVoices);
      
      // If the selected voice is not in the new list, select the first one
      if (onSelect && (!selectedVoice || !formattedVoices.find(v => v.id === selectedVoice.id))) {
        onSelect(formattedVoices[0]);
      }
    }
  };
  
  // Format voices from API response
  const formatVoicesFromAPI = (languageData: any): VoiceOption[] => {
    if (!languageData.voices) {
      return [];
    }

    // Process male voices
    const maleVoices = (languageData.voices.MALE || []).map((v: any) => ({
      id: v.name,
      name: formatVoiceName(v.name),
      gender: 'MALE' as const,
      isPremium: v.is_premium || false
    }));
    
    // Process female voices
    const femaleVoices = (languageData.voices.FEMALE || []).map((v: any) => ({
      id: v.name,
      name: formatVoiceName(v.name, 'female'),
      gender: 'FEMALE' as const,
      isPremium: v.is_premium || false
    }));
    
    // Process neutral voices (if any)
    const neutralVoices = (languageData.voices.NEUTRAL || []).map((v: any) => ({
      id: v.name,
      name: formatVoiceName(v.name, 'neutral'),
      gender: 'NEUTRAL' as const,
      isPremium: v.is_premium || false
    }));
    
    const allVoices = [...maleVoices, ...femaleVoices, ...neutralVoices];
    
    // Sort voices - premium voices first, then alphabetically
    allVoices.sort((a, b) => {
      // First sort by premium status
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;
      
      // Then sort alphabetically
      return a.name.localeCompare(b.name);
    });
    
    return allVoices;
  };
  
  // Apply fallback voices when needed
  const applyFallbackVoices = (languageCode: string) => {
    const fallbackForLanguage = fallbackVoices[languageCode] || genericFallbackVoices;
    setVoices(fallbackForLanguage);
    
    // If no voice is selected or the selected voice isn't in our fallbacks, select the first one
    if (onSelect && (!selectedVoice || !fallbackForLanguage.find(v => v.id === selectedVoice.id))) {
      onSelect(fallbackForLanguage[0]);
    }
  };

  return { voices, loading, error };
}
