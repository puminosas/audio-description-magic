
import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import EmptyChat from './EmptyChat';
import TypingIndicator from './TypingIndicator';

interface ChatMessagesProps {
  messages: any[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isTyping, messagesEndRef }) => {
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
