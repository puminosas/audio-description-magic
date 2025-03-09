
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LanguageOption } from '@/utils/audio/types';
import languageMapping from '@/utils/audio/languageMapping.json';

// Create fallback languages from our mapping file
const fallbackLanguages: LanguageOption[] = Object.entries(languageMapping).map(([code, name]) => ({
  id: code,
  code,
  name: name as string
})).sort((a, b) => a.name.localeCompare(b.name));

// Default languages if fallback creation fails
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
  const [languages, setLanguages] = useState<LanguageOption[]>(fallbackLanguages.length > 0 ? fallbackLanguages : defaultLanguages);
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
          console.warn('Using fallback languages due to error:', error);
          
          if (isMounted) {
            // Use fallback languages instead of showing an error
            setLanguages(fallbackLanguages.length > 0 ? fallbackLanguages : defaultLanguages);
            setLoading(false);
          }
          return;
        }
        
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
          if (isMounted) {
            // Use fallback languages instead of showing an error
            setLanguages(fallbackLanguages.length > 0 ? fallbackLanguages : defaultLanguages);
            setLoading(false);
          }
          return;
        }
        
        // Format the languages from the response
        if (isMounted) {
          const formattedLanguages: LanguageOption[] = Object.keys(data).map(code => {
            // Use our language mapping for friendly names when available
            const friendlyName = code in languageMapping ? 
              languageMapping[code as keyof typeof languageMapping] : 
              data[code].display_name || code;
              
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
            setLanguages(fallbackLanguages.length > 0 ? fallbackLanguages : defaultLanguages);
          } else {
            setLanguages(formattedLanguages);
          }
          
          // If the selected language is not in the new list, select the first one
          if (onSelect && (!selectedLanguage || !formattedLanguages.find(l => l.code === selectedLanguage?.code))) {
            onSelect(formattedLanguages[0] || fallbackLanguages[0] || defaultLanguages[0]);
          }
        }
      } catch (error) {
        console.warn('Using fallback languages due to error:', error);
        
        if (isMounted) {
          // Use fallback languages instead of showing an error
          setLanguages(fallbackLanguages.length > 0 ? fallbackLanguages : defaultLanguages);
          
          // If no language is selected, select the first fallback
          if (onSelect && !selectedLanguage) {
            onSelect(fallbackLanguages[0] || defaultLanguages[0]);
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
