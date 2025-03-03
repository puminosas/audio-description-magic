
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message, TypingStatus, ChatSession } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useChatLogic = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [typingStatus, setTypingStatus] = useState<TypingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load chat sessions from Supabase
  useEffect(() => {
    if (!user) return;
    
    const loadChatSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        setChatSessions(data || []);
      } catch (error) {
        console.error('Error loading chat sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat history',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingSessions(false);
      }
    };
    
    loadChatSessions();
  }, [user, toast]);

  // Save chat history to Supabase
  const saveChatHistory = async () => {
    if (!user || messages.length === 0) return;
    
    try {
      let sessionId = currentSession;
      
      // Create a new session if none exists
      if (!sessionId) {
        sessionId = uuidv4();
        setCurrentSession(sessionId);
        
        // Generate a title from the first user message
        const firstUserMessage = messages.find(m => m.role === 'user');
        const title = firstUserMessage 
          ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
          : 'New Chat';
        
        // Create a new chat session
        const { error: insertError } = await supabase
          .from('chat_sessions')
          .insert({
            id: sessionId,
            user_id: user.id,
            title,
            messages: JSON.stringify(messages),
          });
        
        if (insertError) throw insertError;
        
        // Update local state
        setChatSessions(prev => [{
          id: sessionId,
          title,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages
        }, ...prev]);
        
      } else {
        // Update existing session
        const { error: updateError } = await supabase
          .from('chat_sessions')
          .update({
            messages: JSON.stringify(messages),
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);
        
        if (updateError) throw updateError;
        
        // Update local state
        setChatSessions(prev => 
          prev.map(session => 
            session.id === sessionId 
              ? { ...session, messages, updatedAt: new Date().toISOString() }
              : session
          )
        );
      }
      
      console.log('Chat history saved successfully');
    } catch (error) {
      console.error('Error saving chat history:', error);
      // Don't show toast for silent background save
    }
  };

  // Load a specific chat session
  const loadChatSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('messages')
        .eq('id', sessionId)
        .single();
      
      if (error) throw error;
      
      if (data && data.messages) {
        setMessages(JSON.parse(data.messages));
        setCurrentSession(sessionId);
      }
    } catch (error) {
      console.error('Error loading chat session:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat session',
        variant: 'destructive',
      });
    }
  };

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
      
      // Create assistant message
      const assistantMessage: Message = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      };
      
      // Update messages with AI response
      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);
      
      // Save chat history after receiving AI response
      setTimeout(() => {
        saveChatHistory();
      }, 500);
      
      setTypingStatus('idle');
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Failed to get response from AI: ${error.message}`);
      setTypingStatus('error');
      toast({
        title: 'Error',
        description: 'Failed to get response from AI',
        variant: 'destructive',
      });
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

  // Start a new chat session
  const startNewChat = () => {
    setMessages([]);
    setCurrentSession(null);
    setError(null);
    setTypingStatus('idle');
    setInput('');
    toast({
      title: 'New Chat',
      description: 'Started a new chat session',
    });
  };

  // Clear the chat
  const handleClearChat = () => {
    setMessages([]);
    setCurrentSession(null);
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
    messages,
    isProcessing,
    typingStatus,
    error,
    messagesEndRef,
    chatSessions,
    isLoadingSessions,
    currentSession,
    sendMessage,
    handleKeyDown,
    handleClearChat,
    retryLastMessage,
    loadChatSession,
    startNewChat
  };
};
