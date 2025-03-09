
import React, { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAudioHistory } from './hooks/useAudioHistory';
import { useHistoryUtils } from './history/HistoryUtils';
import AudioHistoryList from './history/AudioHistoryList';
import EmptyHistoryState from './history/EmptyHistoryState';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HistoryTabProps {
  user: User | null;
  onRefreshStats?: () => Promise<void>;
}

const HistoryTab = ({ user, onRefreshStats }: HistoryTabProps) => {
  const {
    files,
    loading,
    error,
    audioPlaying,
    deleteFileId,
    setDeleteFileId,
    handlePlayPause,
    handleDeleteFile,
    fetchHistory
  } = useAudioHistory(user, onRefreshStats);

  const { formatDate, copyEmbedCode } = useHistoryUtils();

  // Re-fetch on mount or user change
  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, fetchHistory]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}. <button className="underline" onClick={fetchHistory}>Try again</button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {files.length > 0 ? (
        <AudioHistoryList
          files={files}
          user={user}
          audioPlaying={audioPlaying}
          handlePlayPause={handlePlayPause}
          handleDeleteFile={handleDeleteFile}
          setDeleteFileId={setDeleteFileId}
          copyEmbedCode={copyEmbedCode}
          formatDate={formatDate}
        />
      ) : (
        <EmptyHistoryState isLoggedIn={!!user} />
      )}
    </div>
  );
};

export default HistoryTab;
