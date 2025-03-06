
import React from 'react';
import { Download, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface ActionButtonsProps {
  isGenerating: boolean;
  audioUrl?: string;
  fileName: string;
  embedCode: string;
}

const ActionButtons = ({
  isGenerating,
  audioUrl,
  fileName,
  embedCode
}: ActionButtonsProps) => {
  const { toast } = useToast();

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: 'Success',
      description: 'Embed code copied to clipboard.',
    });
  };

  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="icon"
        disabled={isGenerating || !audioUrl}
        asChild={!!audioUrl}
      >
        {audioUrl ? (
          <a href={audioUrl} download={fileName}>
            <Download size={18} />
          </a>
        ) : (
          <span>
            <Download size={18} />
          </span>
        )}
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            disabled={isGenerating || !audioUrl}
          >
            <Code size={18} />
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
    </div>
  );
};

export default ActionButtons;
