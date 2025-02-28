
import { useState } from 'react';
import { 
  Mic, 
  ChevronDown, 
  Check,
  User,
  UserRound,
  Users
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

// This uses OpenAI's voice names directly
const VOICES: Record<string, VoiceOption[]> = {
  all: [
    { id: 'alloy', name: 'Alloy', gender: 'neutral' },
    { id: 'echo', name: 'Echo', gender: 'male' },
    { id: 'fable', name: 'Fable', gender: 'female' },
    { id: 'onyx', name: 'Onyx', gender: 'male' },
    { id: 'nova', name: 'Nova', gender: 'female' },
    { id: 'shimmer', name: 'Shimmer', gender: 'female', premium: true },
  ]
};

// Default to English voices if language not found
const getVoicesForLanguage = (languageCode: string): VoiceOption[] => {
  return VOICES.all; // OpenAI voices work for all languages
};

const VoiceSelector = ({ onSelect, selectedVoice, language = 'en' }: VoiceSelectorProps) => {
  const voices = getVoicesForLanguage(language);
  const defaultVoice = voices[0];
  const effectiveSelectedVoice = selectedVoice || defaultVoice;
  
  const [filter, setFilter] = useState<'all' | 'male' | 'female' | 'neutral'>('all');
  
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
          <button 
            className={`flex-1 px-2 py-1 rounded ${filter === 'neutral' ? 'bg-background shadow-sm' : ''}`}
            onClick={() => setFilter('neutral')}
          >
            <span className="flex items-center justify-center">
              <Users className="h-3 w-3 mr-1" />
              Neutral
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
                    voice.gender === 'female' ?
                    <UserRound className="h-4 w-4 mr-2 text-pink-500" /> :
                    <Users className="h-4 w-4 mr-2 text-purple-500" />
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
