
import { useState, useCallback } from 'react';
import { useFileState } from './file-management/useFileState';
import { useFileFilters } from './file-management/useFileFilters';
import { useFileOperations } from './file-management/useFileOperations';
import { useChatState } from './useChatState';
import { useAIChat } from './useAIChat';
import type { FileInfo } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
  const { sendMessage, sendFileAnalysisRequest } = aiChat;

  // Combined Logic
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    // Create a new message object for the user's message
    const userMessage = {
      id: uuidv4(),
      text: message,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    // Add user message to chat
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    try {
      // Get AI response
      const response = await sendMessage(message, selectedFile?.path);
      
      // Create AI response message object
      const aiMessage = {
        id: uuidv4(),
        text: response,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      // Add AI response to chat
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      
      // Clear input field
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
      // Only fetch content if not already loaded
      if (!file.content) {
        await fileOperations.getFileContent(file.path);
      }
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Failed to load file content.');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleAnalyzeFile = async (file: FileInfo) => {
    if (!file || !file.content) {
      setError('No file content available for analysis');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Send file for AI analysis
      const analysisResult = await sendFileAnalysisRequest(file.path, file.content);
      
      // Create AI analysis message
      const aiMessage = {
        id: uuidv4(),
        text: analysisResult,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      // Add analysis to chat
      setMessages(prevMessages => [...prevMessages, aiMessage]);
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
      // Save file content
      const success = await fileOperations.saveFileContent(file.path, content);
      
      if (success) {
        // Update files list with new content
        const updatedFiles = files.map(f => 
          f.path === file.path ? { ...f, content } : f
        );
        
        setFiles(updatedFiles);
        
        // Update selected file
        if (selectedFile && selectedFile.path === file.path) {
          setSelectedFile({ ...file, content });
        }
        
        return true;
      } else {
        setFileError('Failed to save file content.');
        return false;
      }
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Failed to save file.');
      return false;
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Initialize files when hook is first used
  useCallback(() => {
    fileOperations.getFiles();
  }, []);

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
    handleAnalyzeFile,
    handleSaveFile,
  };
};

export default useCombinedChatLogic;
