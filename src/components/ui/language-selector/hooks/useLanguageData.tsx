
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LanguageOption } from '@/utils/audio/types';
import languageMapping from '@/utils/audio/languageMapping.json';

// Create minimal fallback languages
const defaultLanguages: LanguageOption[] = [
  { id: 'en-US', code: 'en-US', name: 'English (United States)' },
  { id: 'en-GB', code: 'en-GB', name: 'English (United Kingdom)' },
  { id: 'es-ES', code: 'es-ES', name: 'Español' },
  { id: 'fr-FR', code: 'fr-FR', name: 'Français' },
  { id: 'de-DE', code: 'de-DE', name: 'Deutsch' }
];

export function useLanguageData(
  selectedLanguage?: LanguageOption,
  onSelect?: (language: LanguageOption) => void
) {
  const [languages, setLanguages] = useState<LanguageOption[]>(defaultLanguages);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call our Edge Function to get voices
        const anon_key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        
        const { data, error } = await supabase.functions.invoke('get-google-voices', {
          headers: { apikey: anon_key }
        });
        
        if (error) {
          console.warn('Using fallback languages due to error:', error);
          
          if (isMounted) {
            setError(error.message);
            setLanguages(defaultLanguages);
            setLoading(false);
          }
          return;
        }
        
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
          if (isMounted) {
            setError('No languages found');
            setLanguages(defaultLanguages);
            setLoading(false);
          }
          return;
        }
        
        // Format the languages from the response
        if (isMounted) {
          // Check if we got fallback data due to an error
          const actualData = data.fallbackUsed ? data.data : data;
          
          const formattedLanguages: LanguageOption[] = Object.keys(actualData).map(code => {
            // Use our language mapping for friendly names when available
            const friendlyName = code in languageMapping ? 
              languageMapping[code as keyof typeof languageMapping] : 
              actualData[code].display_name || code;
              
            return {
              id: code,
              code,
              name: friendlyName,
            };
          });
          
          // Sort languages alphabetically
          formattedLanguages.sort((a, b) => a.name.localeCompare(b.name));
          
          if (formattedLanguages.length === 0) {
            // Use fallback languages if the API returned an empty array
            setLanguages(defaultLanguages);
          } else {
            setLanguages(formattedLanguages);
          }
          
          // If the selected language is not in the new list, select the first one
          if (onSelect && (!selectedLanguage || !formattedLanguages.find(l => l.code === selectedLanguage?.code))) {
            onSelect(formattedLanguages[0] || defaultLanguages[0]);
          }
        }
      } catch (error) {
        console.warn('Using fallback languages due to error:', error);
        
        if (isMounted) {
          setError(error instanceof Error ? error.message : String(error));
          setLanguages(defaultLanguages);
          
          // If no language is selected, select the first fallback
          if (onSelect && !selectedLanguage) {
            onSelect(defaultLanguages[0]);
          }
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
