
import { useState } from 'react';
import { Message } from '../../types';
import { ChatResponse, FileAnalysisResponse } from '../../types/api';
import { v4 as uuidv4 } from 'uuid';

interface UseFileAnalysisProps {
  addMessage: (message: Message) => void;
  setIsTyping: (typing: boolean) => void;
}

interface FileAnalysisReturn {
  sendFileAnalysisRequest: (filePath: string, fileContent: string) => Promise<void>;
  analyzeFileWithAI: (filePath: string, fileContent: string, query?: string, messageId?: string) => Promise<void>;
}

export const useFileAnalysis = ({ 
  addMessage, 
  setIsTyping 
}: UseFileAnalysisProps): FileAnalysisReturn => {
  const [error, setError] = useState<string | null>(null);

  const sendFileAnalysisRequest = async (filePath: string, fileContent: string) => {
    setIsTyping(true);
    setError(null);

    try {
      const fileName = filePath.split('/').pop() || filePath;
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

      const userMessageId = uuidv4();
      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        content: `Analyze the file ${fileName} for me and provide any insights or suggestions.`,
        createdAt: new Date().toISOString()
      };
      addMessage(userMessage);

      // Determine file type based on extension
      let fileType = 'unknown';
      if (['js', 'jsx', 'ts', 'tsx'].includes(fileExtension)) {
        fileType = 'JavaScript/TypeScript';
      } else if (['html', 'css', 'scss', 'sass'].includes(fileExtension)) {
        fileType = 'HTML/CSS';
      } else if (['json', 'xml', 'yaml', 'yml'].includes(fileExtension)) {
        fileType = 'Data Format';
      } else if (['md', 'txt', 'docx'].includes(fileExtension)) {
        fileType = 'Document';
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath,
          fileContent,
          fileType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze file');
      }

      const analysisData: FileAnalysisResponse = await response.json();

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: analysisData.analysis || 'Analysis completed.',
        createdAt: new Date().toISOString()
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('Error analyzing file:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `I encountered an error while analyzing the file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        createdAt: new Date().toISOString()
      };
      
      addMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const analyzeFileWithAI = async (filePath: string, fileContent: string, query?: string, messageId?: string) => {
    setIsTyping(true);
    setError(null);

    try {
      const fileName = filePath.split('/').pop() || filePath;
      
      // Use provided message ID or generate a new one
      const userMessageId = messageId || uuidv4();
      
      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        content: query || `Analyze the file ${fileName} for me and provide any insights or suggestions.`,
        createdAt: new Date().toISOString()
      };
      
      if (!messageId) {
        // Only add the message if we didn't receive an existing message ID
        addMessage(userMessage);
      }

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant that analyzes code and other files. A user has shared the file "${fileName}" with you and wants insights. The content of the file is provided below:\n\n${fileContent}`
            },
            {
              role: 'user',
              content: query || `Analyze the file ${fileName}. Explain what it does, identify any potential issues, and suggest improvements if applicable.`
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze file with AI');
      }

      const analysisData: ChatResponse = await response.json();

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: analysisData.content || 'Analysis completed.',
        createdAt: new Date().toISOString()
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('Error analyzing file with AI:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `I encountered an error while analyzing the file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        createdAt: new Date().toISOString()
      };
      
      addMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    sendFileAnalysisRequest,
    analyzeFileWithAI
  };
};

export default useFileAnalysis;
