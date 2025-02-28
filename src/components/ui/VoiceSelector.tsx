
import { useState } from 'react';
import { 
  Mic, 
  ChevronDown, 
  Check,
  User,
  UserRound,
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

interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  sample?: string;
  premium?: boolean;
}

interface VoiceSelectorProps {
  onSelect: (voice: VoiceOption) => void;
  selectedVoice?: VoiceOption;
  language?: string;
}

// This is a simulated dataset - in a real application, this would come from an API
const VOICES: Record<string, VoiceOption[]> = {
  en: [
    { id: 'en-US-1', name: 'Matthew', gender: 'male' },
    { id: 'en-US-2', name: 'Joanna', gender: 'female' },
    { id: 'en-US-3', name: 'Salli', gender: 'female' },
    { id: 'en-US-4', name: 'Joey', gender: 'male' },
    { id: 'en-US-5', name: 'Kimberly', gender: 'female' },
    { id: 'en-US-6', name: 'Amy', gender: 'female', premium: true },
    { id: 'en-US-7', name: 'Brian', gender: 'male', premium: true },
    { id: 'en-US-8', name: 'Emma', gender: 'female', premium: true },
    { id: 'en-US-9', name: 'Russell', gender: 'male', premium: true },
  ],
  es: [
    { id: 'es-ES-1', name: 'Miguel', gender: 'male' },
    { id: 'es-ES-2', name: 'Penélope', gender: 'female' },
    { id: 'es-ES-3', name: 'Lupe', gender: 'female', premium: true },
  ],
  fr: [
    { id: 'fr-FR-1', name: 'Mathieu', gender: 'male' },
    { id: 'fr-FR-2', name: 'Céline', gender: 'female' },
    { id: 'fr-FR-3', name: 'Léa', gender: 'female', premium: true },
  ],
  de: [
    { id: 'de-DE-1', name: 'Hans', gender: 'male' },
    { id: 'de-DE-2', name: 'Marlene', gender: 'female' },
    { id: 'de-DE-3', name: 'Vicki', gender: 'female', premium: true },
  ],
  // Add more languages as needed
};

// Default to English voices if language not found
const getVoicesForLanguage = (languageCode: string): VoiceOption[] => {
  const code = languageCode.split('-')[0];
  return VOICES[code] || VOICES.en;
};

const VoiceSelector = ({ onSelect, selectedVoice, language = 'en' }: VoiceSelectorProps) => {
  const voices = getVoicesForLanguage(language);
  const defaultVoice = voices[0];
  const effectiveSelectedVoice = selectedVoice || defaultVoice;
  
  const [filter, setFilter] = useState<'all' | 'male' | 'female'>('all');
  
  const filteredVoices = voices.filter(voice => {
    if (filter === 'all') return true;
    return voice.gender === filter;
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="flex items-center">
            <Mic className="mr-2 h-4 w-4" />
            <span>{effectiveSelectedVoice.name}</span>
            {effectiveSelectedVoice.premium && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">Premium</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuLabel>Select Voice</DropdownMenuLabel>
        <div className="flex p-1 bg-secondary/50 rounded-md m-2 text-xs">
          <button 
            className={`flex-1 px-2 py-1 rounded ${filter === 'all' ? 'bg-background shadow-sm' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`flex-1 px-2 py-1 rounded ${filter === 'male' ? 'bg-background shadow-sm' : ''}`}
            onClick={() => setFilter('male')}
          >
            <span className="flex items-center justify-center">
              <User className="h-3 w-3 mr-1" />
              Male
            </span>
          </button>
          <button 
            className={`flex-1 px-2 py-1 rounded ${filter === 'female' ? 'bg-background shadow-sm' : ''}`}
            onClick={() => setFilter('female')}
          >
            <span className="flex items-center justify-center">
              <UserRound className="h-3 w-3 mr-1" />
              Female
            </span>
          </button>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {filteredVoices.map((voice) => (
            <DropdownMenuItem
              key={voice.id}
              className="cursor-pointer"
              onClick={() => onSelect(voice)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  {voice.gender === 'male' ? 
                    <User className="h-4 w-4 mr-2 text-blue-500" /> : 
                    <UserRound className="h-4 w-4 mr-2 text-pink-500" />
                  }
                  <span>{voice.name}</span>
                  {voice.premium && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">Premium</span>
                  )}
                </div>
                {voice.id === effectiveSelectedVoice.id && (
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

export default VoiceSelector;
