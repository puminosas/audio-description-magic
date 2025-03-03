
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Message, TypingStatus } from '../types';
import { useMessageHandling } from './useMessageHandling';
import { useChatSessions } from './useChatSessions';
import { useScrollHandling } from './useScrollHandling';

export const useChatLogic = () => {
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
  };

  // Request AI to analyze a file
  const sendFileAnalysisRequest = async (filePath: string, fileContent: string) => {
    if (isProcessing) return;
    
    // Create a context message about the file type
    const fileExtension = filePath.split('.').pop()?.toLowerCase() || '';
    let fileType = 'text file';
    
    if (['js', 'jsx'].includes(fileExtension)) fileType = 'JavaScript file';
    if (['ts', 'tsx'].includes(fileExtension)) fileType = 'TypeScript file';
    if (['css', 'scss'].includes(fileExtension)) fileType = 'CSS/SCSS file';
    if (['html'].includes(fileExtension)) fileType = 'HTML file';
    if (['json'].includes(fileExtension)) fileType = 'JSON file';
    
    // Create a user message with the file analysis request
    // Format to make it clear in the chat that this is a file
    const userMessage: Message = {
      role: 'user',
      content: `Please analyze this ${fileType} located at \`${filePath}\` and provide suggestions for improvements or explain what it does:\n\`\`\`${fileExtension}\n${fileContent}\n\`\`\``,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    // Update state with the new message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setTypingStatus('processing');
    
    // Now send the message to the AI
    const newMessages = await handleSendMessage(updatedMessages);
    if (newMessages) {
      // Save chat history after receiving AI response
      setTimeout(() => {
        saveChatHistory();
      }, 500);
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
    startNewChat,
    sendFileAnalysisRequest
  };
};
