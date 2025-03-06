
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DescriptionInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  isLoading?: boolean;
}

const DescriptionInput = ({ 
  value, 
  onChange, 
  placeholder = "Enter product name or description", 
  isLoading = false
}: DescriptionInputProps) => {
  // Determine input type based on length
  const isShortInput = value.length < 20;
  const isOptimalLength = value.length > 0 && value.length <= 1000;
  const isLongInput = value.length > 1000;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">
          Product Name or Description
        </label>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                <span>How it works</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Short input (under 20 chars) will trigger AI enhancement to generate a complete product description.
                Longer text will be used as-is without modification.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`min-h-32 resize-y ${isLoading ? 'opacity-50' : ''}`}
        maxLength={2000}
        disabled={isLoading}
      />
      
      <div className="flex justify-between text-xs">
        <span 
          className={`${isShortInput ? 'text-amber-500 dark:text-amber-400' : isLongInput ? 'text-orange-500 dark:text-orange-400' : 'text-muted-foreground'}`}
        >
          {isShortInput 
            ? "AI will generate an enhanced description from this short input"
            : isLongInput
              ? "Consider shortening your description for optimal audio length"
              : "Your description will be used directly for audio generation"}
        </span>
        <span className={`${isLongInput ? 'text-orange-500 dark:text-orange-400' : 'text-muted-foreground'}`}>
          {value.length}/2000
        </span>
      </div>
    </div>
  );
};

export default DescriptionInput;
