
import { useState } from 'react';
import { Message, TypingStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useMessageHandling = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [typingStatus, setTypingStatus] = useState<TypingStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string, customMessages?: Message[]) => {
    if (!content.trim() || isProcessing) return;
    
    const userMessage: Message = { 
      role: 'user', 
      content, 
      id: uuidv4(), 
      createdAt: new Date().toISOString() 
    };
    
    const messagesToSend = customMessages || [...messages, userMessage];
    
    if (!customMessages) {
      setMessages(messagesToSend);
    }
    
    setIsProcessing(true);
    setTypingStatus('typing');
    setError(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesToSend }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      };
      
      setMessages(customMessages 
        ? [userMessage, assistantMessage] 
        : [...messagesToSend, assistantMessage]
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setTypingStatus('idle');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
      setInput('');
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const addSystemMessage = (content: string) => {
    const systemMessage: Message = {
      role: 'system',
      content,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setMessages([...messages, systemMessage]);
  };

  const addMessage = (message: Message) => {
    setMessages([...messages, message]);
  };

  const retryLastMessage = () => {
    if (messages.length > 0) {
      const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
      if (lastUserMessageIndex !== -1) {
        const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex];
        // Remove messages after the last user message
        setMessages(messages.slice(0, messages.length - lastUserMessageIndex));
        // Resend the last user message
        sendMessage(lastUserMessage.content);
      }
    }
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isProcessing,
    typingStatus,
    error,
    sendMessage,
    handleKeyDown,
    handleClearChat,
    retryLastMessage,
    addSystemMessage,
    addMessage,
    setChatError: setError,
    setIsTyping: setTypingStatus
  };
};

export default useMessageHandling;
