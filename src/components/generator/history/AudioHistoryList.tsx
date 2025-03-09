
import React from 'react';
import { User } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AudioHistoryItem from './AudioHistoryItem';

interface FileItem {
  id: string;
  title?: string;
  fileName?: string;
  filePath?: string;
  audioUrl?: string;
  fileType?: string;
  createdAt: Date;
}

interface AudioHistoryListProps {
  files: FileItem[];
  user: User | null;
  audioPlaying: string | null;
  handlePlayPause: (fileId: string) => void;
  handleDeleteFile: (fileId: string) => Promise<void>;
  setDeleteFileId: (id: string) => void;
  copyEmbedCode: (id: string, audioUrl: string) => void;
  formatDate: (date: Date) => string;
}

const AudioHistoryList: React.FC<AudioHistoryListProps> = ({
  files,
  user,
  audioPlaying,
  handlePlayPause,
  handleDeleteFile,
  setDeleteFileId,
  copyEmbedCode,
  formatDate
}) => {
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

      <div className="space-y-4">
        {files.map((file) => (
          <AudioHistoryItem
            key={file.id}
            file={file}
            audioPlaying={audioPlaying}
            handlePlayPause={handlePlayPause}
            handleDeleteFile={handleDeleteFile}
            setDeleteFileId={setDeleteFileId}
            copyEmbedCode={copyEmbedCode}
            formatDate={formatDate}
          />
        ))}
      </div>

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

export default AudioHistoryList;
