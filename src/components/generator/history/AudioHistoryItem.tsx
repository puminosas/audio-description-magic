
import React from 'react';
import AudioHistoryItemUI from '@/components/ui/AudioHistoryItem';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface FileItem {
  id: string;
  title?: string; 
  description?: string;
  fileName?: string;
  filePath?: string;
  fileType?: string;
  createdAt: Date;
  audioUrl?: string;
  voice_name?: string;
  language?: string;
}

interface AudioHistoryItemProps {
  file: FileItem;
  audioPlaying: string | null;
  handlePlayPause: (fileId: string) => void;
  handleDeleteFile: (fileId: string) => Promise<void>;
  setDeleteFileId: (id: string) => void;
  copyEmbedCode: (id: string, audioUrl: string) => void;
  formatDate: (date: Date | string | null | undefined) => string;
}

const AudioHistoryItem: React.FC<AudioHistoryItemProps> = ({
  file,
  audioPlaying,
  handlePlayPause,
  handleDeleteFile,
  setDeleteFileId,
  copyEmbedCode,
  formatDate
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md bg-muted/30">
      <AudioHistoryItemUI
        id={file.id}
        audioUrl={file.audioUrl || ''}
        title={file.title || file.fileName || 'Untitled Audio'}
        description={file.description || ''}
        createdAt={file.createdAt}
        language={file.language || ''}
        voiceName={file.voice_name || 'Default'}
        showControls={true}
        onDelete={(id) => {
          setDeleteFileId(id);
        }}
      />
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-2 hidden">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Audio File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this audio file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteFileId('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteFile(file.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AudioHistoryItem;
