
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileInfo } from '../types';

export const useFileManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshingFiles, setIsRefreshingFiles] = useState(false);
  const [fileTypeFilters, setFileTypeFilters] = useState<string[]>([]);

  // Extract unique file types from the files array
  const uniqueFileTypes = Array.from(
    new Set(files.map(file => file.type))
  ).filter(type => type);

  // Fetch project files
  const fetchFiles = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingFiles(true);
    setError(null);
    setIsRefreshingFiles(true);
    
    try {
      console.log('Fetching project files...');
      const { data, error } = await supabase.functions.invoke('project-files', {
        method: 'GET',
      });

      if (error) {
        console.error('Error invoking project-files function:', error);
        throw new Error(error.message || 'Failed to load project files');
      }
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid response from project-files function:', data);
        throw new Error('Invalid response from server');
      }
      
      console.log('Project files loaded:', data.length);
      setFiles(data as FileInfo[]);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(`Failed to load project files: ${error.message}`);
      toast({
        title: 'Error',
        description: 'Failed to load project files',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFiles(false);
      setIsRefreshingFiles(false);
    }
  }, [toast, user]);

  // On component mount, fetch files
  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [fetchFiles, user]);

  // Get file content (simulated for now)
  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    
    // In a real implementation, this would fetch the actual file content
    // For security reasons, we're just returning the file path information
    setFileContent(`// This is a preview for ${filePath}\n\n// In a full implementation, this would fetch and display the actual file content.\n// For security reasons, this feature is limited in the current version.`);
    
    setIsEditing(true);
  };

  // Simulate file editing
  const handleSaveFile = () => {
    toast({
      title: 'Feature Limited',
      description: `File editing is a simulated feature and doesn't modify actual files`,
    });
    setIsEditing(false);
    setSelectedFile(null);
    setFileContent('');
  };

  // Filter files by type and search term
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = fileTypeFilters.length === 0 || fileTypeFilters.includes(file.type);
    return matchesSearch && matchesType;
  });

  // Toggle a file type filter
  const toggleFileTypeFilter = (type: string) => {
    setFileTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  return {
    files,
    filteredFiles,
    isLoadingFiles,
    selectedFile,
    fileContent,
    isEditing,
    error,
    searchTerm,
    isRefreshingFiles,
    fileTypeFilters,
    uniqueFileTypes,
    setSearchTerm,
    setFileContent,
    setIsEditing,
    setFileTypeFilters,
    fetchFiles,
    handleFileSelect,
    handleSaveFile,
    toggleFileTypeFilter
  };
};
