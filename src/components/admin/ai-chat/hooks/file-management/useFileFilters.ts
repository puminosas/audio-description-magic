
import { useState } from 'react';
import { FileInfo } from '../../types';
import { FileFilters, FileFiltersReturn } from './types';

const initialFilters: FileFilters = {
  types: [],
  searchQuery: ''
};

export const useFileFilters = (): FileFiltersReturn => {
  const [activeFilters, setActiveFilters] = useState<FileFilters>(initialFilters);

  const setSearchQuery = (query: string) => {
    setActiveFilters(prev => ({
      ...prev,
      searchQuery: query
    }));
  };

  const toggleFileTypeFilter = (type: string) => {
    setActiveFilters(prev => {
      const types = prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      
      return {
        ...prev,
        types
      };
    });
  };

  const clearFilters = () => {
    setActiveFilters(initialFilters);
  };

  const applyFilters = (files: FileInfo[]): FileInfo[] => {
    return files.filter(file => {
      // Apply search filter
      const matchesSearch = activeFilters.searchQuery
        ? file.path.toLowerCase().includes(activeFilters.searchQuery.toLowerCase())
        : true;

      // Apply type filter
      const matchesType = activeFilters.types.length > 0
        ? activeFilters.types.includes(file.type)
        : true;

      return matchesSearch && matchesType;
    });
  };

  return {
    activeFilters,
    setSearchQuery,
    toggleFileTypeFilter,
    clearFilters,
    applyFilters
  };
};
