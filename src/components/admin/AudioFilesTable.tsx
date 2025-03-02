
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
import { Trash2, Download, Info } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AudioFile {
  id: string;
  title: string;
  description?: string;
  language: string;
  voice_name: string;
  created_at: string;
  audio_url: string;
  user_id?: string | null;
}

interface AudioFilesTableProps {
  audioFiles: AudioFile[];
  onDelete: (id: string) => Promise<void>;
}

const AudioFilesTable = ({ audioFiles, onDelete }: AudioFilesTableProps) => {
  // Function to format date in a more readable way
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Helper function to safely handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this audio file? This action cannot be undone.')) {
      await onDelete(id);
    }
  };

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
                  <div className="flex flex-col">
                    <span>{file.title}</span>
                    {file.description && (
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {file.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {file.language || <Badge variant="outline">Unknown</Badge>}
                </TableCell>
                <TableCell>{file.voice_name || <Badge variant="outline">Unknown</Badge>}</TableCell>
                <TableCell>
                  {file.created_at ? formatDate(file.created_at) : 'Unknown date'}
                </TableCell>
                <TableCell>
                  {file.audio_url ? (
                    <AudioPlayer
                      audioUrl={file.audio_url}
                      fileName={file.title}
                    />
                  ) : (
                    <Badge variant="outline">No audio available</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(file.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete audio file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {file.audio_url && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(file.audio_url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download audio file</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              // Show file details in a nicer format
                              alert(
                                `ID: ${file.id}\n` +
                                `User ID: ${file.user_id || 'None'}\n` +
                                `Title: ${file.title}\n` +
                                `Description: ${file.description || 'None'}\n` +
                                `Language: ${file.language}\n` +
                                `Voice: ${file.voice_name}\n` +
                                `Created: ${file.created_at ? formatDate(file.created_at) : 'Unknown'}`
                              );
                            }}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>File details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
