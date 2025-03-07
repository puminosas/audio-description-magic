
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VoiceOption } from '@/utils/audio/types';
import { formatVoiceName } from '../utils';

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
      try {
        setLoading(true);
        setError(null);
        
        // Call our Edge Function to get voices
        const response = await supabase.functions.invoke('get-google-voices');
        
        if (response.error) {
          console.warn('Using fallback voices due to error:', response.error);
          
          // Use fallback voices instead of showing an error
          const fallbackForLanguage = fallbackVoices[language] || genericFallbackVoices;
          setVoices(fallbackForLanguage);
          
          // If no voice is selected or the selected voice isn't in our fallbacks, select the first one
          if (onSelect && (!selectedVoice || !fallbackForLanguage.find(v => v.id === selectedVoice.id))) {
            onSelect(fallbackForLanguage[0]);
          }
          
          if (isMounted) {
            setLoading(false);
          }
          return;
        }
        
        // Check if we have valid data
        if (!response.data || typeof response.data !== 'object' || Object.keys(response.data).length === 0) {
          console.warn('Invalid voice data format received, using fallbacks');
          
          // Use fallback voices
          const fallbackForLanguage = fallbackVoices[language] || genericFallbackVoices;
          setVoices(fallbackForLanguage);
          
          // If no voice is selected or the selected voice isn't in our fallbacks, select the first one
          if (onSelect && (!selectedVoice || !fallbackForLanguage.find(v => v.id === selectedVoice.id))) {
            onSelect(fallbackForLanguage[0]);
          }
          
          if (isMounted) {
            setLoading(false);
          }
          return;
        }
        
        // Format the voices for our component
        if (isMounted && response.data[language]) {
          // Process voice data from the Edge Function
          const maleVoices = (response.data[language].voices.MALE || []).map((v: any) => ({
            id: v.name,
            name: formatVoiceName(v.name),
            gender: 'MALE' as const
          }));
          
          const femaleVoices = (response.data[language].voices.FEMALE || []).map((v: any) => ({
            id: v.name,
            name: formatVoiceName(v.name, 'female'),
            gender: 'FEMALE' as const
          }));
          
          const formattedVoices = [...maleVoices, ...femaleVoices];
          
          // Sort voices by name
          formattedVoices.sort((a, b) => a.name.localeCompare(b.name));
          
          if (formattedVoices.length === 0) {
            // Use fallback voices if the API returned an empty array
            const fallbackForLanguage = fallbackVoices[language] || genericFallbackVoices;
            setVoices(fallbackForLanguage);
            
            // If no voice is selected or the selected voice isn't in our fallbacks, select the first one
            if (onSelect && (!selectedVoice || !fallbackForLanguage.find(v => v.id === selectedVoice.id))) {
              onSelect(fallbackForLanguage[0]);
            }
          } else {
            setVoices(formattedVoices);
            
            // If the selected voice is not in the new list, select the first one
            if (onSelect && (!selectedVoice || !formattedVoices.find(v => v.id === selectedVoice.id))) {
              onSelect(formattedVoices[0]);
            }
          }
        } else if (isMounted) {
          // Use fallback voices for this language
          const fallbackForLanguage = fallbackVoices[language] || genericFallbackVoices;
          setVoices(fallbackForLanguage);
          
          // If no voice is selected or the selected voice isn't in our fallbacks, select the first one
          if (onSelect && (!selectedVoice || !fallbackForLanguage.find(v => v.id === selectedVoice.id))) {
            onSelect(fallbackForLanguage[0]);
          }
        }
      } catch (error) {
        console.warn('Error loading voices, using fallbacks:', error);
        
        if (isMounted) {
          // Use fallback voices instead of showing an error
          const fallbackForLanguage = fallbackVoices[language] || genericFallbackVoices;
          setVoices(fallbackForLanguage);
          
          // If no voice is selected or the selected voice isn't in our fallbacks, select the first one
          if (onSelect && (!selectedVoice || !fallbackForLanguage.find(v => v.id === selectedVoice.id))) {
            onSelect(fallbackForLanguage[0]);
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
  }, [language, selectedVoice, onSelect]);

  return { voices, loading, error };
}
