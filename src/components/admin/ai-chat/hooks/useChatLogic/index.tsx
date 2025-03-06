
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Message, TypingStatus } from '../../types';

interface UseChatLogicProps {
  selectedFile: string | null;
  fileContent: string;
}

export const useChatLogic = ({ selectedFile, fileContent }: UseChatLogicProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Send a message to the AI
  const sendMessage = useCallback(async (messageContent?: string) => {
    if (isProcessing) return null;
    
    let updatedMessages = [...messages];
    
    // Add user message if provided
    if (messageContent) {
      const userMessage: Message = {
        role: 'user', 
        content: messageContent,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
    }
    
    setIsProcessing(true);
    setIsTyping(true);
    setError(null);
    
    try {
      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages,
          userId: user?.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const data = await response.json();
      
      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      
      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);
      
      return newMessages;
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Error: ${error.message}`);
      return null;
    } finally {
      setIsProcessing(false);
      setIsTyping(false);
    }
  }, [messages, isProcessing, user]);

  // Analyze a file with AI
  const analyzeFileWithAI = useCallback(async () => {
    if (!selectedFile || !fileContent) return;
    
    // Get file extension
    const fileExtension = selectedFile.split('.').pop()?.toLowerCase() || '';
    let fileType = 'text file';
    
    if (['js', 'jsx'].includes(fileExtension)) fileType = 'JavaScript file';
    if (['ts', 'tsx'].includes(fileExtension)) fileType = 'TypeScript file';
    if (['css', 'scss'].includes(fileExtension)) fileType = 'CSS/SCSS file';
    if (['html'].includes(fileExtension)) fileType = 'HTML file';
    if (['json'].includes(fileExtension)) fileType = 'JSON file';
    
    // Create analysis message
    const analysisPrompt = `Please analyze this ${fileType} located at \`${selectedFile}\` and provide suggestions for improvements or explain what it does:\n\`\`\`${fileExtension}\n${fileContent}\n\`\`\``;
    
    // Send the message
    await sendMessage(analysisPrompt);
  }, [selectedFile, fileContent, sendMessage]);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    setMessages,
    isTyping,
    isProcessing,
    error,
    analyzeFileWithAI,
    sendMessage,
    clearMessages
  };
};
