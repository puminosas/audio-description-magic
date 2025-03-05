
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { Message, ChatSession } from '../types';
import { supabaseTyped } from '@/utils/supabase/typedClient';

export const useChatSessions = (
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  userId?: string | null
) => {
  const { toast } = useToast();
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Load chat sessions from Supabase
  useEffect(() => {
    if (!userId) return;
    
    const loadChatSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const { data, error } = await supabaseTyped.custom
          .from('chat_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform data to match ChatSession type
        const formattedSessions = data.map(session => ({
          id: session.id,
          title: session.title,
          createdAt: session.created_at,
          updatedAt: session.updated_at,
          messages: Array.isArray(session.messages) ? session.messages : JSON.parse(session.messages)
        }));
        
        setChatSessions(formattedSessions);
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
  }, [userId, toast]);

  // Save chat history to Supabase
  const saveChatHistory = async () => {
    if (!userId || messages.length === 0) return;
    
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
        const { error: insertError } = await supabaseTyped.custom
          .from('chat_sessions')
          .insert({
            id: sessionId,
            user_id: userId,
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
        const { error: updateError } = await supabaseTyped.custom
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
      const { data, error } = await supabaseTyped.custom
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (error) throw error;
      
      if (data && data.messages) {
        // Parse messages if they're stored as a string
        const parsedMessages = typeof data.messages === 'string' 
          ? JSON.parse(data.messages) 
          : data.messages;
          
        setMessages(parsedMessages);
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

  // Delete a chat session
  const deleteChatSession = async (sessionId: string) => {
    try {
      const { error } = await supabaseTyped.custom
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
      
      // Update local state
      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
      
      // If the current session was deleted, start a new one
      if (currentSession === sessionId) {
        setMessages([]);
        setCurrentSession(null);
      }
      
      toast({
        title: 'Success',
        description: 'Chat session deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting chat session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete chat session',
        variant: 'destructive',
      });
    }
  };

  // Start a new chat session
  const startNewChat = () => {
    setMessages([]);
    setCurrentSession(null);
    toast({
      title: 'New Chat',
      description: 'Started a new chat session',
    });
  };

  return {
    chatSessions,
    isLoadingSessions,
    currentSession,
    saveChatHistory,
    loadChatSession,
    startNewChat,
    deleteChatSession
  };
};
