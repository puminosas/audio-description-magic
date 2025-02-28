
import { useState } from 'react';
import { 
  Globe, 
  ChevronDown, 
  Check 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

interface LanguageSelectorProps {
  onSelect: (language: LanguageOption) => void;
  selectedLanguage?: LanguageOption;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

const LanguageSelector = ({ onSelect, selectedLanguage = LANGUAGES[0] }: LanguageSelectorProps) => {
  const [search, setSearch] = useState('');
  const filteredLanguages = LANGUAGES.filter(
    lang => 
      lang.name.toLowerCase().includes(search.toLowerCase()) || 
      lang.nativeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="flex items-center">
            <Globe className="mr-2 h-4 w-4" />
            <span>{selectedLanguage.name}</span>
            {selectedLanguage.flag && <span className="ml-2">{selectedLanguage.flag}</span>}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuLabel>Select Language</DropdownMenuLabel>
        <input 
          type="text" 
          placeholder="Search..."
          className="px-2 py-1 text-sm w-full border-b border-border focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {filteredLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              className="cursor-pointer"
              onClick={() => {
                onSelect(language);
                setSearch('');
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  {language.flag && <span className="mr-2">{language.flag}</span>}
                  <span>{language.name}</span>
                </div>
                {language.code === selectedLanguage.code && (
                  <Check className="h-4 w-4" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
