
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message } from '../types';

export const useChatLogic = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send a message to the AI
  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setIsProcessing(true);
    setError(null);

    try {
      console.log('Sending message to AI...');
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          messages: updatedMessages,
          userId: user?.id
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
      setMessages([...updatedMessages, data as Message]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Failed to get response from AI: ${error.message}`);
      toast({
        title: 'Error',
        description: 'Failed to get response from AI',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear the chat
  const handleClearChat = () => {
    setMessages([]);
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
    messages,
    isProcessing,
    error,
    messagesEndRef,
    sendMessage,
    handleKeyDown,
    handleClearChat
  };
};
