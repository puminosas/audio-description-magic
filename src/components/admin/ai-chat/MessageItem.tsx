import React from 'react';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface MessageItemProps {
  message: {
    role: string;
    content: string;
  };
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg",
        isUser ? "bg-primary/10" : "bg-muted"
      )}
    >
      <div className="flex-shrink-0">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary"
        )}>
          {isUser ? (
            <User className="h-5 w-5" />
          ) : (
            <Bot className="h-5 w-5" />
          )}
        </div>
      </div>
      <div className="flex-1">
        <div className="font-semibold">
          {isUser ? 'You' : 'AI Assistant'}
        </div>
        <div className="whitespace-pre-wrap text-sm mt-1">
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
