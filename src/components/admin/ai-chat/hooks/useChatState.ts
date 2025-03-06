
import { useState } from 'react';

interface Message {
  text: string;
  isUser: boolean;
  id?: string;
}

export const useChatState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    setIsLoading,
    error,
    setError
  };
};
