
import React, { RefObject } from 'react';
import { Loader2, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message, TypingStatus } from './types';

interface ChatMessagesProps {
  messages: Message[];
  isProcessing: boolean;
  typingStatus: TypingStatus;
  messagesEndRef: RefObject<HTMLDivElement>;
  error: string | null;
  retryLastMessage: () => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isProcessing, 
  typingStatus,
  messagesEndRef,
  error,
  retryLastMessage
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
          <Info className="mb-2 h-12 w-12 opacity-50" />
          <h3 className="mb-1 text-lg font-medium">AI Assistant</h3>
          <p className="max-w-md text-sm">
            Ask me anything about your project, users, or administrative tasks.
            I can help with troubleshooting, data analysis, and task automation.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pb-4">
          {messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                {msg.createdAt && (
                  <div className="mt-1 text-right text-xs opacity-50">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {/* Typing indicator */}
          {typingStatus === 'processing' && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] items-center rounded-lg bg-muted px-4 py-2">
                <div className="mr-2 flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{animationDelay: '0ms'}}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{animationDelay: '300ms'}}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{animationDelay: '600ms'}}></div>
                </div>
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          )}
          
          {/* Error message with retry option */}
          {typingStatus === 'error' && error && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-destructive/10 px-4 py-2 text-destructive">
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
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
