
import { useState } from 'react';
import { Message } from '../../types';

export const useFileAnalysis = (sendMessage: (message: string) => void) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Request AI to analyze a file
  const analyzeFileWithAI = async (filePath: string, fileContent: string) => {
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
      
      // Format to make it clear in the chat that this is a file
      const message = `Please analyze this ${fileType} located at \`${filePath}\` and provide suggestions for improvements or explain what it does:\n\`\`\`${fileExtension}\n${fileContent}\n\`\`\``;
      
      // Send the message to the AI
      sendMessage(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeFileWithAI
  };
};
