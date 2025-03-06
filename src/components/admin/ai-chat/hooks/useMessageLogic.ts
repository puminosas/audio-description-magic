
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { FileInfo, ChatMessage } from '../types';
import useAIChat from './useAIChat';

export const useMessageLogic = (
  messages: ChatMessage[],
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setInput: React.Dispatch<React.SetStateAction<string>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const { sendMessage, sendFileAnalysisRequest } = useAIChat();

  const handleSendMessage = useCallback(async (message: string, selectedFilePath?: string) => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    // Create a new message object for the user's message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      text: message,
      isUserMessage: true,
      timestamp: new Date().toISOString()
    };
    
    // Add user message to chat
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    try {
      // Get AI response
      const response = await sendMessage(message, selectedFilePath);
      
      // Create AI response message object
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        text: response,
        isUserMessage: false,
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
  }, [sendMessage, setIsLoading, setError, setMessages, setInput]);

  const handleAnalyzeFile = useCallback(async (file: FileInfo) => {
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
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        text: analysisResult,
        isUserMessage: false,
        timestamp: new Date().toISOString()
      };
      
      // Add analysis to chat
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze file.');
    } finally {
      setIsLoading(false);
    }
  }, [sendFileAnalysisRequest, setIsLoading, setError, setMessages]);

  return {
    handleSendMessage,
    handleAnalyzeFile
  };
};

export default useMessageLogic;
