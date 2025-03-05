
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import EmptyChat from './EmptyChat';
import ErrorMessage from './ErrorMessage';

interface ChatInterfaceProps {
  messages: any[];
  isTyping: boolean;
  chatError: string | null;
  sendMessage: (message: string) => void;
  retryLastMessage: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isTyping,
  chatError,
  sendMessage,
  retryLastMessage,
  messagesEndRef,
  isLoading
}) => {
  return (
    <Card className="flex-1 overflow-hidden">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <EmptyChat />
          ) : (
            <ChatMessages 
              messages={messages} 
              isTyping={isTyping} 
              messagesEndRef={messagesEndRef} 
            />
          )}
          
          {chatError && (
            <ErrorMessage 
              error={chatError} 
              retryLastMessage={retryLastMessage} 
            />
          )}
        </div>
        
        <div className="p-4 border-t">
          <ChatInput 
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
