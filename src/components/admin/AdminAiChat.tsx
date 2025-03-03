
import React from 'react';
import { Card } from '@/components/ui/card';
import ErrorAlert from '@/components/generator/ErrorAlert';
import ChatMessages from './ai-chat/ChatMessages';
import ProjectFilesPanel from './ai-chat/ProjectFilesPanel';
import FilePreviewPanel from './ai-chat/FilePreviewPanel';
import AdminActionsPanel from './ai-chat/AdminActionsPanel';
import ChatSessionsList from './ai-chat/ChatSessionsList';
import { useChatLogic } from './ai-chat/hooks/useChatLogic';
import { useFileManagement } from './ai-chat/hooks/useFileManagement';
import ChatInput from './ai-chat/ChatInput';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const AdminAiChat = () => {
  const { 
    input, 
    setInput, 
    messages, 
    isProcessing, 
    typingStatus,
    error, 
    messagesEndRef, 
    chatSessions,
    isLoadingSessions,
    currentSession,
    sendMessage, 
    handleKeyDown, 
    handleClearChat,
    retryLastMessage,
    loadChatSession,
    startNewChat,
    sendFileAnalysisRequest
  } = useChatLogic();

  const {
    files,
    filteredFiles,
    isLoadingFiles,
    selectedFile,
    fileContent,
    isEditing,
    isLoadingContent,
    isRefreshingFiles,
    searchTerm,
    fileTypeFilters,
    uniqueFileTypes,
    setSearchTerm,
    setFileContent,
    setIsEditing,
    setFileTypeFilters,
    fetchFiles,
    handleFileSelect,
    handleSaveFile,
    handleAnalyzeWithAI: requestFileAnalysis,
    toggleFileTypeFilter
  } = useFileManagement();

  // Connect the file analysis request to the chat logic
  const handleAnalyzeWithAI = () => {
    if (selectedFile && fileContent) {
      sendFileAnalysisRequest(selectedFile, fileContent);
      requestFileAnalysis();
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      {/* Left side: Chat history sidebar and chat interface */}
      <div className="col-span-1 md:col-span-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-8">
          {/* Chat history sidebar */}
          <div className="col-span-1 md:col-span-2">
            <Card className="h-[600px] overflow-hidden p-3">
              <ChatSessionsList 
                sessions={chatSessions}
                currentSessionId={currentSession}
                isLoading={isLoadingSessions}
                onSessionSelect={loadChatSession}
                onNewChat={startNewChat}
              />
            </Card>
          </div>
          
          {/* Chat interface */}
          <div className="col-span-1 md:col-span-6">
            <Card className="flex h-[600px] flex-col overflow-hidden p-4">
              {/* Connection error message */}
              {!isProcessing && error && error.includes("Failed to send") && (
                <div className="mb-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>
                      Could not connect to the AI service. Please try again later or contact support.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              {/* Messages container */}
              <ChatMessages 
                messages={messages} 
                isProcessing={isProcessing}
                typingStatus={typingStatus}
                messagesEndRef={messagesEndRef}
                error={error}
                retryLastMessage={retryLastMessage}
              />

              {/* Input area */}
              <ChatInput
                input={input}
                setInput={setInput}
                handleKeyDown={handleKeyDown}
                sendMessage={sendMessage}
                isProcessing={isProcessing}
                typingStatus={typingStatus}
                messages={messages}
                handleClearChat={handleClearChat}
                startNewChat={startNewChat}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Right side: Project files and user info */}
      <div className="col-span-1 md:col-span-4">
        <div className="space-y-6">
          {/* Project files */}
          <ProjectFilesPanel 
            files={files}
            filteredFiles={filteredFiles}
            uniqueFileTypes={uniqueFileTypes}
            fileTypeFilters={fileTypeFilters}
            isLoadingFiles={isLoadingFiles}
            isRefreshingFiles={isRefreshingFiles}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            toggleFileTypeFilter={toggleFileTypeFilter}
            setFileTypeFilters={setFileTypeFilters}
            fetchFiles={fetchFiles}
            handleFileSelect={handleFileSelect}
          />

          {/* File editing */}
          {isEditing && selectedFile && (
            <FilePreviewPanel 
              selectedFile={selectedFile}
              fileContent={fileContent}
              isLoadingContent={isLoadingContent}
              setFileContent={setFileContent}
              setIsEditing={setIsEditing}
              handleSaveFile={handleSaveFile}
              handleAnalyzeWithAI={handleAnalyzeWithAI}
            />
          )}

          {/* Admin actions */}
          <AdminActionsPanel />
        </div>
      </div>
    </div>
  );
};

export default AdminAiChat;
