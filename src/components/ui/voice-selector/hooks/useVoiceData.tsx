
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VoiceOption } from '@/utils/audio/types';
import { formatVoiceName } from '../utils';

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
          console.error('Error fetching voices:', response.error);
          if (isMounted) {
            setError(`Failed to fetch voices: ${response.error.message}`);
            setLoading(false);
          }
          return;
        }
        
        // Check if we have valid data
        if (!response.data || typeof response.data !== 'object' || Object.keys(response.data).length === 0) {
          console.error('Invalid voice data format received');
          if (isMounted) {
            setError('No voices available. Google TTS API may be unreachable.');
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
            setError(`No voices available for language: ${language}`);
          } else {
            setVoices(formattedVoices);
            
            // If the selected voice is not in the new list, select the first one
            if (onSelect && (!selectedVoice || !formattedVoices.find(v => v.id === selectedVoice.id))) {
              onSelect(formattedVoices[0]);
            }
          }
        } else if (isMounted) {
          setError(`No voices available for language: ${language}`);
        }
      } catch (error) {
        console.error('Error loading voices:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to load voices');
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
