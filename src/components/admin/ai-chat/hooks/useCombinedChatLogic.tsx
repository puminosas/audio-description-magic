
import { useState, useEffect } from 'react';
import { useFileState } from './file-management/useFileState';
import { useFileFilters } from './file-management/useFileFilters';
import useChatState from './useChatState';
import useFileLogic from './useFileLogic';
import useMessageLogic from './useMessageLogic';
import type { FileInfo } from '../types';

const useCombinedChatLogic = () => {
  // File Management State
  const {
    files,
    selectedFile,
    isLoadingFiles,
    isLoadingFile,
    fileError,
    setFiles,
    setSelectedFile,
    setIsLoadingFiles,
    setIsLoadingFile,
    setFileError
  } = useFileState();
  
  // Chat State 
  const { 
    messages, 
    setMessages, 
    input, 
    setInput, 
    isLoading, 
    setIsLoading, 
    error, 
    setError 
  } = useChatState();

  // File filters logic
  const { 
    filters, 
    filteredFiles, 
    setSearchQuery, 
    toggleTypeFilter, 
    resetFilters 
  } = useFileFilters(files);

  // File operations logic
  const { 
    getFiles, 
    handleFileSelect, 
    handleSaveFile 
  } = useFileLogic(
    files,
    setFiles,
    selectedFile,
    setSelectedFile,
    setIsLoadingFile,
    setFileError
  );

  // Message handling logic
  const { 
    handleSendMessage, 
    handleAnalyzeFile 
  } = useMessageLogic(
    messages,
    setMessages,
    setInput,
    setIsLoading,
    setError
  );

  // Initialize files when component mounts
  useEffect(() => {
    setIsLoadingFiles(true);
    getFiles().finally(() => setIsLoadingFiles(false));
  }, [getFiles, setIsLoadingFiles]);

  // Wrap the sendMessage handler to include selected file path
  const sendMessageWithContext = (message: string) => {
    handleSendMessage(message, selectedFile?.path);
  };

  return {
    // File Management
    files: filteredFiles,
    selectedFile,
    isLoadingFiles,
    isLoadingFile,
    fileError,
    getFiles,
    handleFileSelect,
    setSearchQuery,
    toggleTypeFilter,
    resetFilters,
    filters,

    // Chat State
    messages,
    input,
    isLoading,
    error,
    setInput,

    // AI Chat
    handleSendMessage: sendMessageWithContext,
    handleAnalyzeFile,
    handleSaveFile,
  };
};

export default useCombinedChatLogic;
