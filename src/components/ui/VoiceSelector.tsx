
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

export interface VoiceOption {
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

// This uses modern TTS voice options, expanded from OpenAI's set
const VOICES: Record<string, VoiceOption[]> = {
  all: [
    // OpenAI voices
    { id: 'alloy', name: 'Alloy', gender: 'neutral' },
    { id: 'echo', name: 'Echo', gender: 'male' },
    { id: 'fable', name: 'Fable', gender: 'female' },
    { id: 'onyx', name: 'Onyx', gender: 'male' },
    { id: 'nova', name: 'Nova', gender: 'female' },
    { id: 'shimmer', name: 'Shimmer', gender: 'female', premium: true },
    // ElevenLabs voices
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', gender: 'female', premium: true },
    { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'male', premium: true },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'female', premium: true },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', gender: 'female', premium: true },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', gender: 'male', premium: true },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'male', premium: true },
    { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'male', premium: true },
    { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', gender: 'neutral', premium: true },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'male', premium: true },
    { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'female', premium: true },
    { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', gender: 'female', premium: true },
    { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'female', premium: true },
    { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', gender: 'male', premium: true },
    { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', gender: 'female', premium: true },
    { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', gender: 'male', premium: true },
    { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', gender: 'male', premium: true },
    { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', gender: 'male', premium: true },
    { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'male', premium: true },
    { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', gender: 'female', premium: true },
    { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', gender: 'male', premium: true },
  ]
};

// Use all voices for all languages since modern TTS systems handle multiple languages
const getVoicesForLanguage = (languageCode: string): VoiceOption[] => {
  return VOICES.all;
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
      <DropdownMenuContent className="w-[240px]">
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
