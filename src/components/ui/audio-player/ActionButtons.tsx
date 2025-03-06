
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  ExternalLink, 
  Share, 
  Code,
  Check,
  ClipboardCopy
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ActionButtonsProps {
  fileName: string;
  audioUrl?: string;
  isGenerating?: boolean;
  embedCode?: string;
}

const ActionButtons = ({ 
  fileName, 
  audioUrl, 
  isGenerating = false,
  embedCode 
}: ActionButtonsProps) => {
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  if (isGenerating || !audioUrl) return null;
  
  const handleDownload = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const generateEmbedCode = (): string => {
    // Create standard HTML5 audio element embed code
    return `<audio controls>
  <source src="${audioUrl}" type="audio/mpeg">
  Your browser does not support the audio element.
</audio>`;
  };
  
  const copyEmbedCode = () => {
    const code = generateEmbedCode();
    navigator.clipboard.writeText(code);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };
  
  const copyAudioUrl = () => {
    if (!audioUrl) return;
    navigator.clipboard.writeText(audioUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };
  
  return (
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
      <div className="flex items-center gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download audio</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                  >
                    <Code className="h-4 w-4" />
                    <span className="sr-only">Embed code</span>
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get embed code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Embed this audio</h3>
              <div className="bg-muted/50 p-2 rounded-md text-xs font-mono overflow-x-auto whitespace-pre">
                {generateEmbedCode()}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-2 gap-2 h-8"
                onClick={copyEmbedCode}
              >
                {copiedEmbed ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="h-3.5 w-3.5" />
                    <span>Copy embed code</span>
                  </>
                )}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                  >
                    <Share className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share audio URL</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Audio URL</h3>
              <div className="bg-muted/50 p-2 rounded-md text-xs font-mono overflow-x-auto truncate">
                {audioUrl}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-2 gap-2 h-8"
                onClick={copyAudioUrl}
              >
                {copiedUrl ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="h-3.5 w-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {audioUrl && audioUrl.startsWith('http') && (
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 px-2 text-xs gap-1.5"
          asChild
        >
          <a href={audioUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open in new tab</span>
          </a>
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
