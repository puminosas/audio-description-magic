
import { useState } from 'react';
import { Play, Pause, Download, Trash2, Clock, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface AudioHistoryItemProps {
  id?: string;
  audioUrl: string;
  title: string;
  description?: string;
  createdAt: string | Date;
  language?: string;
  voiceName: string;
  duration?: number;
  showControls?: boolean;
  onDelete?: (id: string) => void;
}

const AudioHistoryItem = ({
  id,
  title,
  description = '',
  createdAt,
  audioUrl,
  language = '',
  voiceName,
  duration = 0,
  showControls = true,
  onDelete
}: AudioHistoryItemProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());
  const { toast } = useToast();
  const createdDate = createdAt instanceof Date ? createdAt : new Date(createdAt);

  const togglePlayPause = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      // Set CORS mode to anonymous for better error handling
      audio.crossOrigin = "anonymous";
      
      // Reset src before setting it again to avoid stale state
      audio.src = '';
      audio.src = audioUrl;
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: 'Error',
          description: 'Could not play audio file. Try downloading instead.',
          variant: 'destructive',
        });
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Listen for audio end
  audio.onended = () => {
    setIsPlaying(false);
  };

  // Listen for audio error
  audio.onerror = () => {
    setIsPlaying(false);
    toast({
      title: 'Error',
      description: 'Failed to play audio. Try downloading the file instead.',
      variant: 'destructive',
    });
  };

  const embedCode = `<iframe 
  src="${window.location.origin}/embed?audio=${encodeURIComponent(audioUrl)}" 
  width="300" 
  height="80" 
  frameborder="0" 
  allow="autoplay"
></iframe>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: 'Success',
      description: 'Embed code copied to clipboard',
    });
  };

  return (
    <div className="glassmorphism rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium truncate">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <Clock size={12} className="mr-1" />
            <span>{formatDistanceToNow(createdDate, { addSuffix: true })}</span>
            {language && (
              <>
                <span className="mx-2">•</span>
                <span>{language}</span>
              </>
            )}
            <span className="mx-2">•</span>
            <span>Voice: {voiceName}</span>
          </div>
        </div>
        
        {showControls && (
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <a href={audioUrl} download={`${title}.mp3`}>
                <Download size={16} />
              </a>
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Code size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h3 className="font-medium">Embed Code</h3>
                  <div className="bg-secondary p-2 rounded-md text-xs overflow-x-auto">
                    <code>{embedCode}</code>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={copyEmbedCode}
                  >
                    Copy Code
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            {onDelete && id && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(id)}
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioHistoryItem;
