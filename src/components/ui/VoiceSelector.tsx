
import { useState, useEffect } from 'react';
import { 
  Mic, 
  ChevronDown, 
  Check,
  User,
  UserRound,
  Users,
  Loader2
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
import { supabase } from '@/integrations/supabase/client';
import { VoiceOption } from '@/utils/audio/types';

interface VoiceSelectorProps {
  onSelect: (voice: VoiceOption) => void;
  selectedVoice?: VoiceOption;
  language?: string;
}

// Initial default voices for fallback
const DEFAULT_VOICES: VoiceOption[] = [
  { id: 'en-US-Wavenet-A', name: 'Wavenet A (Male)', gender: 'male' },
  { id: 'en-US-Wavenet-E', name: 'Wavenet E (Female)', gender: 'female' },
];

const VoiceSelector = ({ onSelect, selectedVoice, language = 'en-US' }: VoiceSelectorProps) => {
  const [voices, setVoices] = useState<VoiceOption[]>(DEFAULT_VOICES);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'male' | 'female' | 'neutral'>('all');
  
  // Fetch voices from Google TTS when language changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchVoices = async () => {
      try {
        setLoading(true);
        
        // Call our Edge Function to get voices
        const { data, error } = await supabase.functions.invoke('get-google-voices');
        
        if (error || !data) {
          console.error('Error fetching voices:', error);
          return;
        }
        
        // Format the voices for our component
        if (isMounted && data[language]) {
          const formattedVoices: VoiceOption[] = [
            ...data[language].voices.MALE.map((v: any) => ({
              id: v.name,
              name: v.name.split('-').pop() + ' (Male)',
              gender: 'male' as const
            })),
            ...data[language].voices.FEMALE.map((v: any) => ({
              id: v.name,
              name: v.name.split('-').pop() + ' (Female)',
              gender: 'female' as const
            }))
          ];
          
          setVoices(formattedVoices.length > 0 ? formattedVoices : DEFAULT_VOICES);
          
          // If the selected voice is not in the new list, select the first one
          if (!selectedVoice || !formattedVoices.find(v => v.id === selectedVoice.id)) {
            onSelect(formattedVoices[0]);
          }
        } else if (isMounted) {
          // If no voices for the selected language, use defaults
          setVoices(DEFAULT_VOICES);
          onSelect(DEFAULT_VOICES[0]);
        }
      } catch (error) {
        console.error('Error loading voices:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchVoices();
    
    return () => {
      isMounted = false;
    };
  }, [language]);
  
  // Default to the first voice if none selected
  const effectiveSelectedVoice = selectedVoice || voices[0];
  
  // Filter voices based on selection
  const filteredVoices = voices.filter(voice => {
    if (filter === 'all') return true;
    return voice.gender === filter;
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="flex items-center">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mic className="mr-2 h-4 w-4" />
            )}
            <span>{effectiveSelectedVoice?.name || 'Select Voice'}</span>
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
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : filteredVoices.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No voices available for this language
            </div>
          ) : (
            filteredVoices.map((voice) => (
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
                  </div>
                  {voice.id === effectiveSelectedVoice.id && (
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

export default VoiceSelector;
