
import React from 'react';
import { User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { useAudioHistory } from './hooks/useAudioHistory';
import { useHistoryUtils } from './history/HistoryUtils';
import AudioHistoryList from './history/AudioHistoryList';
import EmptyHistoryState from './history/EmptyHistoryState';

interface HistoryTabProps {
  user: User | null;
  onRefreshStats?: () => Promise<void>;
}

const HistoryTab = ({ user, onRefreshStats }: HistoryTabProps) => {
  const {
    files,
    loading,
    audioPlaying,
    deleteFileId,
    setDeleteFileId,
    handlePlayPause,
    handleDeleteFile
  } = useAudioHistory(user, onRefreshStats);

  const { formatDate, copyEmbedCode } = useHistoryUtils();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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
