
import React from 'react';
import { Message } from './types';
import { formatDistanceToNow } from 'date-fns';

interface MessageItemProps {
  message: Message;
  isLast: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isLast }) => {
  // Parse code blocks if any
  const renderContent = () => {
    if (!message.content) return null;

    // Check if the message contains code blocks with ```
    if (message.content.includes('```')) {
      const parts = message.content.split(/```([\s\S]*?)```/);
      return parts.map((part, index) => {
        // Even indices are regular text, odd indices are code blocks
        if (index % 2 === 0) {
          return part ? <p key={`text-${index}`} className="whitespace-pre-wrap">{part}</p> : null;
        } else {
          return (
            <pre key={`code-${index}`} className="my-2 overflow-x-auto rounded-md bg-muted p-2 text-xs">
              <code>{part}</code>
            </pre>
          );
        }
      });
    }

    // Regular message without code blocks
    return <p className="whitespace-pre-wrap">{message.content}</p>;
  };

  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      } ${isLast ? 'mb-4' : 'mb-3'}`}
      data-message-role={message.role}
    >
      <div
        className={`max-w-[85%] rounded-lg px-4 py-2 ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : message.role === 'system' 
              ? 'bg-secondary/80' 
              : 'bg-muted'
        }`}
      >
        {renderContent()}
        {message.createdAt && (
          <div className="mt-1 text-right text-xs opacity-50">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MessageItem);
