
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchInput = ({ searchQuery, setSearchQuery }: SearchInputProps) => {
  return (
    <div className="relative mb-2">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search voices..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-8 pl-8"
      />
    </div>
  );
};

export default SearchInput;
