
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ChatMessages from './ai-chat/ChatMessages';
import ProjectFilesPanel from './ai-chat/ProjectFilesPanel';
import FilePreviewPanel from './ai-chat/FilePreviewPanel';
import AdminActionsPanel from './ai-chat/AdminActionsPanel';
import EmptyChat from './ai-chat/EmptyChat';
import ErrorMessage from './ai-chat/ErrorMessage';
import ChatInput from './ai-chat/ChatInput';
import ChatSessionsList from './ai-chat/ChatSessionsList';

import { useFileManagement } from './ai-chat/hooks/file-management';
import { useChatLogic } from './ai-chat/hooks/useChatLogic';
import { useChatSessions } from './ai-chat/hooks/useChatSessions';
import { useScrollHandling } from './ai-chat/hooks/useScrollHandling';
import { useMessageHandling } from './ai-chat/hooks/useMessageHandling';

const AdminAiChat: React.FC = () => {
  // File management hooks
  const {
    files,
    isLoadingFiles,
    selectedFile,
    fileContent,
    isEditing,
    isLoadingContent,
    error: fileError,
    searchTerm,
    fileTypeFilters,
    setSearchTerm,
    setFileTypeFilters,
    setSelectedFile,
    setFileContent,
    setIsEditing,
    fetchFiles,
    fetchFileContent,
    saveFileContent,
    refreshFiles,
  } = useFileManagement();

  // Chat hooks
  const {
    messages,
    isTyping,
    error: chatError,
    analyzeFileWithAI,
    sendMessage,
    clearMessages,
    setMessages,
  } = useChatLogic({
    selectedFile,
    fileContent,
  });

  // Chat sessions hooks
  const {
    sessions,
    currentSession,
    isLoadingSessions,
    createNewSession,
    loadSession,
    deleteSession,
    renameSession,
  } = useChatSessions();

  // Message handling hooks
  const { handleSendMessage, handleSendFileAnalysisPrompt } = useMessageHandling({
    sendMessage,
    analyzeFileWithAI,
    selectedFile,
    fileContent,
  });

  // Scroll handling hooks
  const { messagesEndRef } = useScrollHandling(messages, isTyping);

  // Handle when user selects a file
  const handleFileSelect = async (filePath: string) => {
    // Save current file content if it's being edited
    if (selectedFile && isEditing) {
      await saveFileContent();
    }
    
    setSelectedFile(filePath);
    await fetchFileContent(filePath);
  };

  // Handle file analysis
  const handleAnalyzeWithAI = () => {
    if (!selectedFile) return;
    handleSendFileAnalysisPrompt();
  };

  // Handle saving the file
  const handleSaveFile = async () => {
    await saveFileContent();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AI Admin Assistant</h1>
      
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="files">Project Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sessions panel */}
            <div className="md:col-span-1">
              <ChatSessionsList 
                sessions={sessions}
                currentSession={currentSession}
                isLoading={isLoadingSessions}
                onCreateNewSession={createNewSession}
                onLoadSession={loadSession}
                onDeleteSession={deleteSession}
                onRenameSession={renameSession}
              />
              
              <div className="mt-4">
                <AdminActionsPanel />
              </div>
            </div>
            
            {/* Chat area */}
            <div className="md:col-span-3 flex flex-col h-[calc(100vh-250px)]">
              <Card className="flex-1 overflow-hidden">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                      <EmptyChat />
                    ) : (
                      <ChatMessages 
                        messages={messages} 
                        isTyping={isTyping} 
                        messagesEndRef={messagesEndRef} 
                      />
                    )}
                    
                    {chatError && <ErrorMessage error={chatError} />}
                  </div>
                  
                  <div className="p-4 border-t">
                    <ChatInput 
                      onSendMessage={handleSendMessage}
                      isTyping={isTyping}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="files" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* File browser */}
            <div className="md:col-span-1">
              <ProjectFilesPanel 
                onFileSelect={handleFileSelect} 
                selectedFile={selectedFile}
              />
            </div>
            
            {/* File preview */}
            <div className="md:col-span-3">
              {selectedFile ? (
                <FilePreviewPanel 
                  selectedFile={selectedFile}
                  fileContent={fileContent}
                  isLoadingContent={isLoadingContent}
                  setFileContent={setFileContent}
                  setIsEditing={setIsEditing}
                  handleSaveFile={handleSaveFile}
                  handleAnalyzeWithAI={handleAnalyzeWithAI}
                />
              ) : (
                <Card className="p-8 text-center text-muted-foreground">
                  <p>Select a file to preview and edit</p>
                </Card>
              )}
              
              {fileError && (
                <div className="mt-4">
                  <ErrorMessage error={fileError} />
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAiChat;
