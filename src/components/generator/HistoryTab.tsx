
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getOrCreateGuestSessionId, convertTemporaryFilesToUserFiles } from '@/utils/fileStorageService';
import { Loader2, FileAudio, Play, Download, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileItem {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  createdAt: Date;
  audioUrl?: string;
}

interface HistoryTabProps {
  user: User | null;
}

const HistoryTab = ({ user }: HistoryTabProps) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);
  const { toast } = useToast();
  const audioRef = React.useRef(new Audio());

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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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

  const copyEmbedCode = (id: string, audioUrl: string) => {
    const embedCode = `<audio id="audiodesc-${id}" controls><source src="${audioUrl}" type="audio/mpeg">Your browser does not support the audio element.</audio>`;
    
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        toast({
          title: 'Copied!',
          description: 'Embed code copied to clipboard',
        });
      })
      .catch(err => {
        console.error('Error copying text:', err);
        toast({
          title: 'Error',
          description: 'Failed to copy embed code',
          variant: 'destructive',
        });
      });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          {user ? 'Your Audio History' : 'Temporary Audio Files'}
        </h3>
        {!user && (
          <div className="flex items-center">
            <span className="text-sm text-amber-500 mr-2">Sign in to save your files permanently</span>
            <Button asChild size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        )}
      </div>

      {files.length > 0 ? (
        <div className="space-y-4">
          {files.map((file) => (
            <div key={file.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md bg-muted/30">
              <div className="mb-3 sm:mb-0 flex-1 min-w-0">
                <h4 className="font-medium">{file.fileName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10">Audio</span>
                  <span className="text-xs text-muted-foreground">{formatDate(file.createdAt)}</span>
                  {!user && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700">Temporary</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => file.audioUrl && handlePlayPause(file.audioUrl)}>
                  {audioPlaying === file.audioUrl ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                {file.audioUrl && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={file.audioUrl} download={`${file.fileName}.mp3`}>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {file.audioUrl && (
                  <Button variant="ghost" size="icon" onClick={() => copyEmbedCode(file.id, file.audioUrl || '')}>
                    <Code className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <FileAudio className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg mb-2">No audio files found</p>
          <p className="mb-6">
            {user ? "You haven't generated any audio descriptions yet." : "Generate your first audio description!"}
          </p>
          <Button>Generate Audio</Button>
        </div>
      )}

      {!user && files.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-4 mt-6">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Note:</strong> These files are only available during your current browser session. 
            Sign in to save them permanently.
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
