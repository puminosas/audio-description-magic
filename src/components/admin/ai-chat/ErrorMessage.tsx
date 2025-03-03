
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  error: string;
  retryLastMessage: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, retryLastMessage }) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%] rounded-lg bg-destructive/10 px-4 py-3 text-destructive">
        <div className="mb-2 flex items-center">
          <AlertCircle className="mr-2 h-4 w-4" />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-sm">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={retryLastMessage}
        >
          Retry message
        </Button>
      </div>
    </div>
  );
};

export default ErrorMessage;
