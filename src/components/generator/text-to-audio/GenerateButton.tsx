
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  user: any;
  text: string;
}

const GenerateButton = ({ onClick, isDisabled, isLoading, user, text }: GenerateButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={isDisabled}
      className="gap-1"
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Wand2 size={18} />
      )}
      {isLoading 
        ? "Generating..." 
        : !user 
          ? "Sign in to Generate" 
          : !text.trim() 
            ? "Enter text first" 
            : "Convert to Audio"}
    </Button>
  );
};

export default GenerateButton;
