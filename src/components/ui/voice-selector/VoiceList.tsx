
import { Check, User, UserRound, Users, Loader2 } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { VoiceOption } from '@/utils/audio/types';

interface VoiceListProps {
  loading: boolean;
  displayVoices: VoiceOption[];
  effectiveSelectedVoice: VoiceOption | null;
  onSelect: (voice: VoiceOption) => void;
  searchQuery: string;
}

const VoiceList = ({
  loading,
  displayVoices,
  effectiveSelectedVoice,
  onSelect,
  searchQuery
}: VoiceListProps) => {
  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (displayVoices.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {searchQuery.trim() ? 'No matching voices found' : 'No voices available for this language'}
      </div>
    );
  }

  // Helper function to check if a gender is male regardless of format
  const isMale = (gender: string) => gender === 'MALE' || gender === 'male';
  
  // Helper function to check if a gender is female regardless of format
  const isFemale = (gender: string) => gender === 'FEMALE' || gender === 'female';

  return (
    <>
      {displayVoices.map((voice) => (
        <DropdownMenuItem
          key={voice.id}
          className="cursor-pointer"
          onClick={() => onSelect(voice)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              {isMale(voice.gender) ? 
                <User className="h-4 w-4 mr-2 text-blue-500" /> : 
                isFemale(voice.gender) ?
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
      ))}
    </>
  );
};

export default VoiceList;
