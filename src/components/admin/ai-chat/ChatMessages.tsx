import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Loader } from 'lucide-react';
import MessageItem from './MessageItem';
import EmptyChat from './EmptyChat';
import TypingIndicator from './TypingIndicator';

interface ChatMessagesProps {
  messages: any[];
  isLoading: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <EmptyChat />
      ) : (
        messages.map((message, index) => (
          <MessageItem 
            key={index}
            message={message}
          />
        ))
      )}
      {isLoading && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // This will adjust the height of the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    
    try {
      // Here you would send the message to your API or state management
      console.log('Sending message:', message);
      
      // Placeholder for your actual send logic
      // await sendMessage(message);
      
      // Clear the input after sending
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <Textarea
        ref={textareaRef}
        placeholder="Ask a question or request help..."
        className="min-h-[60px] flex-1 resize-none"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      <Button
        className="h-10 w-10 rounded-full p-0 flex-shrink-0"
        onClick={handleSendMessage}
        disabled={!message.trim() || isLoading}
      >
        {isLoading ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <SendHorizonal className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default ChatInput;
export default ChatMessages;
