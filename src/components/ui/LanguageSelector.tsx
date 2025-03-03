
import { useState, useEffect } from 'react';
import { Globe, ChevronDown, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';

export interface LanguageOption {
  code: string;
  name: string;
}

interface LanguageSelectorProps {
  onSelect: (language: LanguageOption) => void;
  selectedLanguage?: LanguageOption;
}

// Default languages as fallback
const DEFAULT_LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
];

const LanguageSelector = ({ onSelect, selectedLanguage }: LanguageSelectorProps) => {
  const [languages, setLanguages] = useState<LanguageOption[]>(DEFAULT_LANGUAGES);
  const [loading, setLoading] = useState(false);

  // Fetch available languages from Google TTS
  useEffect(() => {
    let isMounted = true;
    
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        
        // Call our Edge Function to get voices, which also includes languages
        const { data, error } = await supabase.functions.invoke('get-google-voices');
        
        if (error || !data) {
          console.error('Error fetching languages:', error);
          return;
        }
        
        // Format the languages from the response
        if (isMounted) {
          const formattedLanguages: LanguageOption[] = Object.keys(data).map(code => ({
            code,
            name: data[code].display_name || code
          }));
          
          setLanguages(formattedLanguages.length > 0 ? formattedLanguages : DEFAULT_LANGUAGES);
          
          // If the selected language is not in the new list, select the first one
          if (selectedLanguage && !formattedLanguages.find(l => l.code === selectedLanguage.code)) {
            onSelect(formattedLanguages[0]);
          }
        }
      } catch (error) {
        console.error('Error loading languages:', error);
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
  }, []);

  // Default to the first language if none selected
  const effectiveSelectedLanguage = selectedLanguage || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="flex items-center">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Globe className="mr-2 h-4 w-4" />
            )}
            <span>{effectiveSelectedLanguage?.name || 'Select Language'}</span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]">
        <DropdownMenuLabel>Select Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                className="cursor-pointer"
                onClick={() => onSelect(language)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>{language.name}</span>
                  </div>
                  {language.code === effectiveSelectedLanguage.code && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
