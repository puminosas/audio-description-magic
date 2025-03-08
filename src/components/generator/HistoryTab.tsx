
import React, { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { useAudioHistory } from './hooks/useAudioHistory';
import { useHistoryUtils } from './history/HistoryUtils';
import AudioHistoryList from './history/AudioHistoryList';
import EmptyHistoryState from './history/EmptyHistoryState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
    hasMore,
    setDeleteFileId,
    handlePlayPause,
    handleDeleteFile,
    fetchHistory,
    loadMore
  } = useAudioHistory(user, onRefreshStats);

  const { formatDate, copyEmbedCode } = useHistoryUtils();

  // Re-fetch on mount or user change
  useEffect(() => {
    if (user) {
      fetchHistory(1);
    }
  }, [user, fetchHistory]);

  if (loading && files.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && files.length === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}. <button className="underline" onClick={() => fetchHistory(1)}>Try again</button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {files.length > 0 ? (
        <>
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
          
          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button 
                variant="outline" 
                onClick={loadMore} 
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Load More
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyHistoryState isLoggedIn={!!user} />
      )}
      
      {/* Error while loading more */}
      {error && files.length > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. <button className="underline" onClick={loadMore}>Try again</button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default HistoryTab;
