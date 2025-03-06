
import { useState } from 'react';
import { Message } from '../../types';
import { FileAnalysisRequest } from './types';

export const useFileAnalysis = (
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setTypingStatus: React.Dispatch<React.SetStateAction<string>>,
  handleSendMessage: (customMessages?: Message[]) => Promise<Message[] | null>
) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Request AI to analyze a file
  const sendFileAnalysisRequest = async (filePath: string, fileContent: string) => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    
    try {
      // Create a context message about the file type
      const fileExtension = filePath.split('.').pop()?.toLowerCase() || '';
      let fileType = 'text file';
      
      if (['js', 'jsx'].includes(fileExtension)) fileType = 'JavaScript file';
      if (['ts', 'tsx'].includes(fileExtension)) fileType = 'TypeScript file';
      if (['css', 'scss'].includes(fileExtension)) fileType = 'CSS/SCSS file';
      if (['html'].includes(fileExtension)) fileType = 'HTML file';
      if (['json'].includes(fileExtension)) fileType = 'JSON file';
      
      // Create a user message with the file analysis request
      // Format to make it clear in the chat that this is a file
      const userMessage: Message = {
        role: 'user',
        content: `Please analyze this ${fileType} located at \`${filePath}\` and provide suggestions for improvements or explain what it does:\n\`\`\`${fileExtension}\n${fileContent}\n\`\`\``,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      
      // Update state with the new message
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setTypingStatus('processing');
      
      // Now send the message to the AI
      const newMessages = await handleSendMessage(updatedMessages);
      if (newMessages) {
        // Save chat history after receiving AI response
        setTimeout(() => {
          // Note: saveChatHistory() needs to be called from the main hook
        }, 500);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    sendFileAnalysisRequest
  };
};
