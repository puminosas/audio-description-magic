
import { useState, useRef } from 'react';
import { useFileAnalysis } from './useChatLogic/useFileAnalysis';
import { useChatSessions } from './useChatSessions';
import { useMessageHandling } from './useMessageHandling';
import { useScrollHandling } from './useScrollHandling';
import { 
  useFileState, 
  useFileFilters, 
  useFileOperations,
  type FileInfo
} from './file-management';

/**
 * A hook that combines all the different chat logic hooks in one place
 */
export const useCombinedChatLogic = (userId?: string) => {
  // Message container reference for scrolling
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Chat sessions state and handlers
  const {
    chatSessions,
    currentSession,
    isLoadingSessions,
    saveChatHistory,
    loadChatSession,
    startNewChat,
    deleteChatSession
  } = useChatSessions(userId);

  // File management hooks
  const fileState = useFileState();
  const {
    files,
    selectedFile,
    isLoadingFiles,
    isLoadingFile,
    fileError,
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
    input,
    setInput,
    isProcessing,
    typingStatus: isTyping,
    error: chatError,
    sendMessage,
    handleKeyDown,
    handleClearChat,
    retryLastMessage
  } = useMessageHandling();

  // File analysis hook
  const { sendFileAnalysisRequest } = useFileAnalysis({
    addMessage: (message) => {
      const { messages: currentMessages, setMessages } = useMessageHandling();
      setMessages([...currentMessages, message]);
    },
    setIsTyping: (typing) => {
      // Just use the typing status
    }
  });

  // Define analyzeFileWithAI function
  const analyzeFileWithAI = async (filePath: string, content: string) => {
    try {
      await sendFileAnalysisRequest(filePath, content);
    } catch (error) {
      console.error('Error analyzing file with AI:', error);
      setFileError(error instanceof Error ? error.message : 'Failed to analyze file');
    }
  };

  // Scroll handling hook
  const { scrollToBottom } = useScrollHandling(messageContainerRef, messagesEndRef);

  // Function to handle selecting a file from the file explorer
  const handleFileSelect = async (filePath: string) => {
    try {
      setIsLoadingContent(true);
      await getFileContent(filePath);
      setIsLoadingContent(false);
    } catch (error) {
      console.error('Error selecting file:', error);
      setFileError(error instanceof Error ? error.message : 'Failed to load file');
      setIsLoadingContent(false);
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
    input,
    setInput,
    isProcessing,
    isTyping,
    chatError,
    
    // Chat session management
    chatSessions,
    currentSession,
    isLoadingSessions,
    loadChatSession,
    startNewChat,
    deleteChatSession,
    
    // Message handling
    sendMessage,
    handleKeyDown,
    handleClearChat,
    retryLastMessage,
    
    // File management
    files,
    filteredFiles,
    selectedFile,
    isLoadingFiles,
    isLoadingFile,
    fileContent,
    setFileContent,
    isLoadingContent,
    fileError,
    filters,
    setSearchQuery,
    toggleTypeFilter,
    resetFilters,
    getFiles,
    setIsEditing,
    
    // Combined operations
    handleFileSelect,
    handleSaveFile,
    handleAnalyzeWithAI,
    
    // Scroll handling
    scrollToBottom,
    messageContainerRef,
    messagesEndRef
  };
};

export default useCombinedChatLogic;
