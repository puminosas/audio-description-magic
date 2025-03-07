
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  hasUser: boolean;
  hasText: boolean;
  buttonText?: string;
}

const GenerateButton = ({ 
  onClick,
  isDisabled,
  isLoading,
  hasUser,
  hasText,
  buttonText = "Convert to Audio"
}: GenerateButtonProps) => {
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
        : !hasUser 
          ? "Sign in to Generate" 
          : !hasText 
            ? "Enter text first" 
            : buttonText}
    </Button>
  );
};

export default GenerateButton;
