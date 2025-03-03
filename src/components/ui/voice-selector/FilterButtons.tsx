
import { Users, User, UserRound, Mic } from 'lucide-react';

type VoiceFilter = 'all' | 'male' | 'female' | 'neutral';

interface FilterButtonsProps {
  filter: VoiceFilter;
  setFilter: (filter: VoiceFilter) => void;
}

const FilterButtons = ({ filter, setFilter }: FilterButtonsProps) => {
  return (
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
      <button 
        className={`flex-1 px-2 py-1 rounded ${filter === 'neutral' ? 'bg-background shadow-sm' : ''}`}
        onClick={() => setFilter('neutral')}
      >
        <span className="flex items-center justify-center">
          <Mic className="h-3 w-3 mr-1" />
          Neutral
        </span>
      </button>
    </div>
  );
};

export default FilterButtons;
