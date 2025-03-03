
import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex max-w-[85%] items-center rounded-lg bg-muted px-4 py-3">
        <div className="mr-2 flex space-x-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{animationDelay: '0ms'}}></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{animationDelay: '300ms'}}></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{animationDelay: '600ms'}}></div>
        </div>
        <span className="text-sm text-muted-foreground">AI is thinking...</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
