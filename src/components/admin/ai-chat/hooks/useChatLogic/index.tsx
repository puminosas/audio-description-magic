
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Message, TypingStatus } from '../../types';
import { useMessageHandling } from '../useMessageHandling';
import { useChatSessions } from '../useChatSessions';
import { useScrollHandling } from '../useScrollHandling';
import { useFileAnalysis } from './useFileAnalysis';
import { ChatLogicReturn } from './types';

export const useChatLogic = (): ChatLogicReturn => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [typingStatus, setTypingStatus] = useState<TypingStatus>('idle');

  // Initialize scroll handling
  const { messagesEndRef, scrollToBottom } = useScrollHandling(messages);

  // Initialize message handling
  const {
    input,
    setInput,
    isProcessing,
    typingStatus: messageTypingStatus,
    error: messageError,
    sendMessage: handleSendMessage,
    handleKeyDown,
    handleClearChat,
    retryLastMessage
  } = useMessageHandling(messages, setMessages, user?.id);

  // Initialize chat sessions
  const {
    chatSessions,
    isLoadingSessions,
    currentSession,
    saveChatHistory,
    loadChatSession,
    startNewChat
  } = useChatSessions(messages, setMessages, user?.id);

  // Initialize file analysis
  const { sendFileAnalysisRequest: handleFileAnalysisRequest } = useFileAnalysis(
    messages, 
    setMessages, 
    setTypingStatus, 
    handleSendMessage
  );

  // Sync errors and typing status from message handling
  useEffect(() => {
    setError(messageError);
    setTypingStatus(messageTypingStatus);
  }, [messageError, messageTypingStatus]);

  // Custom send message that also saves chat history
  const sendMessage = async () => {
    const newMessages = await handleSendMessage();
    if (newMessages) {
      // Save chat history after receiving AI response
      setTimeout(() => {
        saveChatHistory();
      }, 500);
    }
    return newMessages;
  };

  // Wrapper for file analysis that handles saving chat history
  const sendFileAnalysisRequest = async (filePath: string, fileContent: string) => {
    await handleFileAnalysisRequest(filePath, fileContent);
    // Save chat history after file analysis
    setTimeout(() => {
      saveChatHistory();
    }, 500);
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
    startNewChat,
    sendFileAnalysisRequest
  };
};
