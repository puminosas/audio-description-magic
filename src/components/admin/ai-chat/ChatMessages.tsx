
import React, { RefObject } from 'react';
import { Loader2, Info } from 'lucide-react';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isProcessing: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isProcessing, 
  messagesEndRef 
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
              key={index}
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
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
