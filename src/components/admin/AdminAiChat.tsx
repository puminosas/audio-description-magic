
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatInterface from './ai-chat/ChatInterface';
import FileExplorer from './ai-chat/FileExplorer';
import ChatSessionsList from './ai-chat/ChatSessionsList';
import AdminActionsPanel from './ai-chat/AdminActionsPanel';
import { useCombinedChatLogic } from './ai-chat/hooks/useCombinedChatLogic';

const AdminAiChat: React.FC = () => {
  const {
    // File management
    selectedFile,
    fileContent,
    isLoadingContent,
    fileError,
    handleFileSelect,
    setFileContent,
    isEditing,
    setIsEditing,
    saveFileContent,
    
    // Chat management
    messages,
    isTyping,
    chatError,
    messagesEndRef,
    sendMessage,
    retryLastMessage,
    analyzeWithAI,
    
    // Session management
    chatSessions,
    currentSession,
    isLoadingSessions,
    startNewChat,
    loadChatSession,
    deleteChatSession
  } = useCombinedChatLogic();

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
                sessions={chatSessions}
                currentSessionId={currentSession}
                isLoading={isLoadingSessions}
                onCreateNewSession={startNewChat}
                onLoadSession={loadChatSession}
                onDeleteSession={deleteChatSession}
                onRenameSession={(id, title) => console.log('Rename session', id, title)}
              />
              
              <div className="mt-4">
                <AdminActionsPanel />
              </div>
            </div>
            
            {/* Chat area */}
            <div className="md:col-span-3 flex flex-col h-[calc(100vh-250px)]">
              <ChatInterface 
                messages={messages}
                isTyping={isTyping}
                chatError={chatError}
                sendMessage={sendMessage}
                retryLastMessage={retryLastMessage}
                messagesEndRef={messagesEndRef}
                isLoading={isTyping}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="files" className="space-y-4">
          <FileExplorer 
            selectedFile={selectedFile}
            fileContent={fileContent}
            isLoadingContent={isLoadingContent}
            fileError={fileError}
            handleFileSelect={handleFileSelect}
            setFileContent={setFileContent}
            setIsEditing={setIsEditing}
            handleSaveFile={() => saveFileContent(selectedFile, fileContent)}
            handleAnalyzeWithAI={analyzeWithAI}
            retryLastMessage={retryLastMessage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAiChat;
