
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { getAudioHistory, deleteAudioFile } from '@/utils/audio/historyService';
import { useToast } from '@/hooks/use-toast';

export const useAudioHistory = (user: User | null, onRefreshStats?: () => Promise<void>) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setFiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const historyItems = await getAudioHistory();
      // Normalize the data structure for each file item
      const normalizedFiles = historyItems.map((item: any) => ({
        id: item.id,
        title: item.title || '',
        fileName: item.title || 'Untitled Audio', // Use title as fileName if available
        audioUrl: item.audio_url || '',
        createdAt: new Date(item.created_at),
        fileType: 'audio'
      }));
      
      setFiles(normalizedFiles);
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
  }, [user, toast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
    setDeleteFileId,
    handlePlayPause,
    handleDeleteFile,
    fetchHistory
  };
};
