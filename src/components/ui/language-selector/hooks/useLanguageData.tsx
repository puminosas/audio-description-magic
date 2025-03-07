
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LanguageOption } from '@/utils/audio/types';

export function useLanguageData(
  selectedLanguage?: LanguageOption,
  onSelect?: (language: LanguageOption) => void
) {
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call our Edge Function to get voices
        const { data, error } = await supabase.functions.invoke('get-google-voices');
        
        if (error) {
          console.error('Error fetching languages:', error);
          if (isMounted) {
            setError(`Failed to fetch languages: ${error.message}`);
            setLoading(false);
          }
          return;
        }
        
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
          if (isMounted) {
            setError('No languages available. Google TTS API may be unreachable.');
            setLoading(false);
          }
          return;
        }
        
        // Format the languages from the response
        if (isMounted) {
          const formattedLanguages: LanguageOption[] = Object.keys(data).map(code => ({
            id: code,
            code,
            name: data[code].display_name || code,
          }));
          
          // Sort languages alphabetically
          formattedLanguages.sort((a, b) => a.name.localeCompare(b.name));
          
          if (formattedLanguages.length === 0) {
            setError('No languages available from Google TTS API');
          } else {
            setLanguages(formattedLanguages);
            
            // If the selected language is not in the new list, select the first one
            if (onSelect && !selectedLanguage || !formattedLanguages.find(l => l.code === selectedLanguage?.code)) {
              onSelect(formattedLanguages[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading languages:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to load languages');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchLanguages();
    
    return () => {
      isMounted = false;
    };
  }, [onSelect, selectedLanguage]);

  return { languages, loading, error };
}
