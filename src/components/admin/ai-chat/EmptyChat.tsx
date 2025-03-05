import React from 'react';
import { Bot } from 'lucide-react';

const EmptyChat: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-primary/10 p-4 rounded-full">
        <Bot className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-medium">How can I help you today?</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Ask me anything about your project, code, or how to use specific features.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-2">
        <SuggestedPrompt text="How can I get started with audio descriptions?" />
        <SuggestedPrompt text="Show me the most popular features" />
        <SuggestedPrompt text="Help me debug an issue with my code" />
        <SuggestedPrompt text="Give me tips for optimizing performance" />
      </div>
    </div>
  );
};

interface SuggestedPromptProps {
  text: string;
}

const SuggestedPrompt: React.FC<SuggestedPromptProps> = ({ text }) => {
  return (
    <button className="bg-accent/50 hover:bg-accent px-4 py-2 rounded-lg text-sm text-left">
      {text}
    </button>
  );
};

export default EmptyChat;
