
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
  const [isLoadingContent, setIsLoadingContent] = useState(false);
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

  // Fetch file content
  const fetchFileContent = async (filePath: string) => {
    setIsLoadingContent(true);
    setError(null);
    
    try {
      console.log(`Fetching content for file: ${filePath}`);
      const { data, error } = await supabase.functions.invoke('get-file-content', {
        body: { filePath }
      });

      if (error) {
        console.error('Error fetching file content:', error);
        throw new Error(error.message || 'Failed to fetch file content');
      }
      
      if (!data || !data.content) {
        console.error('Invalid response for file content:', data);
        throw new Error('Invalid response from server');
      }
      
      console.log('File content loaded successfully');
      return data.content;
    } catch (error) {
      console.error('Error fetching file content:', error);
      setError(`Failed to load file content: ${error.message}`);
      toast({
        title: 'Error',
        description: 'Failed to load file content',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Get file content
  const handleFileSelect = async (filePath: string) => {
    setSelectedFile(filePath);
    setIsEditing(true);
    
    const content = await fetchFileContent(filePath);
    if (content) {
      setFileContent(content);
    } else {
      // Fallback message if content can't be loaded
      setFileContent(`// Error loading content for ${filePath}\n// This may be due to permission restrictions or file access limitations.`);
    }
  };

  // Save file content
  const handleSaveFile = async () => {
    if (!selectedFile) return;
    
    try {
      console.log(`Saving changes to file: ${selectedFile}`);
      const { data, error } = await supabase.functions.invoke('edit-file', {
        body: { 
          filePath: selectedFile,
          newContent: fileContent
        }
      });

      if (error) {
        console.error('Error saving file:', error);
        throw new Error(error.message || 'Failed to save file changes');
      }
      
      console.log('File saved successfully:', data);
      toast({
        title: 'Success',
        description: 'File changes saved successfully',
      });
    } catch (error) {
      console.error('Error saving file:', error);
      toast({
        title: 'Error',
        description: `Failed to save file: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  // Ask AI to analyze the file content
  const handleAnalyzeWithAI = async () => {
    if (!selectedFile || !fileContent) return;
    
    toast({
      title: 'AI Analysis Requested',
      description: 'Analyzing file content with AI...',
    });
    
    // This functionality would be implemented in the chat handling logic
    // Here we just log it for demo purposes
    console.log('AI analysis requested for file:', selectedFile);
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
    isLoadingContent,
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
    handleAnalyzeWithAI,
    toggleFileTypeFilter
  };
};
