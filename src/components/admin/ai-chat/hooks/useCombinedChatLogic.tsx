
import { useRef, useEffect } from 'react';
import { useFileManagement } from './file-management';
import { useChatLogic } from './useChatLogic';
import { useChatSessions } from './useChatSessions';
import { useMessageHandling } from './useMessageHandling';
import { useScrollHandling } from './useScrollHandling';
import { Message } from '../types';

export const useCombinedChatLogic = () => {
  // Chat references
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // File management
  const fileManagement = useFileManagement();
  
  // Chat logic
  const chatLogic = useChatLogic({
    selectedFile: fileManagement.selectedFile,
    fileContent: fileManagement.fileContent
  });
  
  const messageHandling = useMessageHandling();
  const scrollHandling = useScrollHandling(messagesEndRef);
  
  // Chat sessions
  const chatSessions = useChatSessions(
    messageHandling.messages,
    messageHandling.setMessages
  );
  
  // Initialize files on component mount
  useEffect(() => {
    fileManagement.initializeFiles();
  }, []);
  
  // Analyze file with AI
  const analyzeWithAI = () => {
    if (!fileManagement.selectedFile || !fileManagement.fileContent) return;
    
    // Get file extension
    const fileExtension = fileManagement.selectedFile.split('.').pop()?.toLowerCase() || '';
    let fileType = 'text file';
    
    if (['js', 'jsx'].includes(fileExtension)) fileType = 'JavaScript file';
    if (['ts', 'tsx'].includes(fileExtension)) fileType = 'TypeScript file';
    if (['css', 'scss'].includes(fileExtension)) fileType = 'CSS/SCSS file';
    if (['html'].includes(fileExtension)) fileType = 'HTML file';
    if (['json'].includes(fileExtension)) fileType = 'JSON file';
    
    // Create analysis message
    const analysisPrompt = `Please analyze this ${fileType} located at \`${fileManagement.selectedFile}\` and provide suggestions for improvements or explain what it does:\n\`\`\`${fileExtension}\n${fileManagement.fileContent}\n\`\`\``;
    
    // Send the message
    messageHandling.sendMessage(analysisPrompt);
  };

  return {
    // Refs
    messagesEndRef,
    
    // File state and operations
    ...fileManagement,
    analyzeWithAI,
    
    // Chat state and operations
    messages: messageHandling.messages,
    setMessages: messageHandling.setMessages,
    input: messageHandling.input,
    setInput: messageHandling.setInput,
    isProcessing: messageHandling.isProcessing,
    typingStatus: messageHandling.typingStatus,
    error: messageHandling.error,
    sendMessage: messageHandling.sendMessage,
    handleKeyDown: messageHandling.handleKeyDown,
    handleClearChat: messageHandling.handleClearChat,
    retryLastMessage: messageHandling.retryLastMessage,
    
    // Chat session operations
    ...chatSessions,
    
    // Required by the UI components
    isTyping: messageHandling.isProcessing,
    chatError: messageHandling.error
  };
};
