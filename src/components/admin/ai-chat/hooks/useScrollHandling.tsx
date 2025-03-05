
import { useEffect } from 'react';

export const useScrollHandling = (messagesEndRef: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    scrollToBottom();
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return { scrollToBottom };
};

export default useScrollHandling;
