
import React from 'react';
import { Info } from 'lucide-react';

const EmptyChat: React.FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-4">
      <Info className="mb-3 h-12 w-12 opacity-50" />
      <h3 className="mb-2 text-lg font-medium">AI Assistant</h3>
      <p className="max-w-md text-sm">
        Ask me anything about your project, users, or administrative tasks.
        I can help with troubleshooting, data analysis, and task automation.
      </p>
    </div>
  );
};

export default EmptyChat;
