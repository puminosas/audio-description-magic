
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Copy, Trash, PlayCircle, PauseCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AudioHistoryItemProps {
  id: string;
  audioUrl: string;
  title: string;
  description?: string;
  createdAt: string | Date | null;
  language?: string;
  voiceName?: string;
  showControls?: boolean;
  onDelete?: (id: string) => void;
  onCopy?: (id: string, url: string) => void;
  isPlaying?: boolean;
  onPlayPause?: (id: string) => void;
}

const AudioHistoryItem: React.FC<AudioHistoryItemProps> = ({
  id,
  audioUrl,
  title,
  description,
  createdAt,
  language,
  voiceName,
  showControls = true,
  onDelete,
  onCopy,
  isPlaying = false,
  onPlayPause
}) => {
  const { toast } = useToast();

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Unknown date';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if dateObj is valid before formatting
      if (Number.isNaN(dateObj.getTime())) {
        return 'Unknown date';
      }
      
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(id, audioUrl);
    } else {
      // Default copy behavior if no handler provided
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
    }
  };

  return (
    <div className="w-full rounded-lg p-4 space-y-3">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex-1">
          <h3 className="text-base font-medium">{title}</h3>
          {description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>}
        </div>
        
        {showControls && (
          <div className="flex items-center gap-2">
            {audioUrl && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onPlayPause && onPlayPause(id)}
                title={isPlaying ? "Pause audio" : "Play audio"}
              >
                {isPlaying ? (
                  <PauseCircle className="h-5 w-5" />
                ) : (
                  <PlayCircle className="h-5 w-5" />
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              title="Copy embed code"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(id)}
                title="Delete audio file"
              >
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
        <span>{formatDate(createdAt)}</span>
        {language && (
          <>
            <span>•</span>
            <Badge variant="outline" className="text-xs">{language}</Badge>
          </>
        )}
        {voiceName && (
          <>
            <span>•</span>
            <Badge variant="outline" className="text-xs">{voiceName}</Badge>
          </>
        )}
      </div>
      
      {audioUrl && (
        <audio controls className="w-full mt-2">
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default AudioHistoryItem;
