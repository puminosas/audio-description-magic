
import { useState, useMemo } from 'react';
import { Globe, ChevronDown, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageOption } from '@/utils/audio/types';
import { useLanguageData } from './hooks/useLanguageData';
import SearchBar from './SearchBar';
import LanguageList from './LanguageList';

interface LanguageSelectorProps {
  onSelect: (language: LanguageOption) => void;
  selectedLanguage?: LanguageOption;
}

const LanguageSelector = ({ onSelect, selectedLanguage }: LanguageSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { languages, loading, error } = useLanguageData(selectedLanguage, onSelect);
  
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

  // Get the selected language display
  const selectedLanguageDisplay = selectedLanguage?.name || 'Select Language';

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between" disabled={loading}>
            <span className="flex items-center">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Globe className="mr-2 h-4 w-4" />
              )}
              <span>{selectedLanguageDisplay}</span>
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]">
          <DropdownMenuLabel>Select Language</DropdownMenuLabel>
          <div className="px-2 py-2">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-64 overflow-y-auto">
            <LanguageList
              loading={loading}
              error={error}
              displayLanguages={displayLanguages}
              selectedLanguage={selectedLanguage || null}
              onSelect={onSelect}
              searchQuery={searchQuery}
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;
