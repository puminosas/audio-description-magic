
import React, { useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from '../types';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, error }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-grow pr-4">
      <div className="flex flex-col space-y-4 p-2">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start ${message.isUserMessage ? 'justify-end' : 'justify-start'}`}>
            {!message.isUserMessage && (
              <Avatar className="w-8 h-8 mr-3 mt-1">
                <AvatarImage src="/lovable-uploads/24d92d37-4470-4427-a02c-349aa3e574de.png" alt="AI Avatar" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}
            <div className={`rounded-lg p-3 text-sm max-w-[80%] ${
              message.isUserMessage 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary'
            }`}>
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
              <div className="text-xs text-muted-foreground mt-1">{new Date(message.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start justify-start">
            <Avatar className="w-8 h-8 mr-3 mt-1">
              <AvatarImage src="/lovable-uploads/24d92d37-4470-4427-a02c-349aa3e574de.png" alt="AI Avatar" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className="rounded-lg p-3 text-sm bg-secondary animate-pulse">
              Thinking...
            </div>
          </div>
        )}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 text-destructive rounded-md my-2">
            Error: {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;
