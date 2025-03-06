
import { useRef } from 'react';
import { useFileAnalysis } from './useChatLogic/useFileAnalysis';
import { useChatSessions } from './useChatSessions';
import { useMessageHandling } from './useMessageHandling';
import { useScrollHandling } from './useScrollHandling';
import { 
  useFileState, 
  useFileFilters, 
  useFileOperations 
} from './file-management';
import { FileInfo } from '../types';

/**
 * A hook that combines all the different chat logic hooks in one place
 */
export const useCombinedChatLogic = () => {
  // Message container reference for scrolling
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat sessions state and handlers
  const {
    chatSessions,
    currentSession,
    isLoadingSessions,
    saveChatHistory,
    loadChatSession,
    createNewChatSession,
    updateChatSession,
    deleteChatSession
  } = useChatSessions();

  // File management hooks
  const fileState = useFileState();
  const {
    files,
    selectedFile,
    isLoadingFiles,
    isLoadingFile,
    setSelectedFile,
    setFileError
  } = fileState;

  const { 
    filters, 
    filteredFiles, 
    setSearchQuery, 
    toggleTypeFilter, 
    resetFilters 
  } = useFileFilters(files);

  const { 
    getFiles, 
    getFileContent, 
    saveFileContent 
  } = useFileOperations(fileState);

  // Message handling hook
  const {
    messages,
    isTyping,
    chatError,
    sendMessage,
    handleUserMessageSubmit,
    addSystemMessage,
    addMessage,
    setChatError,
    setIsTyping,
    clearMessages
  } = useMessageHandling();

  // File analysis hook
  const { sendFileAnalysisRequest, analyzeFileWithAI } = useFileAnalysis({
    addMessage,
    setIsTyping
  });

  // Scroll handling hook
  const {
    scrollToBottom,
    handleScroll
  } = useScrollHandling(messageContainerRef, messagesEndRef, messages);

  // Function to handle selecting a file from the file explorer
  const handleFileSelect = async (filePath: string) => {
    try {
      await getFileContent(filePath);
    } catch (error) {
      console.error('Error selecting file:', error);
      setFileError(error instanceof Error ? error.message : 'Failed to load file');
    }
  };

  // Function to save a file
  const handleSaveFile = async (file: FileInfo, content: string) => {
    try {
      const success = await saveFileContent(file.path, content);
      if (success) {
        // Refresh the file content to show the saved changes
        await getFileContent(file.path);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving file:', error);
      setFileError(error instanceof Error ? error.message : 'Failed to save file');
      return false;
    }
  };

  // Function to analyze a file with AI
  const handleAnalyzeWithAI = async (file: FileInfo) => {
    if (!file || !file.content) {
      setFileError('No file selected or file has no content');
      return;
    }

    try {
      await analyzeFileWithAI(file.path, file.content);
    } catch (error) {
      console.error('Error analyzing file:', error);
      setFileError(error instanceof Error ? error.message : 'Failed to analyze file');
    }
  };

  return {
    // Chat messages and state
    messages,
    isTyping,
    chatError,
    
    // Chat session management
    chatSessions,
    currentSession,
    isLoadingSessions,
    saveChatHistory,
    loadChatSession,
    createNewChatSession,
    updateChatSession,
    deleteChatSession,
    
    // Message handling
    sendMessage,
    handleUserMessageSubmit,
    addSystemMessage,
    addMessage,
    setChatError,
    setIsTyping,
    clearMessages,
    
    // File management
    files,
    filteredFiles,
    selectedFile,
    isLoadingFiles,
    isLoadingFile,
    filters,
    setSearchQuery,
    toggleTypeFilter,
    resetFilters,
    getFiles,
    getFileContent,
    setSelectedFile,
    setFileError,
    
    // Combined operations
    handleFileSelect,
    handleSaveFile,
    handleAnalyzeWithAI,
    
    // File analysis
    sendFileAnalysisRequest,
    analyzeFileWithAI,
    
    // Scroll handling
    scrollToBottom,
    handleScroll,
    messageContainerRef,
    messagesEndRef
  };
};

export default useCombinedChatLogic;
