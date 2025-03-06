
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileFilters } from '../types';

export interface FileFiltersProps {
  filters: FileFilters;
  setSearchQuery: (query: string) => void;
  toggleTypeFilter: (type: string) => void;
  resetFilters: () => void;
}

export const FileFiltersComponent: React.FC<FileFiltersProps> = ({
  filters,
  setSearchQuery,
  toggleTypeFilter,
  resetFilters,
}) => {
  return (
    <div className="bg-secondary rounded-md p-4 mb-4">
      <h4 className="mb-2 font-semibold">Filter Files</h4>
      <Input
        type="search"
        placeholder="Search files..."
        value={filters.searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-3"
      />
      <div className="flex items-center space-x-3 mb-3">
        <Label htmlFor="type-text" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
          Text
        </Label>
        <Checkbox
          id="type-text"
          checked={filters.types.document}
          onCheckedChange={() => toggleTypeFilter('document')}
        />

        <Label htmlFor="type-code" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
          Code
        </Label>
        <Checkbox
          id="type-code"
          checked={filters.types.script}
          onCheckedChange={() => toggleTypeFilter('script')}
        />
      </div>
      <Button variant="outline" size="sm" onClick={resetFilters}>
        Reset Filters
      </Button>
    </div>
  );
};

export default FileFiltersComponent;
