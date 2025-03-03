
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VoiceOption } from '@/utils/audio/types';
import { formatVoiceName } from '../utils';

// Initial default voices for fallback
const DEFAULT_VOICES: VoiceOption[] = [
  { id: 'en-US-Wavenet-A', name: 'Wavenet A (Male)', gender: 'male' },
  { id: 'en-US-Wavenet-E', name: 'Wavenet E (Female)', gender: 'female' },
];

export function useVoiceData(
  language: string,
  onSelect: (voice: VoiceOption) => void,
  selectedVoice?: VoiceOption
) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchVoices = async () => {
      try {
        setLoading(true);
        
        // Call our Edge Function to get voices
        const { data, error } = await supabase.functions.invoke('get-google-voices');
        
        if (error || !data) {
          console.error('Error fetching voices:', error);
          return;
        }
        
        // Format the voices for our component
        if (isMounted && data[language]) {
          const formattedVoices: VoiceOption[] = [
            ...(data[language].voices.MALE || []).map((v: any) => ({
              id: v.name,
              name: formatVoiceName(v.name),
              gender: 'male' as const
            })),
            ...(data[language].voices.FEMALE || []).map((v: any) => ({
              id: v.name,
              name: formatVoiceName(v.name, 'female'),
              gender: 'female' as const
            }))
          ];
          
          // Sort voices by name
          formattedVoices.sort((a, b) => a.name.localeCompare(b.name));
          
          setVoices(formattedVoices.length > 0 ? formattedVoices : DEFAULT_VOICES);
          
          // If the selected voice is not in the new list, select the first one
          if (!selectedVoice || !formattedVoices.find(v => v.id === selectedVoice.id)) {
            onSelect(formattedVoices[0]);
          }
        } else if (isMounted) {
          // If no voices for the selected language, use defaults
          setVoices(DEFAULT_VOICES);
          onSelect(DEFAULT_VOICES[0]);
        }
      } catch (error) {
        console.error('Error loading voices:', error);
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
  }, [language, onSelect, selectedVoice]);

  return { voices, loading };
}
