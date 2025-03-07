
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LanguageOption } from '@/utils/audio/types';

// Fallback languages in case the API fails
const fallbackLanguages: LanguageOption[] = [
  { id: 'en-US', code: 'en-US', name: 'English (US)' },
  { id: 'en-GB', code: 'en-GB', name: 'English (UK)' },
  { id: 'es-ES', code: 'es-ES', name: 'Spanish (Spain)' },
  { id: 'fr-FR', code: 'fr-FR', name: 'French (France)' },
  { id: 'de-DE', code: 'de-DE', name: 'German (Germany)' }
];

export function useLanguageData(
  selectedLanguage?: LanguageOption,
  onSelect?: (language: LanguageOption) => void
) {
  const [languages, setLanguages] = useState<LanguageOption[]>(fallbackLanguages);
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
            // Use fallback languages instead of showing an error
            setLanguages(fallbackLanguages);
            setLoading(false);
          }
          return;
        }
        
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
          if (isMounted) {
            // Use fallback languages instead of showing an error
            setLanguages(fallbackLanguages);
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
            // Use fallback languages if the API returned an empty array
            setLanguages(fallbackLanguages);
          } else {
            setLanguages(formattedLanguages);
          }
          
          // If the selected language is not in the new list, select the first one
          if (onSelect && (!selectedLanguage || !formattedLanguages.find(l => l.code === selectedLanguage?.code))) {
            onSelect(formattedLanguages[0] || fallbackLanguages[0]);
          }
        }
      } catch (error) {
        console.error('Error loading languages:', error);
        
        if (isMounted) {
          // Use fallback languages instead of showing an error
          setLanguages(fallbackLanguages);
          
          // If no language is selected, select the first fallback
          if (onSelect && !selectedLanguage) {
            onSelect(fallbackLanguages[0]);
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
