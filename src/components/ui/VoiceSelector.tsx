
import { useState, useMemo } from 'react';
import { Mic, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VoiceOption } from '@/utils/audio/types';
import SearchInput from './voice-selector/SearchInput';
import FilterButtons from './voice-selector/FilterButtons';
import VoiceList from './voice-selector/VoiceList';
import { useVoiceData } from './voice-selector/hooks/useVoiceData';

interface VoiceSelectorProps {
  onSelect: (voice: VoiceOption) => void;
  selectedVoice?: VoiceOption;
  language?: string;
}

const VoiceSelector = ({ onSelect, selectedVoice, language = 'en-US' }: VoiceSelectorProps) => {
  // State for filtering and search
  const [filter, setFilter] = useState<'all' | 'male' | 'female' | 'neutral'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom hook to fetch voice data
  const { voices, loading, error } = useVoiceData(language, selectedVoice, onSelect);
  
  // Helper function to check gender regardless of format
  const matchesGender = (voiceGender: string, filterGender: string): boolean => {
    if (filterGender === 'male') {
      return voiceGender === 'MALE' || voiceGender === 'male';
    } else if (filterGender === 'female') {
      return voiceGender === 'FEMALE' || voiceGender === 'female';
    } else if (filterGender === 'neutral') {
      return voiceGender === 'neutral';
    }
    return false;
  };
  
  // Use useMemo to derive filtered voices list for better performance
  const displayVoices = useMemo(() => {
    let filtered = voices;
    
    // Apply gender filter
    if (filter !== 'all') {
      filtered = filtered.filter(voice => matchesGender(voice.gender, filter));
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const lowQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(voice => 
        voice.name.toLowerCase().includes(lowQuery) || 
        voice.id.toLowerCase().includes(lowQuery)
      );
    }
    
    return filtered;
  }, [voices, filter, searchQuery]);
  
  // Get the selected voice display
  const selectedVoiceDisplay = selectedVoice?.name || 'Select Voice';

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between" disabled={loading}>
            <span className="flex items-center">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mic className="mr-2 h-4 w-4" />
              )}
              <span>{selectedVoiceDisplay}</span>
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]">
          <DropdownMenuLabel>Select Voice</DropdownMenuLabel>
          <div className="px-2 py-2">
            <SearchInput 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
            />
            <FilterButtons 
              filter={filter} 
              setFilter={setFilter} 
            />
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-64 overflow-y-auto">
            <VoiceList 
              loading={loading}
              displayVoices={displayVoices}
              effectiveSelectedVoice={selectedVoice}
              onSelect={onSelect}
              searchQuery={searchQuery}
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default VoiceSelector;
