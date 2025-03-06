
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VoiceOption } from '@/utils/audio/types';
import { formatVoiceName } from '../utils';

// Initial default voices for fallback
const DEFAULT_VOICES: VoiceOption[] = [
  { id: 'en-US-Wavenet-A', name: 'Wavenet A (Male)', gender: 'MALE' },
  { id: 'en-US-Wavenet-E', name: 'Wavenet E (Female)', gender: 'FEMALE' },
  { id: 'lt-LT-Standard-A', name: 'Standard A (Male)', gender: 'MALE' },
  { id: 'lt-LT-Standard-B', name: 'Standard B (Female)', gender: 'FEMALE' },
];

export function useVoiceData(
  language: string,
  selectedVoice?: VoiceOption,
  onSelect?: (voice: VoiceOption) => void
) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchVoices = async () => {
      try {
        setLoading(true);
        
        // Call our Edge Function to get voices
        const response = await supabase.functions.invoke('get-google-voices');
        
        if (response.error) {
          console.error('Error fetching voices:', response.error);
          if (isMounted) {
            setVoices(DEFAULT_VOICES);
            if (onSelect && !selectedVoice) {
              // Get voices for current language or fall back to first voice
              const languageVoices = DEFAULT_VOICES.filter(v => v.id.startsWith(language));
              onSelect(languageVoices.length > 0 ? languageVoices[0] : DEFAULT_VOICES[0]);
            }
            setLoading(false);
          }
          return;
        }
        
        // Check if we have valid data
        if (!response.data || typeof response.data !== 'object') {
          console.error('Invalid voice data format received');
          if (isMounted) {
            setVoices(DEFAULT_VOICES);
            if (onSelect && !selectedVoice) {
              onSelect(DEFAULT_VOICES[0]);
            }
            setLoading(false);
          }
          return;
        }
        
        // Format the voices for our component
        if (isMounted && response.data[language]) {
          // This now matches the format returned by the Edge Function
          // Which follows the structure from the Python example
          
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
          
          setVoices(formattedVoices.length > 0 ? formattedVoices : DEFAULT_VOICES);
          
          // If the selected voice is not in the new list, select the first one
          if (onSelect && (!selectedVoice || !formattedVoices.find(v => v.id === selectedVoice.id))) {
            if (formattedVoices.length > 0) {
              onSelect(formattedVoices[0]);
            } else {
              // Find fallback voices for this language
              const languageVoices = DEFAULT_VOICES.filter(v => v.id.startsWith(language));
              onSelect(languageVoices.length > 0 ? languageVoices[0] : DEFAULT_VOICES[0]);
            }
          }
        } else if (isMounted) {
          // If no voices for the selected language, use defaults
          // Try to find defaults for this language first
          const languageVoices = DEFAULT_VOICES.filter(v => v.id.startsWith(language));
          const fallbackVoices = languageVoices.length > 0 ? languageVoices : DEFAULT_VOICES;
          
          setVoices(fallbackVoices);
          if (onSelect && !selectedVoice) {
            onSelect(fallbackVoices[0]);
          }
        }
      } catch (error) {
        console.error('Error loading voices:', error);
        // Use defaults on error
        if (isMounted) {
          setVoices(DEFAULT_VOICES);
          if (onSelect && !selectedVoice) {
            onSelect(DEFAULT_VOICES[0]);
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

  return { voices, loading };
}
