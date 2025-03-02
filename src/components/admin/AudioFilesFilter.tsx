
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, RefreshCw, Search } from 'lucide-react';

interface AudioFilesFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterLanguage: string;
  setFilterLanguage: (value: string) => void;
  filterVoice: string;
  setFilterVoice: (value: string) => void;
  languages: string[];
  voices: string[];
  onClearFilters: () => void;
  onRefresh: () => void;
}

const AudioFilesFilter = ({
  searchTerm,
  setSearchTerm,
  filterLanguage,
  setFilterLanguage,
  filterVoice,
  setFilterVoice,
  languages,
  voices,
  onClearFilters,
  onRefresh
}: AudioFilesFilterProps) => {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This form prevents default to avoid page reloads
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-auto">
          <Select 
            value={filterLanguage} 
            onValueChange={setFilterLanguage}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.length === 0 ? (
                <SelectItem value="no-options" disabled>No languages available</SelectItem>
              ) : (
                languages.map(lang => (
                  <SelectItem key={lang} value={lang || "unknown"}>{lang || "Unknown"}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          <Select 
            value={filterVoice} 
            onValueChange={setFilterVoice}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Voices</SelectItem>
              {voices.length === 0 ? (
                <SelectItem value="no-options" disabled>No voices available</SelectItem>
              ) : (
                voices.map(voice => (
                  <SelectItem key={voice} value={voice || "unknown"}>{voice || "Unknown"}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </form>
      
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
        
        <Button variant="default" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default AudioFilesFilter;
