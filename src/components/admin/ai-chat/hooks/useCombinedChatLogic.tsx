
import { useRef } from 'react';
import { useFileState } from './file-management/useFileState';
import { useFileOperations } from './file-management/useFileOperations';
import useChatLogic from './useChatLogic';
import useChatSessions from './useChatSessions';
import useMessageHandling from './useMessageHandling';
import useScrollHandling from './useScrollHandling';

export const useCombinedChatLogic = () => {
  // Chat references
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // File management
  const fileState = useFileState();
  const fileOperations = useFileOperations();
  
  // Chat logic
  const chatLogic = useChatLogic();
  const chatSessions = useChatSessions();
  const messageHandling = useMessageHandling();
  const scrollHandling = useScrollHandling(messagesEndRef);
  
  // Handle file selection
  const handleFileSelect = async (filePath: string) => {
    // Save current file content if it's being edited
    if (fileState.selectedFile && fileState.isEditing) {
      await fileOperations.saveFileContent(fileState.selectedFile, fileState.fileContent);
    }
    
    fileState.setSelectedFile(filePath);
    const content = await fileOperations.fetchFileContent(filePath);
    fileState.setFileContent(content);
  };
  
  // Analyze file with AI
  const analyzeFileWithAI = () => {
    if (!fileState.selectedFile || !fileState.fileContent) return;
    
    // Get file extension
    const fileExtension = fileState.selectedFile.split('.').pop()?.toLowerCase() || '';
    let fileType = 'text file';
    
    if (['js', 'jsx'].includes(fileExtension)) fileType = 'JavaScript file';
    if (['ts', 'tsx'].includes(fileExtension)) fileType = 'TypeScript file';
    if (['css', 'scss'].includes(fileExtension)) fileType = 'CSS/SCSS file';
    if (['html'].includes(fileExtension)) fileType = 'HTML file';
    if (['json'].includes(fileExtension)) fileType = 'JSON file';
    
    // Create analysis message
    const analysisPrompt = `Please analyze this ${fileType} located at \`${fileState.selectedFile}\` and provide suggestions for improvements or explain what it does:\n\`\`\`${fileExtension}\n${fileState.fileContent}\n\`\`\``;
    
    // Send the message
    messageHandling.sendMessage(analysisPrompt);
  };

  return {
    // Refs
    messagesEndRef,
    
    // File state and operations
    ...fileState,
    ...fileOperations,
    handleFileSelect,
    analyzeWithAI: analyzeFileWithAI,
    
    // Chat state and operations
    ...chatLogic,
    ...chatSessions,
    ...messageHandling,
    ...scrollHandling,
    
    // Required by the UI components
    isTyping: messageHandling.isProcessing,
    retryLastMessage: messageHandling.retryLastMessage
  };
};
