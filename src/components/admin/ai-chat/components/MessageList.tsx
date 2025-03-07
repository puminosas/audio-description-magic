
import React, { useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { ChatMessage } from './ChatInterface';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, error }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Determine message time display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto px-1 py-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Start a conversation or select a file to analyze.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUserMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.isUserMessage ? 'order-1' : 'order-2'}`}>
                <div 
                  className={`flex gap-3 ${message.isUserMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!message.isUserMessage && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/lovable-uploads/24d92d37-4470-4427-a02c-349aa3e574de.png" alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div 
                      className={`rounded-lg p-3 ${
                        message.isUserMessage 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    </div>
                    <div 
                      className={`text-xs text-muted-foreground mt-1 ${
                        message.isUserMessage ? 'text-right' : 'text-left'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 max-w-[85%] flex items-center">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;
