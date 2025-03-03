
import { useState, useMemo } from 'react';
import { FileInfo } from '../../types';
import { FileFilters } from './types';

export const useFileFilters = (files: FileInfo[]) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fileTypeFilters, setFileTypeFilters] = useState<string[]>([]);

  // Extract unique file types from the files array
  const uniqueFileTypes = useMemo(() => 
    Array.from(new Set(files.map(file => file.type))).filter(type => type), 
    [files]
  );

  // Filter files by type and search term
  const filteredFiles = useMemo(() => 
    files.filter(file => {
      const matchesSearch = file.path.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = fileTypeFilters.length === 0 || fileTypeFilters.includes(file.type);
      return matchesSearch && matchesType;
    }),
    [files, searchTerm, fileTypeFilters]
  );

  // Toggle a file type filter
  const toggleFileTypeFilter = (type: string) => {
    setFileTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFileTypeFilters([]);
  };

  const filters: FileFilters = {
    searchTerm,
    fileTypeFilters
  };

  return {
    searchTerm,
    setSearchTerm,
    fileTypeFilters,
    setFileTypeFilters,
    uniqueFileTypes,
    filteredFiles,
    toggleFileTypeFilter,
    resetFilters,
    filters
  };
};
