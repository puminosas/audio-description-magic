
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  hasUser: boolean;
  hasText: boolean;
}

const GenerateButton = ({ 
  onClick,
  isDisabled,
  isLoading,
  hasUser,
  hasText
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
            : "Convert to Audio"}
    </Button>
  );
};

export default GenerateButton;
