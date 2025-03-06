
import { useState, useEffect, useMemo } from 'react';
import { Globe, ChevronDown, Check, Loader2, Search, AlertTriangle } from 'lucide-react';
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
import { LanguageOption } from '@/utils/audio/types';
import { getAvailableLanguages, initializeGoogleVoices } from '@/utils/audio';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LanguageSelectorProps {
  onSelect: (language: LanguageOption) => void;
  selectedLanguage?: LanguageOption;
}

const LanguageSelector = ({ onSelect, selectedLanguage }: LanguageSelectorProps) => {
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use useMemo to derive filtered languages list
  const displayLanguages = useMemo(() => {
    if (!searchQuery.trim()) {
      return languages;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return languages.filter(lang => 
      lang.name.toLowerCase().includes(query) || 
      lang.code.toLowerCase().includes(query)
    );
  }, [searchQuery, languages]);

  // Fetch available languages from Google TTS
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
            if (!selectedLanguage || !formattedLanguages.find(l => l.code === selectedLanguage.code)) {
              onSelect(formattedLanguages[0]);
            }
            
            // Update our global cache
            await initializeGoogleVoices();
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

  // Get the selected language display
  const selectedLanguageDisplay = selectedLanguage?.name || 'Select Language';

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between" disabled={loading || !!error}>
            <span className="flex items-center">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : error ? (
                <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
              ) : (
                <Globe className="mr-2 h-4 w-4" />
              )}
              <span>{error ? 'No Languages Available' : selectedLanguageDisplay}</span>
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]">
          <DropdownMenuLabel>Select Language</DropdownMenuLabel>
          <div className="px-2 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8"
              />
            </div>
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : error ? (
              <div className="p-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              </div>
            ) : displayLanguages.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No languages found
              </div>
            ) : (
              displayLanguages.map((language) => (
                <DropdownMenuItem
                  key={language.code}
                  className="cursor-pointer"
                  onClick={() => onSelect(language)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <div>
                        <div>{language.name}</div>
                      </div>
                    </div>
                    {selectedLanguage && language.code === selectedLanguage.code && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {error && (
        <p className="text-destructive text-xs mt-1">
          Google TTS languages unavailable. {error}
        </p>
      )}
    </div>
  );
};

export default LanguageSelector;
