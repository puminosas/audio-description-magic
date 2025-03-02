
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import AudioPlayer from "@/components/ui/AudioPlayer";
import { Trash2, Download } from 'lucide-react';

interface AudioFile {
  id: string;
  title: string;
  description?: string;
  language: string;
  voice_name: string;
  created_at: string;
  audio_url: string;
}

interface AudioFilesTableProps {
  audioFiles: AudioFile[];
  onDelete: (id: string) => Promise<void>;
}

const AudioFilesTable = ({ audioFiles, onDelete }: AudioFilesTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Voice</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Audio</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {audioFiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No audio files found
              </TableCell>
            </TableRow>
          ) : (
            audioFiles.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">
                  {file.title}
                </TableCell>
                <TableCell>{file.language}</TableCell>
                <TableCell>{file.voice_name}</TableCell>
                <TableCell>
                  {new Date(file.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <AudioPlayer
                    audioUrl={file.audio_url}
                    fileName={file.title}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onDelete(file.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(file.audio_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AudioFilesTable;
