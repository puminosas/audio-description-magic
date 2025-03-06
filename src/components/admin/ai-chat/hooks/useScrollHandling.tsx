
import { useRef, useCallback, useEffect } from 'react';
import { Message } from '../types';

export const useScrollHandling = (messages: Message[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return {
    messagesEndRef,
    scrollToBottom
  };
};
