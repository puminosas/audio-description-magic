
import { useRef } from 'react';
import { Message } from '../types';
import { useMessageHandling } from './useMessageHandling';
import { useChatSessions } from './useChatSessions';
import { useScrollHandling } from './useScrollHandling';
import { useFileState, useFileFilters, useFileOperations } from './file-management';
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

  // File management - initialize with empty objects for now
  const fileState = useFileState();
  const fileFilters = useFileFilters(fileState.state.files);
  const fileOperations = useFileOperations();
  
  // File analysis with AI
  const { analyzeFileWithAI } = useFileAnalysis(sendMessage);

  // Scroll handling for chat
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { scrollToBottom } = useScrollHandling(messagesEndRef);

  // Auto-save chat history when messages change
  if (messages.length > 0 && currentSession) {
    saveChatHistory();
  }

  // Handle file selection
  const handleFileSelect = async (filePath: string) => {
    fileState.setSelectedFile(filePath);
    try {
      const content = await fileOperations.fetchFileContent(filePath);
      fileState.setFileContent(content);
    } catch (error) {
      fileState.setFileError(`Failed to load file: ${error.message}`);
    }
  };

  // Handle file save
  const handleSaveFile = async () => {
    if (fileState.state.selectedFile && fileState.state.fileContent) {
      await fileOperations.saveFileContent(
        fileState.state.selectedFile,
        fileState.state.fileContent
      );
    }
  };

  // Handle file analysis with AI
  const handleAnalyzeWithAI = async () => {
    if (fileState.state.selectedFile && fileState.state.fileContent) {
      await analyzeFileWithAI(
        fileState.state.selectedFile,
        fileState.state.fileContent
      );
    }
  };

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
    files: fileState.state.files,
    selectedFile: fileState.state.selectedFile,
    fileContent: fileState.state.fileContent,
    isLoadingContent: fileState.state.isLoadingContent,
    fileError: fileState.state.fileError,
    isEditing: fileState.state.isEditing,
    
    // File filters
    searchTerm: fileFilters.activeFilters.searchQuery,
    setSearchTerm: fileFilters.setSearchQuery,
    filteredFiles: fileFilters.applyFilters(fileState.state.files),
    
    // File operations
    fetchFiles: fileOperations.fetchFiles,
    handleFileSelect,
    setFileContent: fileState.setFileContent,
    setIsEditing: fileState.setIsEditing,
    handleSaveFile,
    handleAnalyzeWithAI,
    
    // Scroll handling
    messagesEndRef,
    scrollToBottom
  };
};
