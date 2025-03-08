
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { getAudioHistory, deleteAudioFile } from '@/utils/audio/historyService';
import { useToast } from '@/hooks/use-toast';

export const useAudioHistory = (user: User | null, onRefreshStats?: () => Promise<void>) => {
  // State for storing the audio files
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Boolean state to track initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchHistory = useCallback(async (page = 1) => {
    if (!user) {
      setFiles([]);
      setLoading(false);
      return;
    }

    if (page === 1 || isInitialLoad) {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      // Use optimized paginated query
      const { data: history, count } = await getAudioHistory(page, itemsPerPage);
      
      if (page === 1) {
        setFiles(history || []);
      } else {
        // Append to existing files if paginating
        setFiles(prev => [...prev, ...(history || [])]);
      }
      
      // Calculate total pages
      const total = Math.ceil((count || 0) / itemsPerPage);
      setTotalPages(total);
      setCurrentPage(page);
      
      // Mark initial load as complete
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (err) {
      console.error('Failed to fetch audio history:', err);
      setError('Failed to load your audio history');
      toast({
        title: 'Error',
        description: 'Could not load your audio history. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast, itemsPerPage, isInitialLoad]);

  // Load next page of history
  const loadMore = useCallback(() => {
    if (currentPage < totalPages && !loading) {
      fetchHistory(currentPage + 1);
    }
  }, [currentPage, totalPages, loading, fetchHistory]);

  // Initial data load
  useEffect(() => {
    if (user && isInitialLoad) {
      fetchHistory(1);
    }
  }, [user, fetchHistory, isInitialLoad]);

  const handlePlayPause = (fileId: string) => {
    setAudioPlaying(prevId => prevId === fileId ? null : fileId);
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      setDeleteFileId(fileId);
      await deleteAudioFile(fileId);
      
      // Update the local state to remove the deleted file
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      
      // Refresh stats if available
      if (onRefreshStats) {
        await onRefreshStats();
      }
      
      toast({
        title: 'File Deleted',
        description: 'Audio file has been successfully deleted.',
      });
    } catch (err) {
      console.error('Failed to delete audio file:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete the audio file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteFileId(null);
    }
  };

  return {
    files,
    loading,
    error,
    audioPlaying,
    deleteFileId,
    currentPage,
    totalPages,
    setDeleteFileId,
    handlePlayPause,
    handleDeleteFile,
    fetchHistory,
    loadMore,
    hasMore: currentPage < totalPages
  };
};
