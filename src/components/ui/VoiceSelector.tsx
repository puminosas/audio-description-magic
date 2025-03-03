
import { useState, useEffect } from 'react';
import { 
  Mic, 
  ChevronDown, 
  Check,
  User,
  UserRound,
  Users,
  Loader2,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { getAvailableVoices } from '@/utils/audio';

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
  const [voices, setVoices] = useState<VoiceOption[]>(getAvailableVoices(language));
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'male' | 'female' | 'neutral'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayVoices, setDisplayVoices] = useState<VoiceOption[]>(voices);
  
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
            ...(data[language].voices.MALE || []).map((v: any) => ({
              id: v.name,
              name: formatVoiceName(v.name),
              gender: 'male' as const
            })),
            ...(data[language].voices.FEMALE || []).map((v: any) => ({
              id: v.name,
              name: formatVoiceName(v.name, 'female'),
              gender: 'female' as const
            }))
          ];
          
          // Sort voices by name
          formattedVoices.sort((a, b) => a.name.localeCompare(b.name));
          
          setVoices(formattedVoices.length > 0 ? formattedVoices : DEFAULT_VOICES);
          
          // Apply current filter and search
          updateDisplayVoices(formattedVoices, filter, searchQuery);
          
          // If the selected voice is not in the new list, select the first one
          if (!selectedVoice || !formattedVoices.find(v => v.id === selectedVoice.id)) {
            onSelect(formattedVoices[0]);
          }
        } else if (isMounted) {
          // If no voices for the selected language, use defaults
          setVoices(DEFAULT_VOICES);
          setDisplayVoices(DEFAULT_VOICES);
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
  
  // Helper function to format voice names for better readability
  function formatVoiceName(voiceName: string, gender?: string): string {
    const nameParts = voiceName.split('-');
    const voiceId = nameParts[nameParts.length - 1];
    const voiceType = voiceName.includes('Wavenet') ? 'Wavenet' : 
                     voiceName.includes('Neural2') ? 'Neural2' : 
                     voiceName.includes('Standard') ? 'Standard' : '';
    
    return `${voiceType} ${voiceId} (${gender === 'female' ? 'Female' : 'Male'})`;
  }
  
  // Update displayed voices when filter or search changes
  const updateDisplayVoices = (allVoices: VoiceOption[], currentFilter: string, query: string) => {
    let filtered = allVoices;
    
    // Apply gender filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(voice => voice.gender === currentFilter);
    }
    
    // Apply search query
    if (query.trim()) {
      const lowQuery = query.toLowerCase();
      filtered = filtered.filter(voice => 
        voice.name.toLowerCase().includes(lowQuery) || 
        voice.id.toLowerCase().includes(lowQuery)
      );
    }
    
    setDisplayVoices(filtered);
  };
  
  // Handle filter changes
  useEffect(() => {
    updateDisplayVoices(voices, filter, searchQuery);
  }, [filter, searchQuery, voices]);
  
  // Default to the first voice if none selected
  const effectiveSelectedVoice = selectedVoice || (voices.length > 0 ? voices[0] : null);

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
      <DropdownMenuContent className="w-[300px]">
        <DropdownMenuLabel>Select Voice</DropdownMenuLabel>
        <div className="px-2 py-2">
          <Input
            placeholder="Search voices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 mb-2"
            icon={<Search className="h-4 w-4" />}
          />
          <div className="flex p-1 bg-secondary/50 rounded-md text-xs">
            <button 
              className={`flex-1 px-2 py-1 rounded ${filter === 'all' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setFilter('all')}
            >
              <span className="flex items-center justify-center">
                <Users className="h-3 w-3 mr-1" />
                All
              </span>
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
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : displayVoices.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {searchQuery.trim() ? 'No matching voices found' : 'No voices available for this language'}
            </div>
          ) : (
            displayVoices.map((voice) => (
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
                    <div>
                      <div>{voice.name}</div>
                      <div className="text-xs text-muted-foreground">{voice.id}</div>
                    </div>
                  </div>
                  {effectiveSelectedVoice && voice.id === effectiveSelectedVoice.id && (
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
