
import { useMemo, useState } from 'react';
import { FileInfo, FileFilters } from '../../types';
import { FileFiltersReturn } from './types';

export function useFileFilters(files: FileInfo[]): FileFiltersReturn {
  const [filters, setFilters] = useState<FileFilters>({
    searchQuery: '',
    types: {
      script: true,
      document: true,
      style: true,
      config: true,
      unknown: true
    }
  });

  // Set search query filter
  const setSearchQuery = (query: string) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: query
    }));
  };

  // Toggle file type filter
  const toggleTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type as keyof typeof prev.types]
      }
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      types: {
        script: true,
        document: true,
        style: true,
        config: true,
        unknown: true
      }
    });
  };

  // Apply filters to the file list
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      // Apply search query filter
      const matchesSearch = filters.searchQuery === '' || 
        file.path.toLowerCase().includes(filters.searchQuery.toLowerCase());

      // Apply file type filter - if none are selected, show all
      const allTypesOff = Object.values(filters.types).every(value => !value);
      const fileType = file.type || 'unknown';
      const matchesType = allTypesOff || filters.types[fileType as keyof typeof filters.types];

      return matchesSearch && matchesType;
    });
  }, [files, filters.searchQuery, filters.types]);

  return {
    filters,
    filteredFiles,
    setSearchQuery,
    toggleTypeFilter,
    resetFilters
  };
}
