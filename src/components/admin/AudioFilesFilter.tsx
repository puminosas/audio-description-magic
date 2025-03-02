
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
import { X, RefreshCw } from 'lucide-react';

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
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex-1">
        <Input
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="w-full md:w-[200px]">
        <Select value={filterLanguage} onValueChange={setFilterLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {languages.map(lang => (
              <SelectItem key={lang} value={lang || "unknown"}>{lang || "Unknown"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full md:w-[200px]">
        <Select value={filterVoice} onValueChange={setFilterVoice}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by voice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Voices</SelectItem>
            {voices.map(voice => (
              <SelectItem key={voice} value={voice || "unknown"}>{voice || "Unknown"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button variant="outline" onClick={onClearFilters}>
        <X className="h-4 w-4 mr-2" />
        Clear
      </Button>
      
      <Button variant="outline" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
};

export default AudioFilesFilter;
