
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message, TypingStatus } from '../types';

export const useMessageHandling = ({
  sendMessage,
  analyzeFileWithAI,
  selectedFile,
  fileContent,
}) => {
  const { toast } = useToast();

  // Handle sending a normal message
  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    sendMessage(message);
  };

  // Handle sending a file analysis request
  const handleSendFileAnalysisPrompt = () => {
    if (!selectedFile || !fileContent) {
      toast({
        title: 'Error',
        description: 'No file selected for analysis',
        variant: 'destructive',
      });
      return;
    }

    // Get file extension for context
    const fileExtension = selectedFile.split('.').pop()?.toLowerCase() || '';
    let fileType = 'text file';
    
    if (['js', 'jsx'].includes(fileExtension)) fileType = 'JavaScript file';
    if (['ts', 'tsx'].includes(fileExtension)) fileType = 'TypeScript file';
    if (['css', 'scss'].includes(fileExtension)) fileType = 'CSS/SCSS file';
    if (['html'].includes(fileExtension)) fileType = 'HTML file';
    if (['json'].includes(fileExtension)) fileType = 'JSON file';
    
    // Create analysis message
    const analysisPrompt = `Please analyze this ${fileType} located at \`${selectedFile}\` and provide suggestions for improvements or explain what it does:\n\`\`\`${fileExtension}\n${fileContent}\n\`\`\``;
    
    sendMessage(analysisPrompt);
  };

  return {
    handleSendMessage,
    handleSendFileAnalysisPrompt
  };
};

export default useMessageHandling;
