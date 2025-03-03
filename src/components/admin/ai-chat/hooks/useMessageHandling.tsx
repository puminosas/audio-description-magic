
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message, TypingStatus } from '../types';

export const useMessageHandling = (
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  userId?: string | null
) => {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [typingStatus, setTypingStatus] = useState<TypingStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Send a message to the AI
  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setIsProcessing(true);
    setTypingStatus('processing');
    setError(null);

    try {
      console.log('Sending message to AI...');
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          messages: updatedMessages,
          userId: userId
        },
      });

      if (error) {
        console.error('Error invoking ai-chat function:', error);
        throw new Error(error.message || 'Failed to get response from AI');
      }

      if (!data || !data.content) {
        console.error('Invalid response from ai-chat function:', data);
        throw new Error('Invalid response from AI');
      }

      console.log('AI response received');
      
      // Create assistant message
      const assistantMessage: Message = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      };
      
      // Update messages with AI response
      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);
      setTypingStatus('idle');
      
      return newMessages;
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Failed to get response from AI: ${error.message}`);
      setTypingStatus('error');
      toast({
        title: 'Error',
        description: 'Failed to get response from AI',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Try sending the message again after an error
  const retryLastMessage = () => {
    if (messages.length > 0) {
      const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
      if (lastUserMessageIndex !== -1) {
        const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex];
        setInput(lastUserMessage.content);
        // Remove the last user message and any subsequent messages
        setMessages(messages.slice(0, messages.length - 1 - lastUserMessageIndex));
        setError(null);
      }
    }
  };

  // Clear the chat
  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    toast({
      title: 'Chat Cleared',
      description: 'All chat messages have been cleared',
    });
  };

  // Handle "Enter" key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
    input,
    setInput,
    isProcessing,
    typingStatus,
    error,
    sendMessage,
    handleKeyDown,
    handleClearChat,
    retryLastMessage
  };
};
