import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-muted">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary">
          <Bot className="h-5 w-5" />
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
        </div>
        <span className="ml-2 text-sm text-muted-foreground">AI is thinking...</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
