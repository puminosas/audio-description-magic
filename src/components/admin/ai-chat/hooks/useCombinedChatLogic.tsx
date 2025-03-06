import { useState, useCallback } from 'react';
import { useFileState } from './file-management/useFileState';
import { useFileFilters } from './file-management/useFileFilters';
import { useFileOperations } from './file-management/useFileOperations';
import { useChatState } from './useChatState';
import { useAIChat } from './useAIChat';
import type { FileInfo } from '../../types';

const useCombinedChatLogic = () => {
  // File Management Logic
  const fileState = useFileState();
  const { files, setFiles, selectedFile, setSelectedFile, isLoadingFiles, setIsLoadingFiles, isLoadingFile, setIsLoadingFile, fileError, setFileError } = fileState;
  const fileOperations = useFileOperations(
    setFiles,
    setSelectedFile,
    setIsLoadingFiles,
    setIsLoadingFile,
    setFileError
  );

  const { filters, filteredFiles, setSearchQuery, toggleTypeFilter, resetFilters } = useFileFilters(files);

  // Chat State Logic
  const chatState = useChatState();
  const { messages, setMessages, input, setInput, isLoading, setIsLoading, error, setError } = chatState;

  // AI Chat Logic
  const aiChat = useAIChat();
  const { sendMessage } = aiChat;

  // Combined Logic
  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sendMessage(message, selectedFile?.path);
      setMessages(prevMessages => [...prevMessages, { text: message, isUser: true }, { text: response, isUser: false }]);
      setInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file: FileInfo) => {
    setSelectedFile(file);
    setIsLoadingFile(true);
    setFileError(null);
    try {
      await fileOperations.getFileContent(file.path);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Failed to load file content.');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const analyzeFileWithAI = async (filePath: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (selectedFile && selectedFile.content) {
        await aiChat.sendFileAnalysisRequest(selectedFile.path, selectedFile.content);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFile = async (file: FileInfo, content: string) => {
    setIsLoadingFile(true);
    setFileError(null);
    try {
      const success = await fileOperations.saveFileContent(file.path, content);
      if (success) {
        // Update the file content in the local state
        setFiles(prevFiles =>
          prevFiles.map(f => (f.path === file.path ? { ...f, content } : f))
        );
        setSelectedFile({ ...file, content });
        return true; // Indicate success
      } else {
        setFileError('Failed to save file content.');
        return false; // Indicate failure
      }
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Failed to save file.');
      return false; // Indicate failure
    } finally {
      setIsLoadingFile(false);
    }
  };

  return {
    // File Management
    files: filteredFiles,
    selectedFile,
    isLoadingFiles,
    isLoadingFile,
    fileError,
    getFiles: fileOperations.getFiles,
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
    handleSendMessage,
    analyzeFileWithAI,
    handleSaveFile,
  };
};

export default useCombinedChatLogic;
