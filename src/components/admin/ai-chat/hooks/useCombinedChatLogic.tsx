
import { useRef } from 'react';
import { Message } from '../types';
import { useMessageHandling } from './useMessageHandling';
import { useChatSessions } from './useChatSessions';
import { useScrollHandling } from './useScrollHandling';
import { 
  useFileState, 
  useFileFilters, 
  useFileOperations 
} from './file-management';
import { useFileAnalysis } from './useChatLogic/useFileAnalysis';

export const useCombinedChatLogic = (userId?: string | null) => {
  // Messaging state and handlers
  const {
    messages,
    setMessages,
    input,
    setInput,
    isProcessing,
    typingStatus,
    error: chatError,
    sendMessage,
    handleKeyDown,
    handleClearChat,
    retryLastMessage
  } = useMessageHandling();

  // Chat sessions management
  const {
    chatSessions,
    isLoadingSessions,
    currentSession,
    saveChatHistory,
    loadChatSession,
    startNewChat,
    deleteChatSession
  } = useChatSessions(messages, setMessages, userId);

  // File management
  const fileState = useFileState();
  const fileFilters = useFileFilters(fileState.files);
  const fileOperations = useFileOperations(fileState, sendMessage);
  
  // File analysis with AI
  const { analyzeFileWithAI } = useFileAnalysis(sendMessage);

  // Enhanced file operations with AI analysis
  const enhancedFileOperations = {
    ...fileOperations,
    handleAnalyzeWithAI: async () => {
      if (fileState.selectedFile && fileState.fileContent) {
        await analyzeFileWithAI(fileState.selectedFile, fileState.fileContent);
      }
    }
  };

  // Scroll handling for chat
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { scrollToBottom } = useScrollHandling(messagesEndRef);

  // Auto-save chat history when messages change
  if (messages.length > 0 && currentSession) {
    saveChatHistory();
  }

  return {
    // Message handling
    messages,
    input,
    setInput,
    isProcessing,
    isTyping: typingStatus === 'typing',
    chatError,
    sendMessage,
    handleKeyDown,
    handleClearChat,
    retryLastMessage,
    
    // Chat sessions
    chatSessions,
    isLoadingSessions,
    currentSession,
    saveChatHistory,
    loadChatSession,
    startNewChat,
    deleteChatSession,
    
    // File state
    files: fileState.files,
    selectedFile: fileState.selectedFile,
    fileContent: fileState.fileContent,
    isLoadingContent: fileState.isLoading,
    fileError: fileState.fileError,
    isEditing: fileState.isEditing,
    
    // File filters
    searchTerm: fileFilters.searchTerm,
    setSearchTerm: fileFilters.setSearchTerm,
    filteredFiles: fileFilters.filteredFiles,
    
    // File operations
    fetchFiles: enhancedFileOperations.fetchFiles,
    handleFileSelect: enhancedFileOperations.handleFileSelect,
    setFileContent: enhancedFileOperations.setFileContent,
    setIsEditing: enhancedFileOperations.setIsEditing,
    handleSaveFile: enhancedFileOperations.handleSaveFile,
    handleAnalyzeWithAI: enhancedFileOperations.handleAnalyzeWithAI,
    
    // Scroll handling
    messagesEndRef,
    scrollToBottom
  };
};
