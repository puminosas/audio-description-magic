
import React from 'react';
import { Card } from "@/components/ui/card";
import useCombinedChatLogic from './ai-chat/hooks/useCombinedChatLogic';
import ChatInterface from './ai-chat/components/ChatInterface';
import FileFiltersComponent from './ai-chat/components/FileFiltersComponent';
import FileList from './ai-chat/components/FileList';
import type { FileInfo } from './ai-chat/types';

interface AdminAiChatProps {
  // Define any props here
}

const AdminAiChat: React.FC<AdminAiChatProps> = () => {
  const {
    messages,
    isLoading,
    error,
    handleSendMessage,
    handleFileSelect,
    handleSaveFile,
    handleAnalyzeFile,
    files,
    selectedFile,
    filters,
    setSearchQuery,
    toggleTypeFilter,
    resetFilters,
  } = useCombinedChatLogic();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chat Assistant</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
        {/* File sidebar */}
        <Card className="p-4 md:col-span-1 overflow-hidden flex flex-col bg-background">
          <h3 className="text-lg font-semibold mb-3">File Management</h3>
          <div className="mb-3">
            <FileFiltersComponent
              filters={filters}
              setSearchQuery={setSearchQuery}
              toggleTypeFilter={toggleTypeFilter}
              resetFilters={resetFilters}
            />
          </div>
          <div className="flex-grow overflow-auto">
            <FileList
              files={files}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
            />
          </div>
        </Card>

        {/* Chat interface */}
        <Card className="p-4 md:col-span-3 h-full flex flex-col overflow-hidden bg-background">
          <ChatInterface 
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            selectedFile={selectedFile as FileInfo}
            onSaveFile={handleSaveFile}
            onAnalyzeFile={handleAnalyzeFile}
            error={error}
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminAiChat;
