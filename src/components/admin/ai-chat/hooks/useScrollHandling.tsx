
import { useRef, useEffect } from 'react';
import { Message } from '../types';

export const useScrollHandling = (messages: Message[], isTyping?: boolean) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return { messagesEndRef, scrollToBottom };
};
