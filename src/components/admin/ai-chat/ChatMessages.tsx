
import React, { RefObject, useEffect, useRef } from 'react';
import { VariableSizeList as List } from 'react-window';
import { Message, TypingStatus } from './types';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import ErrorMessage from './ErrorMessage';
import EmptyChat from './EmptyChat';

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
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeMap = useRef<{[key: number]: number}>({});
  
  // Set initial item size
  const setSize = (index: number, size: number) => {
    sizeMap.current = { ...sizeMap.current, [index]: size };
    if (listRef.current) {
      listRef.current.resetAfterIndex(index);
    }
  };

  // Get item size for virtualization
  const getSize = (index: number) => {
    return sizeMap.current[index] || 100; // Default height
  };

  // Reset list when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
      
      // Scroll to bottom after a brief delay
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return <EmptyChat />;
  }

  // Calculate if we need virtualization (only for larger message sets)
  const useVirtualization = messages.length > 20;
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto h-full"
    >
      {useVirtualization ? (
        <List
          ref={listRef}
          height={containerRef.current?.clientHeight || 500}
          width="100%"
          itemCount={messages.length}
          itemSize={getSize}
          layout="vertical"
          overscanCount={5}
        >
          {({ index, style }) => (
            <div style={style}>
              <div 
                ref={el => {
                  if (el) {
                    // Measure and update item size after rendering
                    const height = el.getBoundingClientRect().height;
                    if (height > 0 && height !== getSize(index)) {
                      setSize(index, height);
                    }
                  }
                }}
              >
                <MessageItem 
                  message={messages[index]} 
                  isLast={index === messages.length - 1} 
                />
              </div>
            </div>
          )}
        </List>
      ) : (
        // For smaller message counts, use standard rendering for simplicity
        <div className="space-y-1 pb-4">
          {messages.map((msg, index) => (
            <MessageItem 
              key={msg.id || index} 
              message={msg} 
              isLast={index === messages.length - 1} 
            />
          ))}
        </div>
      )}
      
      {/* Invisible div for scrolling to bottom */}
      <div ref={messagesEndRef} />
      
      {/* Typing indicator */}
      {typingStatus === 'processing' && <TypingIndicator />}
      
      {/* Error message with retry option */}
      {typingStatus === 'error' && error && <ErrorMessage error={error} retryLastMessage={retryLastMessage} />}
    </div>
  );
};

export default ChatMessages;
