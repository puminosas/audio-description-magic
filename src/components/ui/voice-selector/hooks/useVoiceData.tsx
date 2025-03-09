
import { useState, useEffect } from 'react';
import { VoiceOption } from '@/utils/audio/types';
import { formatVoiceName, getVoiceQuality } from '../utils';
import { fetchGoogleVoices } from '@/utils/audio/services/voiceService';

// Simple fallback for any language not in our predefined list
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchVoices = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching voices for language: ${language}`);
        // Use the fetchGoogleVoices service
        const data = await fetchGoogleVoices();
        
        if (isMounted) {
          processVoiceData(data, language);
        }
      } catch (error) {
        console.warn('Error loading voices, using fallbacks:', error);
        
        if (isMounted) {
          setError(error instanceof Error ? error.message : String(error));
          setVoices(genericFallbackVoices);
          
          if (onSelect && (!selectedVoice || !genericFallbackVoices.find(v => v.id === selectedVoice.id))) {
            onSelect(genericFallbackVoices[0]);
          }
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
  }, [language]);

  // Process voice data returned from API
  const processVoiceData = (data: any, languageCode: string) => {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      console.warn('Invalid voice data format received, using fallbacks');
      setVoices(genericFallbackVoices);
      return;
    }
    
    if (!data[languageCode]) {
      console.warn(`No voices found for language: ${languageCode}, using fallbacks`);
      setVoices(genericFallbackVoices);
      return;
    }
    
    // Format the voices for our component
    const formattedVoices = formatVoicesFromAPI(data[languageCode]);
    
    if (formattedVoices.length === 0) {
      console.warn(`Empty voices array for language: ${languageCode}, using fallbacks`);
      setVoices(genericFallbackVoices);
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
    
    // Sort voices by quality first, then alphabetically
    allVoices.sort((a, b) => {
      // Get quality scores (higher is better)
      const qualityA = getVoiceQuality(a.id);
      const qualityB = getVoiceQuality(b.id);
      
      // First sort by quality (descending)
      if (qualityB !== qualityA) {
        return qualityB - qualityA;
      }
      
      // Then sort alphabetically
      return a.name.localeCompare(b.name);
    });
    
    return allVoices;
  };

  return { voices, loading, error };
}
