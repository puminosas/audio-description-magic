
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCombinedChatLogic } from './ai-chat/hooks/useCombinedChatLogic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatInterface from './ai-chat/ChatInterface';
import FileExplorer from './ai-chat/FileExplorer';
import ChatSessionsList from './ai-chat/ChatSessionsList';

const AdminAiChat = () => {
  const { user } = useAuth();
  const {
    // Message handling
    messages,
    isTyping,
    chatError,
    sendMessage,
    retryLastMessage,
    
    // Chat sessions
    chatSessions,
    isLoadingSessions,
    currentSession,
    loadChatSession,
    startNewChat,
    deleteChatSession,
    
    // File state and operations
    selectedFile,
    fileContent,
    isLoadingContent,
    fileError,
    setFileContent,
    setIsEditing,
    handleFileSelect,
    handleSaveFile,
    handleAnalyzeWithAI,
    
    // Processing state
    isProcessing,
    
    // Scroll handling
    messagesEndRef
  } = useCombinedChatLogic(user?.id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* Chat History Sidebar */}
      <div className="md:col-span-3">
        <Card className="h-full">
          <CardHeader className="py-3">
            <CardTitle className="text-lg">Chat Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ChatSessionsList
              sessions={chatSessions}
              currentSessionId={currentSession}
              isLoading={isLoadingSessions}
              onCreateNewSession={startNewChat}
              onLoadSession={loadChatSession}
              onDeleteSession={deleteChatSession}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="md:col-span-9 space-y-4">
        <Tabs defaultValue="chat">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="space-y-4">
            <ChatInterface
              messages={messages}
              isTyping={isTyping}
              chatError={chatError}
              sendMessage={sendMessage}
              retryLastMessage={retryLastMessage}
              messagesEndRef={messagesEndRef}
              isLoading={isProcessing}
            />
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
              handleSaveFile={handleSaveFile}
              handleAnalyzeWithAI={handleAnalyzeWithAI}
              retryLastMessage={retryLastMessage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminAiChat;
