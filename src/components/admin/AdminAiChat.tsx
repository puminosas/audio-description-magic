
import React from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import useCombinedChatLogic from './ai-chat/hooks/useCombinedChatLogic';
import ChatInterface from './ai-chat/components/ChatInterface';
import FileFiltersComponent from './ai-chat/components/FileFiltersComponent';
import FileList from './ai-chat/components/FileList';
import { FileInfo } from './ai-chat/types';

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
    <div className="container mx-auto h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">AI Chat Interface</h1>

      <div className="flex flex-grow">
        <div className="w-1/4 p-4 border-r">
          <h3 className="text-lg font-semibold mb-2">File Management</h3>
          <FileFiltersComponent
            filters={filters}
            setSearchQuery={setSearchQuery}
            toggleTypeFilter={toggleTypeFilter}
            resetFilters={resetFilters}
          />
          <FileList
            files={files}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
          />
        </div>

        <div className="flex-grow flex flex-col">
          <ChatInterface 
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            selectedFile={selectedFile as FileInfo}
            onSaveFile={handleSaveFile}
            onAnalyzeFile={handleAnalyzeFile}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminAiChat;
