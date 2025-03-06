
import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getOrCreateGuestSessionId, convertTemporaryFilesToUserFiles } from '@/utils/fileStorageService';
import { deleteAudioFile } from '@/utils/audio/historyService';

// Cast the Supabase client to any to bypass TypeScript checking
// This is needed because our Database type doesn't include all tables we're using
const db = supabase as any;

export interface FileItem {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  createdAt: Date;
  audioUrl?: string;
}

export const useAudioHistory = (user: User | null, onRefreshStats?: () => Promise<void>) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const { toast } = useToast();
  const audioRef = useRef(new Audio());

  useEffect(() => {
    loadUserFiles();

    // If a user just logged in, convert any temporary files
    if (user) {
      const sessionId = getOrCreateGuestSessionId();
      convertTemporaryFilesToUserFiles(user.id, sessionId)
        .then(success => {
          if (success) {
            console.log('Temporary files converted successfully');
            loadUserFiles(); // Reload after conversion
          }
        });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [user]);

  const loadUserFiles = async () => {
    setLoading(true);
    try {
      let fileItems: FileItem[] = [];

      if (user) {
        // Fetch files for logged-in user
        const { data, error } = await db
          .from('audio_files')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          fileItems = data.map(item => ({
            id: item.id,
            fileName: item.title,
            filePath: item.audio_url,
            fileType: 'audio/mpeg',
            createdAt: new Date(item.created_at),
            audioUrl: getAudioUrl(item.audio_url),
          }));
        }
      } else {
        // Fetch temporary files for guest session
        const sessionId = getOrCreateGuestSessionId();
        const { data, error } = await db
          .from('audio_files')
          .select('*')
          .eq('session_id', sessionId)
          .eq('is_temporary', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          fileItems = data.map(item => ({
            id: item.id,
            fileName: item.title,
            filePath: item.audio_url,
            fileType: 'audio/mpeg',
            createdAt: new Date(item.created_at),
            audioUrl: getAudioUrl(item.audio_url),
          }));
        }
      }

      setFiles(fileItems);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your audio files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getAudioUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('user_files')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  const handlePlayPause = (audioUrl: string) => {
    if (audioPlaying === audioUrl) {
      // Pause currently playing audio
      audioRef.current.pause();
      setAudioPlaying(null);
    } else {
      // Stop any currently playing audio
      audioRef.current.pause();
      
      // Play new audio
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: 'Error',
          description: 'Failed to play audio file',
          variant: 'destructive',
        });
      });
      
      // Set the playing state
      setAudioPlaying(audioUrl);
      
      // Add ended event listener
      audioRef.current.onended = () => {
        setAudioPlaying(null);
      };
    }
  };

  const handleDeleteFile = async () => {
    if (!deleteFileId) return;
    
    try {
      const result = await deleteAudioFile(deleteFileId);
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }
      
      toast({
        title: 'Success',
        description: 'Audio file deleted successfully',
      });
      
      // Refresh the file list
      loadUserFiles();
      
      // Call the onRefreshStats callback if provided
      if (onRefreshStats) {
        await onRefreshStats();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete audio file',
        variant: 'destructive',
      });
    } finally {
      setDeleteFileId(null);
    }
  };

  return {
    files,
    loading,
    audioPlaying,
    deleteFileId,
    setDeleteFileId,
    handlePlayPause,
    handleDeleteFile,
    loadUserFiles
  };
};
