
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Download, Code, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

interface FileItem {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  createdAt: Date;
  audioUrl?: string;
}

interface AudioHistoryItemProps {
  file: FileItem;
  audioPlaying: string | null;
  handlePlayPause: (audioUrl: string) => void;
  handleDeleteFile: () => void;
  setDeleteFileId: (id: string) => void;
  copyEmbedCode: (id: string, audioUrl: string) => void;
  formatDate: (date: Date) => string;
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
      <div className="mb-3 sm:mb-0 flex-1 min-w-0">
        <h4 className="font-medium">{file.fileName}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10">Audio</span>
          <span className="text-xs text-muted-foreground">{formatDate(file.createdAt)}</span>
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setDeleteFileId(file.id)}>
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
              <AlertDialogAction onClick={handleDeleteFile}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AudioHistoryItem;
